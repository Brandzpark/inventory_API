const PurchaseOrder = require("../models/PurchaseOrder");
const PurchaseOrderStockReturn = require("../models/PurchaseOrderStockReturn");
const PurchaseOrderReceived = require("../models/PurchaseOrderReceived");
const Product = require("../models/Product");

const userResource = require("../resources/userResource");
const { formatNumberWithPrefix, isPositiveNumber } = require('../helper')
const { ValidationException } = require("../exceptions");
const { now, isValidObjectId } = require("mongoose");

exports.getAll = async () => {
  try {
    return {
      data: await PurchaseOrderStockReturn.find({ deletedAt: null }),
    };
  } catch (error) {
    throw new ValidationException(error);
  }
};

exports.findById = async (data) => {
  if (!data?.id) {
    throw new ValidationException("Missing parameter");
  }

  if (!isValidObjectId(data?.id)) {
    throw new ValidationException("Invalid object ID");
  }

  try {
    return {
      data: await PurchaseOrderStockReturn.findOne({ _id: data?.id, deletedAt: null }),
    };
  } catch (error) {
    throw new ValidationException(error);
  }
};

exports.create = async (req, user) => {
  let errorObject = {};

  const stockReturn = await PurchaseOrderStockReturn.findOne({
    code: req?.code,
  }).lean();

  if (stockReturn) {
    errorObject = {
      ...errorObject,
      code: `\"${req?.code}\" code already taken`,
    };
  }

  const purchaseOrder = await PurchaseOrder.findOne({ code: req.purchaseOrderCode, deletedAt: null })
  if (!purchaseOrder) {
    errorObject = { ...errorObject, code: "Invalid Purchase order" };
  }

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  const purchaseOrderReceived = await PurchaseOrderReceived.find({ purchaseOrderCode: req.purchaseOrderCode, deletedAt: null })

  if (purchaseOrderReceived?.length == 0) {
    errorObject = { ...errorObject, purchaseOrderReceived: "No Purchase Order Receives" };
  }

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  const history = [...purchaseOrder?.history];

  const historyItem = {
    event: `Stock Return ${req?.code} Create`,
    user: userResource.logResource(user),
    timestamps: now(),
  };

  history.push(historyItem);

  const subTotal = req?.items?.reduce((acc, curr) => {
    return acc + parseFloat(curr?.quantity) * parseFloat(curr?.rate);
  }, 0);

  for (let index = 0; index < req.items.length; index++) {
    const returnItem = req.items[index];
    const receivedItems = purchaseOrderReceived?.map(row => row?.items)?.flat()?.filter(row => row?.code == returnItem?.code)

    if (receivedItems?.length == 0) {
      errorObject = {
        ...errorObject,
        [`items.${index}.code`]:
          "no receive item found",
      };
    }

    if (receivedItems?.length > 0) {

      const currentCreatedReturns = await PurchaseOrderStockReturn.find({ purchaseOrderCode: req?.purchaseOrderCode }).lean()
      let itemExist = [];
      currentCreatedReturns?.map((row) =>
        row?.items?.find((itemRow) => {
          if (itemRow?.code === returnItem?.code) {
            itemExist.push(itemRow);
          }
        })
      );

      const currentTotalReturnedQuantity = itemExist?.reduce(
        (acc, curr) => {
          return acc + parseFloat(curr?.quantity);
        },
        0
      );

      const newTotal =
        currentTotalReturnedQuantity + parseFloat(returnItem?.quantity);


      const totalReceivedQuantity = receivedItems?.reduce((acc, curr) => {
        return acc + parseInt(curr?.receivedQuantity)
      }, 0)

      if (totalReceivedQuantity < newTotal) {
        errorObject = {
          ...errorObject,
          [`items.${index}.quantity`]:
            "return quantity cannot be greater than received quantity.",
        };
      }
    }
  }

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  for (let index = 0; index < req.items.length; index++) {
    const returnItem = req.items[index];
    const product = await Product.findOne({ code: returnItem.code }).lean()
    if (product) {
      const historyData = [...product.history]
      const newHistoryItem = {
        event: `Stock Return Create ${req?.code}`,
        type: "remove",
        quantity: returnItem?.quantity,
        user: userResource.logResource(user),
        stockAdjustment: null,
        timestamps: now()
      }
      historyData.push(newHistoryItem)
      const warehouseQuantity = [...product.warehouseQuantity]
      const findIndex = warehouseQuantity?.findIndex(row => row?.warehouse == "Default")
      const warehouseItem = warehouseQuantity?.find(row => row?.warehouse == "Default")
      let newItem = {
        ...warehouseItem,
        quantity: parseFloat(warehouseItem?.quantity) - parseFloat(returnItem?.quantity)
      }
      warehouseQuantity.splice(findIndex, 1, newItem)

      await Product.findByIdAndUpdate(
        product?._id,
        {
          $set: {
            warehouseQuantity: warehouseQuantity,
            history: historyData
          },
        },
        { new: true }
      );
    }
  }

  const requestData = {
    code: req?.code,
    purchaseOrderCode: req?.purchaseOrderCode,
    date: req?.date,
    remark: req?.remark,
    items: req?.items,
    subTotal,
    total: subTotal,
  }

  try {

    await PurchaseOrder.findOneAndUpdate(
      { code: req?.purchaseOrderCode },
      {
        $set: {
          history: history,
        },
      },
      { new: true }
    );


    return {
      data: await new PurchaseOrderStockReturn(requestData).save(),
    };
  } catch (error) {
    throw new ValidationException(error);
  }
};

