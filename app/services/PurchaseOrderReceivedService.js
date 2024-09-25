const PurchaseOrderReceived = require("../models/PurchaseOrderReceived");
const PurchaseOrder = require("../models/PurchaseOrder");
const Supplier = require("../models/Supplier");
const Product = require("../models/Product");

const userResource = require("../resources/userResource");
const { ValidationException } = require("../exceptions");
const { now, isValidObjectId } = require("mongoose");

const { formatNumberWithPrefix, isPositiveNumber } = require('../helper')

exports.getAll = async (data) => {
  const page = data?.page ?? 1
  const search = data?.search ?? ""
  const regex = new RegExp(search, 'i');
  try {
    const purchaseOrderReceives = await PurchaseOrderReceived.paginate({
      deletedAt: null,
      $or: [
        { code: regex },
      ]
    },
      {
        lean: true,
        page,
        limit: 50,
      })

    const docs = await Promise.all(purchaseOrderReceives?.docs?.map(async (row) => {
      const purchaseOrder = await PurchaseOrder.findOne({ code: row?.purchaseOrderCode }).lean()
      const supplier = await Supplier.findOne({ code: purchaseOrder?.supplier?.code }).lean()
      return {
        ...row,
        supplier
      }
    }))

    purchaseOrderReceives.docs = docs


    return {
      data: purchaseOrderReceives
    };
  } catch (error) {
    throw new ValidationException(error);
  }
};

exports.findByCode = async (data) => {
  if (!data?.code) {
    throw new ValidationException("Missing parameter");
  }

  const purchaseOrderReceived = await PurchaseOrderReceived.findOne({ code: data?.code, deletedAt: null }).lean()
  if (!purchaseOrderReceived) {
    throw new ValidationException("Purchase Order Receive not found");
  }

  const purchaseOrder = await PurchaseOrder.findOne({ code: purchaseOrderReceived?.purchaseOrderCode }).lean()
  purchaseOrder['supplier'] = await Supplier.findOne({ code: purchaseOrder?.supplier.code }).lean()
  purchaseOrderReceived['purchaseOrder'] = purchaseOrder

  try {
    return {
      data: purchaseOrderReceived
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

  for (let index = 0; index < req.items.length; index++) {
    const requestItem = req.items[index];
    const purchaseOrderItem = purchaseOrder?.items?.find(row => row?.code == requestItem?.code)

    if (Number(purchaseOrderItem?.receivableQuantity) < Number(requestItem?.receivedQuantity)) {
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

  const tempPoItems = [...purchaseOrder?.items]

  //Add stock to product
  for (let index = 0; index < req.items.length; index++) {
    const requestItem = req.items[index];
    const purchaseOrderItem = purchaseOrder?.items?.find(row => row?.code == requestItem?.code)
    const purchaseOrderItemIndex = purchaseOrder?.items?.findIndex(row => row?.code == requestItem?.code)

    const newQuantity = String(Number(purchaseOrderItem?.receivableQuantity) - Number(requestItem?.receivedQuantity))

    tempPoItems.splice(purchaseOrderItemIndex, 1, {
      ...purchaseOrderItem,
      receivableQuantity: newQuantity,
      returnableQuantity: Number(purchaseOrderItem?.returnableQuantity) + Number(requestItem?.receivedQuantity)
    })
    purchaseOrder.items = tempPoItems

    const product = await Product.findOne({ code: requestItem.code }).lean()
    if (product) {
      const historyData = [...product.history]
      const newHistoryItem = {
        event: `Purchase Order Receive Create ${req?.code}`,
        type: "add",
        quantity: requestItem?.receivedQuantity,
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
        quantity: parseFloat(warehouseItem?.quantity) + parseFloat(requestItem?.receivedQuantity)
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

  const subTotal = req?.items?.reduce((acc, curr) => {
    return acc + parseFloat(curr?.receivedQuantity) * parseFloat(curr?.rate);
  }, 0);

  const totalDiscount = req?.items?.reduce((acc, curr) => {
    const itemSubtoal =
      parseFloat(curr?.receivedQuantity || 0) * parseFloat(curr?.rate);
    return acc + (itemSubtoal * parseFloat(curr?.discount)) / 100;
  }, 0);

  const requestData = {
    code: req?.code,
    purchaseOrderCode: req?.purchaseOrderCode,
    receivedDate: req?.receivedDate,
    remark: req?.remark ?? "",
    items: req?.items,
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
          items: purchaseOrder.items,
          isReceiveCreated: true
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

  const purchaseOrderReceived = await PurchaseOrderReceived.findOne({
    code: req?.code,
  }).lean();

  if (!purchaseOrderReceived) {
    errorObject = { ...errorObject, code: "Invalid Purchase order received" };
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
    return acc + parseFloat(curr?.receivedQuantity) * parseFloat(curr?.rate);
  }, 0);

  const totalDiscount = req?.items?.reduce((acc, curr) => {
    const itemSubtoal =
      parseFloat(curr?.receivedQuantity || 0) * parseFloat(curr?.rate);
    return acc + (itemSubtoal * parseFloat(curr?.discount)) / 100;
  }, 0);

  for (let index = 0; index < req.items.length; index++) {
    const requestItem = req.items[index];
    const oldpurchaseOrderReceivedItem = purchaseOrderReceived?.items?.find(row => row?.code == requestItem?.code)
    const purchaseOrderItem = purchaseOrder?.items?.find(row => row?.code == requestItem?.code)
    if (Number(purchaseOrderItem?.receivableQuantity + oldpurchaseOrderReceivedItem?.receivedQuantity) < Number(requestItem?.receivedQuantity)) {
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
  const tempPoItems = [...purchaseOrder?.items]

  //Add stock to product
  for (let index = 0; index < req.items.length; index++) {
    const purchaseOrderReceiveItem = req.items[index];
    const oldpurchaseOrderReceivedItem = purchaseOrderReceived?.items?.find(row => row?.code == purchaseOrderReceiveItem?.code)
    const purchaseOrderItem = purchaseOrder?.items?.find(row => row?.code == purchaseOrderReceiveItem?.code)
    const purchaseOrderItemIndex = purchaseOrder?.items?.findIndex(row => row?.code == purchaseOrderReceiveItem?.code)

    const newQty = String(Number(purchaseOrderItem?.receivableQuantity) + Number(oldpurchaseOrderReceivedItem?.receivedQuantity) - Number(purchaseOrderReceiveItem?.receivedQuantity))

    tempPoItems.splice(purchaseOrderItemIndex, 1, {
      ...purchaseOrderItem,
      receivableQuantity: newQty,
      returnableQuantity: (Number(purchaseOrderItem?.returnableQuantity) - Number(oldpurchaseOrderReceivedItem?.receivedQuantity)) + Number(purchaseOrderReceiveItem?.receivedQuantity)
    })
    purchaseOrder.items = tempPoItems

    const product = await Product.findOne({ code: purchaseOrderReceiveItem.code }).lean()
    if (product) {

      const warehouseQuantity = [...product.warehouseQuantity]
      const findIndex = warehouseQuantity?.findIndex(row => row?.warehouse == "Default")
      const warehouseItem = warehouseQuantity?.find(row => row?.warehouse == "Default")

      const isPositive = isPositiveNumber(newQty)
      let positiveNumber = Math.abs(newQty);
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
        quantity: parseFloat(warehouseItem?.quantity - oldpurchaseOrderReceivedItem?.receivedQuantity) + Number(purchaseOrderReceiveItem?.receivedQuantity)
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
          items: purchaseOrder.items
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
