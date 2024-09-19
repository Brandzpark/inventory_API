const Invoice = require('../models/Invoice')
const InvoiceReturn = require('../models/InvoiceReturn')
const Product = require('../models/Product')

const userResource = require("../resources/userResource");


const { formatNumberWithPrefix, isPositiveNumber } = require('../helper')
const { ValidationException } = require('../exceptions');
const { now, isValidObjectId } = require('mongoose');

exports.getAll = async (data) => {
  try {
    return {
      data: await InvoiceReturn.find({ deletedAt: null }).lean()
    };
  } catch (error) {
    throw new ValidationException(error);
  }
}
exports.findById = async (data) => {
  if (!data?.id) {
    throw new ValidationException("Missing parameter");
  }

  if (!isValidObjectId(data?.id)) {
    throw new ValidationException("Invalid object ID");
  }

  try {
    return {
      data: await InvoiceReturn.findOne({ _id: data?.id, deletedAt: null }),
    };
  } catch (error) {
    throw new ValidationException(error);
  }
}
exports.create = async (data, user) => {
  let errorObject = {};

  const existing = await InvoiceReturn.findOne({ code: data?.code }).lean()
  if (existing) {
    throw new ValidationException({ code: `Invoice Return Code \"${data?.code}}"\ already taken` });
  }

  const invoice = await Invoice.findOne({ code: data?.invoiceCode }).lean()
  if (!invoice) {
    throw new ValidationException({ code: `Invalid Invoice` });
  }


  for (let index = 0; index < data?.items.length; index++) {
    const item = data?.items[index];
    const product = await Product.findOne({ code: item?.code });
    if (!product) {
      errorObject = {
        ...errorObject,
        [`items.${index}.code`]: "Product not found",
      };
    }
  }

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }


  for (let index = 0; index < data?.items.length; index++) {
    const row = data?.items[index];
    if (!row?.isDamaged) {
      const product = await Product.findOne({ code: row.code }).lean()
      const warehouseQuantity = [...product.warehouseQuantity]
      const findIndex = warehouseQuantity?.findIndex(row => row?.warehouse == "Default")
      const warehouseItem = warehouseQuantity?.find(row => row?.warehouse == "Default")
      let newItem = {
        ...warehouseItem,
        quantity: parseFloat(warehouseItem?.quantity) + parseFloat(row?.quantity)
      }
      warehouseQuantity.splice(findIndex, 1, newItem)

      const historyData = [...product.history]
      const newHistoryItem = {
        event: `Invoice Return Created ${data?.code}`,
        type: "add",
        quantity: row?.quantity,
        user: userResource.logResource(user),
        stockAdjustment: null,
        timestamps: now()
      }
      historyData.push(newHistoryItem)

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

  const mappedItems = data?.items?.map((row) => {
    const subTotal = parseFloat(row?.rate) * parseFloat(row?.quantity);
    return {
      ...row,
      subTotal,
      total: subTotal,
    };
  });

  const subTotal = mappedItems?.reduce((acc, curr) => {
    return acc + parseFloat(curr?.subTotal);
  }, 0);

  const total = subTotal

  const requestData = {
    code: data?.code,
    invoiceCode: data?.invoiceCode,
    date: data?.date,
    remark: data?.remark,
    items: data?.items,
    subTotal: data?.subTotal,
    total: total,
  }


  const history = [...invoice.history]

  history.push({
    event: `Invocie Return Create ${data?.code}`,
    user: userResource.logResource(user),
    timestamps: now(),
  })

  await Invoice.findByIdAndUpdate(
    invoice?._id,
    {
      $set: {
        history
      },
    },
  );

  try {
    return {
      data: await new InvoiceReturn(requestData).save(),
    };
  } catch (error) {
    throw new ValidationException(error);
  }
}
exports.update = async (data, user) => {
  let errorObject = {};

  const existing = await InvoiceReturn.findOne({ code: data?.code }).lean()
  if (!existing) {
    throw new ValidationException({ code: `Invoice Return not found` });
  }

  const invoice = await Invoice.findOne({ code: data?.invoiceCode }).lean()
  if (!invoice) {
    throw new ValidationException({ code: `Invalid Invoice` });
  }


  for (let index = 0; index < data?.items.length; index++) {
    const item = data?.items[index];
    const product = await Product.findOne({ code: item?.code });
    if (!product) {
      errorObject = {
        ...errorObject,
        [`items.${index}.code`]: "Product not found",
      };
    }
  }

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }


  for (let index = 0; index < data?.items.length; index++) {
    const row = data?.items[index];
    const existingItem = existing?.items[index];

    if (existingItem?.isDamaged && !row?.isDamaged) {
      const product = await Product.findOne({ code: row.code }).lean()
      const warehouseQuantity = [...product.warehouseQuantity]
      const findIndex = warehouseQuantity?.findIndex(row => row?.warehouse == "Default")
      const warehouseItem = warehouseQuantity?.find(row => row?.warehouse == "Default")
      let newItem = {
        ...warehouseItem,
        quantity: parseFloat(warehouseItem?.quantity) + parseFloat(row?.quantity)
      }
      warehouseQuantity.splice(findIndex, 1, newItem)

      const historyData = [...product.history]
      const newHistoryItem = {
        event: `Invoice Return Updated ${data?.code}`,
        type: "remove",
        quantity: row?.quantity,
        user: userResource.logResource(user),
        stockAdjustment: null,
        timestamps: now()
      }
      historyData.push(newHistoryItem)

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
    if (!existingItem?.isDamaged && row?.isDamaged) {
      const product = await Product.findOne({ code: row.code }).lean()
      const warehouseQuantity = [...product.warehouseQuantity]
      const findIndex = warehouseQuantity?.findIndex(row => row?.warehouse == "Default")
      const warehouseItem = warehouseQuantity?.find(row => row?.warehouse == "Default")
      let newItem = {
        ...warehouseItem,
        quantity: parseFloat(warehouseItem?.quantity) - parseFloat(row?.quantity)
      }
      warehouseQuantity.splice(findIndex, 1, newItem)

      const historyData = [...product.history]
      const newHistoryItem = {
        event: `Invoice Return Updated ${data?.code}`,
        type: "add",
        quantity: row?.quantity,
        user: userResource.logResource(user),
        stockAdjustment: null,
        timestamps: now()
      }
      historyData.push(newHistoryItem)

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

  const mappedItems = data?.items?.map((row) => {
    const subTotal = parseFloat(row?.rate) * parseFloat(row?.quantity);
    return {
      ...row,
      subTotal,
      total: subTotal,
    };
  });

  const subTotal = mappedItems?.reduce((acc, curr) => {
    return acc + parseFloat(curr?.subTotal);
  }, 0);

  const total = subTotal

  const requestData = {
    code: data?.code,
    invoiceCode: data?.invoiceCode,
    date: data?.date,
    remark: data?.remark,
    items: mappedItems,
    subTotal: data?.subTotal,
    total: total,
  }


  const history = [...invoice.history]

  history.push({
    event: `Invocie Return Updated ${data?.code}`,
    user: userResource.logResource(user),
    timestamps: now(),
  })

  await Invoice.findByIdAndUpdate(
    invoice?._id,
    {
      $set: {
        history
      },
    },
  );


  try {
    const updated = await InvoiceReturn.findByIdAndUpdate(
      data?._id,
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
}
exports.delete = async (data, user) => {
  let errorObject = {};
  const existing = await InvoiceReturn.findOne({ _id: data?._id, deletedAt: null }).lean()
  if (!existing) {
    errorObject = { ...errorObject, code: "Invoice Return not found" };
  }

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }
  const invoice = await Invoice.findOne({ code: existing?.invoiceCode }).lean()
  if (!invoice) {
    throw new ValidationException({ code: `Invalid Invoice` });
  }

  const history = [...invoice.history]

  const historyItem = {
    event: `invoice Return Deleted ${existing?.code}`,
    user: userResource.logResource(user),
    timestamps: now(),
  };

  history.push(historyItem)

  await Invoice.findByIdAndUpdate(
    invoice?._id,
    {
      $set: {
        history
      },
    },
  );

  try {
    const updated = await InvoiceReturn.findByIdAndUpdate(
      data?._id,
      {
        $set: {
          deletedAt: now(),
        },
      },
      { new: true }
    );
    return {
      data: updated._doc,
    };
  } catch (error) {
    throw new ValidationException(error);
  }
}
exports.nextNumber = async (data) => {
  try {
    const documentCount = await InvoiceReturn.find().countDocuments()
    return {
      nextNumber: formatNumberWithPrefix(documentCount + 1, "SR"),
    };
  } catch (error) {
    throw new ValidationException(error);
  }
}