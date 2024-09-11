const Invoice = require('../models/Invoice')
const InvoicePayment = require('../models/InvoicePayment')
const Customer = require('../models/Customer')
const SalesRep = require('../models/SalesRep')
const Product = require('../models/Product')

const userResource = require("../resources/userResource");

const { formatNumberWithPrefix } = require('../helper')
const { ValidationException } = require('../exceptions');
const { now, isValidObjectId } = require('mongoose');


exports.getAll = async (data) => {
  try {
    return {
      data: await Invoice.find({ deletedAt: null }),
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
      data: await Invoice.findOne({ _id: data?.id, deletedAt: null }),
    };
  } catch (error) {
    throw new ValidationException(error);
  }
}
exports.create = async (data, user) => {
  let errorObject = {};

  const existingInvoice = await Invoice.findOne({ code: data?.code })
  if (existingInvoice) {
    errorObject = { ...errorObject, code: "Invoice code already taken" };
  }

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  const customer = await Customer.findOne({ code: data?.customerCode })
  if (!customer) {
    errorObject = { ...errorObject, customerCode: "Customer not found" };
  }

  const salesRep = await SalesRep.findOne({ code: data?.salesRepCode })
  if (!salesRep) {
    errorObject = { ...errorObject, salesRepCode: "Sales rep not found" };
  }

  //checkItems
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

  const mappedItems = data?.items?.map((row) => {
    const subTotal = parseFloat(row?.rate) * parseFloat(row?.quantity);
    const discountAmount =
      (parseFloat(subTotal) * parseFloat(row?.discount)) / 100;
    return {
      ...row,
      discountAmount,
      subTotal,
      total: subTotal - discountAmount,
    };
  });

  const totalDiscount = mappedItems?.reduce((acc, curr) => {
    return acc + parseFloat(curr?.discountAmount);
  }, 0);

  const subTotal = mappedItems?.reduce((acc, curr) => {
    return acc + parseFloat(curr?.subTotal);
  }, 0);

  const total = subTotal - totalDiscount

  let remainingAmount = total
  let status = "pending"

  const history = [{
    event: "Created",
    user: userResource.logResource(user),
    timestamps: now(),
  }]

  if (data?.payment) {
    const invoicePaymentExist = await InvoicePayment.findOne({ code: data?.payment?.code }).lean()
    if (invoicePaymentExist) {
      throw new ValidationException({ payment: `Payment Code \"${data?.payment?.code}}"\ already taken` });
    }
    const invoicePayment = await new InvoicePayment({ ...data?.payment, invoiceCode: data?.code }).save()
    history.push({
      event: `Payment ${invoicePayment?.code} Created`,
      user: userResource.logResource(user),
      timestamps: now(),
    })
    remainingAmount = parseFloat(remainingAmount) - parseFloat(data?.payment?.amount)
  }

  if (remainingAmount == 0) {
    status = "paid"
  }

  if (remainingAmount < 0) {
    status = "over paid"
  }

  if (remainingAmount < total && remainingAmount > 0) {
    status = "partially paid"
  }

  const requestData = {
    code: data?.code,
    date: data?.date,
    deliveryDate: data?.deliveryDate,
    customerCode: data?.customerCode,
    address: data?.address,
    salesRepCode: data?.salesRepCode,
    type: data?.type,
    customerRemark: data?.customerRemark,
    customerRemarkFreeItems: data?.customerRemarkFreeItems,
    hasFreeIssueItems: data?.hasFreeIssueItems,
    items: mappedItems,
    totalDiscount,
    subTotal,
    total: total,
    remainingAmount,
    status,
    history
  }
  try {
    return {
      data: await new Invoice(requestData).save(),
    };
  } catch (error) {
    throw new ValidationException(error);
  }
}
exports.update = async (data, user) => {
  let errorObject = {};

  const invoice = await Invoice.findOne({ code: data?.code })

  const customer = await Customer.findOne({ code: data?.customerCode })
  if (!customer) {
    errorObject = { ...errorObject, customerCode: "Customer not found" };
  }

  const salesRep = await SalesRep.findOne({ code: data?.salesRepCode })
  if (!salesRep) {
    errorObject = { ...errorObject, salesRepCode: "Sales rep not found" };
  }

  //checkItems
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

  const mappedItems = data?.items?.map((row) => {
    const subTotal = parseFloat(row?.rate) * parseFloat(row?.quantity);
    const discountAmount =
      (parseFloat(subTotal) * parseFloat(row?.discount)) / 100;
    return {
      ...row,
      discountAmount,
      subTotal,
      total: subTotal - discountAmount,
    };
  });

  const totalDiscount = mappedItems?.reduce((acc, curr) => {
    return acc + parseFloat(curr?.discountAmount);
  }, 0);

  const subTotal = mappedItems?.reduce((acc, curr) => {
    return acc + parseFloat(curr?.subTotal);
  }, 0);

  const total = subTotal - totalDiscount

  const payments = await InvoicePayment?.find({ invoiceCode: data?.code }).lean()
  const payemntTotal = payments?.reduce((acc, curr) => {
    return acc + parseFloat(curr?.amount)
  }, 0)
  let remainingAmount = total - payemntTotal

  if (remainingAmount == 0) {
    invoice.status = "paid"
  }

  if (remainingAmount < 0) {
    invoice.status = "over paid"
  }

  if (remainingAmount < total && remainingAmount > 0) {
    invoice.status = "partially paid"
  }

  const history = [...invoice.history]

  const historyItem = {
    event: "Update",
    user: userResource.logResource(user),
    timestamps: now(),
  };

  history.push(historyItem)

  const requestData = {
    code: data?.code,
    date: data?.date,
    deliveryDate: data?.deliveryDate,
    customerCode: data?.customerCode,
    address: data?.address,
    salesRepCode: data?.salesRepCode,
    type: data?.type,
    customerRemark: data?.customerRemark,
    customerRemarkFreeItems: data?.customerRemarkFreeItems,
    hasFreeIssueItems: data?.hasFreeIssueItems,
    items: mappedItems,
    totalDiscount,
    subTotal,
    total: total,
    remainingAmount,
    history: history,
    status: invoice.status
  }
  try {
    const updated = await Invoice.findByIdAndUpdate(
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
  const invoice = await Invoice.findOne({ _id: data?._id, deletedAt: null }).lean()
  if (!invoice) {
    errorObject = { ...errorObject, salesRepCode: "Invoice not found" };
  }

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  const history = [...invoice.history]

  const historyItem = {
    event: "Deleted",
    user: userResource.logResource(user),
    timestamps: now(),
  };

  history.push(historyItem)

  try {
    const updated = await Invoice.findByIdAndUpdate(
      data?._id,
      {
        $set: {
          deletedAt: now(),
          history
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
}
exports.nextNumber = async (data) => {
  try {
    const documentCount = await Invoice.find({ type: data.type }).countDocuments()
    return {
      nextNumber: formatNumberWithPrefix(documentCount + 1, data.type == "tax" ? "TINV" : "INV"),
    };
  } catch (error) {
    throw new ValidationException(error);
  }
}

