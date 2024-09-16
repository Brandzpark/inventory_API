const PurchaseOrderReceived = require("../models/PurchaseOrderReceived");
const PurchaseOrder = require("../models/PurchaseOrder");
const Supplier = require("../models/Supplier");
const Product = require("../models/Product");

const userResource = require("../resources/userResource");
const { ValidationException } = require("../exceptions");
const { now, isValidObjectId } = require("mongoose");

const { formatNumberWithPrefix, isPositiveNumber } = require('../helper')

exports.getAll = async () => {
  try {
    return {
      data: await PurchaseOrderReceived.find({ deletedAt: null }),
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
      data: await PurchaseOrderReceived.findOne({ _id: data?.id, deletedAt: null }),
    };
  } catch (error) {
    throw new ValidationException(error);
  }
};

exports.create = async (req, user) => {
  let errorObject = {};

  const purchaseOrderReceived = await PurchaseOrderReceived.findOne({
    code: req?.code,
  }).lean();


  if (purchaseOrderReceived) {
    errorObject = {
      ...errorObject,
      code: `\"${req?.code}\" code already taken`,
    };
  }

  const purchaseOrder = await PurchaseOrder.findOne({
    code: req?.purchaseOrderCode,
  }).lean();

  if (!purchaseOrder) {
    errorObject = {
      ...errorObject,
      purchaseOrderCode: "Invalid Purchase order",
    };
  }

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  const history = [...purchaseOrder?.history];

  const historyItem = {
    event: `Receive Create ${req.code}`,
    user: userResource.logResource(user),
    timestamps: now(),
  };

  history.push(historyItem);

  const subTotal = req?.items?.reduce((acc, curr) => {
    return acc + parseFloat(curr?.receivedQuantity) * parseFloat(curr?.amount);
  }, 0);

  const totalDiscount = (subTotal * req?.discount) / 100;

  for (let index = 0; index < req.items.length; index++) {
    const requestItem = req.items[index];
    const orderedQuantity = requestItem?.orderedQuantity;
    const currentCreatedReceived = await PurchaseOrderReceived.find({ purchaseOrderCode: req?.purchaseOrderCode }).lean()
    let itemReceivedExist = [];
    currentCreatedReceived?.map((row) =>
      row?.items?.find((itemRow) => {
        if (itemRow?.code === requestItem?.code) {
          itemReceivedExist.push(itemRow);
        }
      })
    );

    const currentTotalReceivedQuantity = itemReceivedExist?.reduce(
      (acc, curr) => {
        return acc + parseFloat(curr?.receivedQuantity);
      },
      0
    );

    const newTotal =
      currentTotalReceivedQuantity + parseFloat(requestItem?.receivedQuantity);

    if (orderedQuantity < newTotal) {
      errorObject = {
        ...errorObject,
        [`items.${index}.code`]:
          "received quantity cannot be greater than order quantity.",
      };
    }
  }
  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }


  //Add stock to product
  for (let index = 0; index < req.items.length; index++) {
    const purchaseOrderReceiveItem = req.items[index];
    const product = await Product.findOne({ code: purchaseOrderReceiveItem.code }).lean()
    if (product) {
      const historyData = [...product.history]
      const newHistoryItem = {
        event: `Purchase Order Receive Create ${req?.code}`,
        type: "add",
        quantity: purchaseOrderReceiveItem?.receivedQuantity,
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
        quantity: parseFloat(warehouseItem?.quantity) + parseFloat(purchaseOrderReceiveItem?.receivedQuantity)
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
    receivedDate: req?.receivedDate,
    remark: req?.remark,
    items: req?.items,
    discount: req?.discount,
    totalDiscount: totalDiscount,
    subTotal,
    total: subTotal - totalDiscount,
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
      data: await new PurchaseOrderReceived(requestData).save(),
    };
  } catch (error) {
    throw new ValidationException(error);
  }
};

