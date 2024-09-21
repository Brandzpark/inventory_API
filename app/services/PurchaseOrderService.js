const PurchaseOrder = require("../models/PurchaseOrder");
const Supplier = require("../models/Supplier");
const Product = require("../models/Product");

const userResource = require("../resources/userResource");
const { ValidationException } = require("../exceptions");
const { now, isValidObjectId } = require("mongoose");

const { formatNumberWithPrefix } = require('../helper')

exports.getAll = async (data) => {
  const page = data?.page ?? 1
  const search = data?.search ?? ""
  const regex = new RegExp(search, 'i');

  const purchaseOrders = await PurchaseOrder.paginate({
    deletedAt: null,
    $or: [
      { code: regex },
      { ['supplier.code']: regex }
    ]
  },
    {
      lean: true,
      page,
      limit: 50,
    })

  const docs = await Promise.all(purchaseOrders?.docs?.map(async (row) => {
    const supplier = await Supplier.findOne({ code: row?.supplier?.code }).lean()
    return {
      ...row,
      supplier
    }
  }))

  purchaseOrders.docs = docs

  try {
    return {
      data: purchaseOrders,
    };
  } catch (error) {
    throw new ValidationException(error);
  }
};

exports.findByCode = async (data) => {
  if (!data?.code) {
    throw new ValidationException("Missing parameter");
  }

  const purchaseOrder = await PurchaseOrder.findOne({ code: data?.code, deletedAt: null }).lean()
  if (!purchaseOrder) {
    throw new ValidationException("Purchase Order not found");
  }
  purchaseOrder.supplier = await Supplier.findOne({ code: purchaseOrder?.supplier?.code })
  try {
    return {
      data: purchaseOrder
    };
  } catch (error) {
    throw new ValidationException(error);
  }
};

exports.create = async (req, user) => {
  //check supplier
  const supplier = await Supplier.findOne({
    _id: req?.supplier?._id,
    deletedAt: null,
  }).lean();
  let errorObject = {};
  if (!supplier) {
    errorObject = { ...errorObject, supplier: "Invalid Supplier" };
  }

  //checkItems
  for (let index = 0; index < req?.items.length; index++) {
    const item = req?.items[index];
    const product = await Product.findOne({ code: item?.code });
    if (!product) {
      errorObject = {
        ...errorObject,
        [`items.${index}.code`]: "Invalid Product",
      };
    }
  }

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  const mappedItems = await Promise.all(req?.items?.map(async (row) => {
    const product = await Product.findOne({ code: row?.code }).lean();
    const subTotal = parseFloat(row?.rate) * parseFloat(row?.quantity);
    const discountAmount =
      (parseFloat(subTotal) * parseFloat(row?.discount)) / 100;
    return {
      ...row,
      name: product?.name,
      discountAmount,
      subTotal,
      total: subTotal - discountAmount,
    };
  }));

  const totalDiscount = mappedItems?.reduce((acc, curr) => {
    return acc + parseFloat(curr?.discountAmount);
  }, 0);

  const subTotal = mappedItems?.reduce((acc, curr) => {
    return acc + parseFloat(curr?.subTotal);
  }, 0);

  const history = {
    event: "Created",
    user: userResource.logResource(user),
    timestamps: now(),
  };

  const requestData = {
    code: req?.code,
    orderDate: req?.orderDate,
    requiredDate: req?.requiredDate,
    remark: req?.remark,
    supplier: req?.supplier,
    items: mappedItems,
    totalDiscount,
    subTotal,
    total: subTotal - totalDiscount,
    history: [history],
  };
  try {
    return {
      data: await new PurchaseOrder(requestData).save(),
    };
  } catch (error) {
    throw new ValidationException(error);
  }
};

exports.update = async (req, user) => {
  let errorObject = {};

  const purchaseOrder = await PurchaseOrder.findOne({ _id: req?._id }).lean();

  if (!purchaseOrder) {
    errorObject = { ...errorObject, code: "Invalid Purchase order" };
  }

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  //check supplier
  const supplier = await Supplier.findOne({
    _id: req?.supplier?._id,
    deletedAt: null,
  }).lean();
  if (!supplier) {
    errorObject = { ...errorObject, supplier: "Invalid Supplier" };
  }

  //checkItems
  for (let index = 0; index < req?.items.length; index++) {
    const item = req?.items[index];
    const product = await Product.findOne({ code: item?.code });
    if (!product) {
      errorObject = {
        ...errorObject,
        [`items.${index}.code`]: "Invalid Product",
      };
    }
  }

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  const mappedItems = await Promise.all(req?.items?.map(async (row) => {
    const product = await Product.findOne({ code: row?.code }).lean();
    const subTotal = parseFloat(row?.rate) * parseFloat(row?.quantity);
    const discountAmount =
      (parseFloat(subTotal) * parseFloat(row?.discount)) / 100;
    return {
      ...row,
      name: product?.name,
      discountAmount,
      subTotal,
      total: subTotal - discountAmount,
    };
  }));

  const history = [...purchaseOrder?.history];

  const historyItem = {
    event: "Update",
    user: userResource.logResource(user),
    timestamps: now(),
  };

  history.push(historyItem);

  const totalDiscount = mappedItems?.reduce((acc, curr) => {
    return acc + parseFloat(curr?.discountAmount);
  }, 0);

  const subTotal = mappedItems?.reduce((acc, curr) => {
    return acc + parseFloat(curr?.subTotal);
  }, 0);

  const requestData = {
    code: req?.code,
    orderDate: req?.orderDate,
    requiredDate: req?.requiredDate,
    remark: req?.remark,
    supplier: req?.supplier,
    items: mappedItems,
    totalDiscount,
    subTotal,
    total: subTotal - totalDiscount,
    history,
  };
  try {
    const updated = await PurchaseOrder.findByIdAndUpdate(
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
  const purchaseOrder = await PurchaseOrder.findOne({ _id: req?._id, deletedAt: null }).lean()
  if (!purchaseOrder) {
    throw new ValidationException("Invalid Purchase Order")
  }

  const historyData = [...purchaseOrder.history]
  const historyItem = {
    event: "Deleted",
    user: userResource.logResource(user),
    timestamps: now(),
  };
  historyData.push(historyItem)

  try {
    const updated = await PurchaseOrder.findByIdAndUpdate(
      req?._id,
      {
        $set: {
          deletedAt: now(),
          history: historyData
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
    const documentCount = await PurchaseOrder.countDocuments()
    return {
      nextNumber: formatNumberWithPrefix(documentCount + 1, "PO"),
    };
  } catch (error) {
    throw new ValidationException(error);
  }
}