exports.update = async (req, user) => {
  //check PO
  let errorObject = {};

  const purchaseOrder = await PurchaseOrder.findOne({ code: req.purchaseOrderCode, deletedAt: null })
  if (!purchaseOrder) {
    errorObject = { ...errorObject, code: "Invalid Purchase order" };
  }

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  const history = [...purchaseOrder?.history];

  const historyItem = {
    event: `Stock Return ${req?.code} Update`,
    user: userResource.logResource(user),
    timestamps: now(),
  };

  history.push(historyItem);

  const subTotal = req?.items?.reduce((acc, curr) => {
    return acc + parseFloat(curr?.quantity) * parseFloat(curr?.rate);
  }, 0);

  const purchaseOrderReceived = await PurchaseOrderReceived.find({ purchaseOrderCode: req.purchaseOrderCode, deletedAt: null })


  for (let index = 0; index < req.items.length; index++) {
    const returnItem = req.items[index];
    const receivedItems = purchaseOrderReceived?.map(row => row?.items)?.flat()?.filter(row => row?.code == returnItem?.code)

    if (receivedItems?.length == 0) {
      errorObject = {
        ...errorObject,
        [`items.${index}.code`]:
          "no receive item found",
      };
    }

    if (receivedItems?.length > 0) {

      const currentCreatedReturns = await PurchaseOrderStockReturn.find({ purchaseOrderCode: req?.purchaseOrderCode, code: { $ne: req.code } }).lean()
      let itemExist = [];
      currentCreatedReturns?.map((row) =>
        row?.items?.find((itemRow) => {
          if (itemRow?.code === returnItem?.code) {
            itemExist.push(itemRow);
          }
        })
      );

      const currentTotalReturnedQuantity = itemExist?.reduce(
        (acc, curr) => {
          return acc + parseFloat(curr?.quantity);
        },
        0
      );

      const newTotal =
        currentTotalReturnedQuantity + parseFloat(returnItem?.quantity);


      const totalReceivedQuantity = receivedItems?.reduce((acc, curr) => {
        return acc + parseInt(curr?.receivedQuantity)
      }, 0)

      if (totalReceivedQuantity < newTotal) {
        errorObject = {
          ...errorObject,
          [`items.${index}.quantity`]:
            "return quantity cannot be greater than received quantity.",
        };
      }
    }
  }


  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  //Adjust stock to product
  for (let index = 0; index < req.items.length; index++) {
    const returnItem = req.items[index];
    const product = await Product.findOne({ code: returnItem.code }).lean()
    if (product) {
      const currentPurchaseOrderReturn = await PurchaseOrderStockReturn.findOne({ code: req?.code }).lean()
      const currentPurchaseOrderReturnItem = currentPurchaseOrderReturn?.items?.find(row => row?.code === returnItem?.code)

      const warehouseQuantity = [...product.warehouseQuantity]
      const findIndex = warehouseQuantity?.findIndex(row => row?.warehouse == "Default")
      const warehouseItem = warehouseQuantity?.find(row => row?.warehouse == "Default")
      const quantityDifference = parseFloat(returnItem?.quantity) - parseFloat(currentPurchaseOrderReturnItem?.quantity)

      if (quantityDifference != 0) {
        const isPositive = isPositiveNumber(quantityDifference)
        let positiveNumber = Math.abs(quantityDifference);

        const historyData = [...product.history]
        const newHistoryItem = {
          event: `Stock Return Update ${req?.code}`,
          type: isPositive ? "add" : "remove",
          quantity: positiveNumber,
          user: userResource.logResource(user),
          stockAdjustment: null,
          timestamps: now()
        }
        historyData.push(newHistoryItem)

        let newItem = {
          ...warehouseItem,
          quantity: parseFloat(warehouseItem?.quantity) + parseFloat(quantityDifference)
        }
        warehouseQuantity.splice(findIndex, 1, newItem)

        await Product.findByIdAndUpdate(
          product?._id,
          {
            $set: {
              warehouseQuantity: warehouseQuantity,
              history: historyData
            },
          },
          { new: true }
        );
      }
    }
  }


  const requestData = {
    code: req?.code,
    purchaseOrderCode: req?.purchaseOrderCode,
    date: req?.date,
    remark: req?.remark,
    items: req?.items,
    subTotal,
    total: subTotal,
  }

  try {

    await PurchaseOrder.findOneAndUpdate(
      { code: req?.purchaseOrderCode },
      {
        $set: {
          history: history,
        },
      },
      { new: true }
    );

    const updated = await PurchaseOrderStockReturn.findByIdAndUpdate(
      req?._id,
      {
        $set: { ...requestData },
      },
      { new: true }
    );
    return {
      data: updated._doc,
    };
  } catch (error) {
    throw new ValidationException(error);
  }
};