exports.update = async (req, user) => {
  let errorObject = {};

  const purchaseOrder = await PurchaseOrder.findOne({
    code: req?.purchaseOrderCode,
  }).lean();

  if (!purchaseOrder) {
    errorObject = { ...errorObject, code: "Invalid Purchase order" };
  }

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  const history = [...purchaseOrder?.history];

  const historyItem = {
    event: `Receive Update ${req?.code}`,
    user: userResource.logResource(user),
    timestamps: now(),
  };

  history.push(historyItem);

  const subTotal = req?.items?.reduce((acc, curr) => {
    return acc + parseFloat(curr?.receivedQuantity) * parseFloat(curr?.amount);
  }, 0);

  const totalDiscount = (subTotal * req?.discount) / 100;

  for (let index = 0; index < req.items.length; index++) {
    const requestItem = req.items[index];
    const orderedQuantity = requestItem?.orderedQuantity;
    const currentCreatedReceived = await PurchaseOrderReceived.find({ purchaseOrderCode: req?.purchaseOrderCode, code: { $ne: req.code } }).lean()
    let itemReceivedExist = [];
    currentCreatedReceived?.map((row) =>
      row?.items?.find((itemRow) => {
        if (itemRow?.code === requestItem?.code) {
          itemReceivedExist.push(itemRow);
        }
      })
    );

    const currentTotalReceivedQuantity = itemReceivedExist?.reduce(
      (acc, curr) => {
        return acc + parseFloat(curr?.receivedQuantity);
      },
      0
    );

    const newTotal =
      currentTotalReceivedQuantity + parseFloat(requestItem?.receivedQuantity);

    if (orderedQuantity < newTotal) {
      errorObject = {
        ...errorObject,
        [`items.${index}.code`]:
          "received quantity cannot be greater than order quantity.",
      };
    }
  }
  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  //Add stock to product
  for (let index = 0; index < req.items.length; index++) {
    const purchaseOrderReceiveItem = req.items[index];
    const product = await Product.findOne({ code: purchaseOrderReceiveItem.code }).lean()
    if (product) {
      const currentPurchaseOrderReceive = await PurchaseOrderReceived.findOne({ code: req?.code }).lean()
      const currentPurchaseOrderReceiveItem = currentPurchaseOrderReceive?.items?.find(row => row?.code === purchaseOrderReceiveItem?.code)

      const warehouseQuantity = [...product.warehouseQuantity]
      const findIndex = warehouseQuantity?.findIndex(row => row?.warehouse == "Default")
      const warehouseItem = warehouseQuantity?.find(row => row?.warehouse == "Default")

      const quantityDifference = parseFloat(purchaseOrderReceiveItem?.receivedQuantity) - parseFloat(currentPurchaseOrderReceiveItem?.receivedQuantity)
      if (quantityDifference != 0) {
        const isPositive = isPositiveNumber(quantityDifference)
        let positiveNumber = Math.abs(quantityDifference);
        const historyData = [...product.history]
        const newHistoryItem = {
          event: `Purchase Order Receive Update ${req?.code}`,
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
    receivedDate: req?.receivedDate,
    remark: req?.remark,
    items: req?.items,
    discount: req?.discount,
    totalDiscount: totalDiscount,
    subTotal,
    total: subTotal - totalDiscount,
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

    const updated = await PurchaseOrderReceived.findByIdAndUpdate(
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

  const purchaseOrderReceived = await PurchaseOrderReceived.findOne({ _id: req?._id, deletedAt: null }).lean()
  if (!purchaseOrderReceived) {
    errorObject = { ...errorObject, code: "Invalid Purchase order received" };
  }

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  const historyData = [...purchaseOrder.history]
  const historyItem = {
    event: `Purchase Order Received ${purchaseOrderReceived?.code} Deleted`,
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
    const updated = await PurchaseOrderReceived.findByIdAndUpdate(
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
    const documentCount = await PurchaseOrderReceived.countDocuments()
    return {
      nextNumber: formatNumberWithPrefix(documentCount + 1, "POR"),
    };
  } catch (error) {
    throw new ValidationException(error);
  }
}