exports.delete = async (req, user) => {
  let errorObject = {};

  const purchaseOrder = await PurchaseOrder.findOne({
    code: req?.purchaseOrderCode,
  }).lean();

  if (!purchaseOrder) {
    errorObject = { ...errorObject, code: "Invalid Purchase order" };
  }

  const purchaseOrderStockReturn = await PurchaseOrderStockReturn.findOne({ _id: req?._id, deletedAt: null }).lean()
  if (!purchaseOrderStockReturn) {
    errorObject = { ...errorObject, code: "Invalid Purchase order stock return" };
  }

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  const historyData = [...purchaseOrder.history]
  const historyItem = {
    event: `Stock Return ${purchaseOrderStockReturn?.code} Deleted`,
    user: userResource.logResource(user),
    timestamps: now(),
  };
  historyData.push(historyItem)
  try {
    await PurchaseOrder.findOneAndUpdate(
      { code: req?.purchaseOrderCode },
      {
        $set: {
          history: historyData
        },
      },
      { new: true }
    );
    const updated = await PurchaseOrderStockReturn.findByIdAndUpdate(
      req?._id,
      {
        $set: {
          deletedAt: now(),
        },
      },
      { new: true }
    );
    return {
      data: updated._doc
    }
  } catch (error) {
    throw new ValidationException(error);
  }
};

exports.nextNumber = async () => {
  try {
    const documentCount = await PurchaseOrderStockReturn.countDocuments()
    return {
      nextNumber: formatNumberWithPrefix(documentCount + 1, "PORS"),
    };
  } catch (error) {
    throw new ValidationException(error);
  }
}