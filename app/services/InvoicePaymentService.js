const InvoicePayment = require('../models/InvoicePayment')
const Invoice = require('../models/Invoice')

const userResource = require("../resources/userResource");

const { formatNumberWithPrefix, isPositiveNumber } = require('../helper')
const { ValidationException } = require('../exceptions');
const { now, isValidObjectId } = require('mongoose');

exports.getAll = async (data) => {
  try {
    return {
      data: await InvoicePayment.find({ deletedAt: null }),
    };
  } catch (error) {
    throw new ValidationException(error);
  }
}

exports.findById = async (data) => {
  let errorObject = {};

  if (!data?.id) {
    throw new ValidationException("Missing parameter");
  }

  if (!isValidObjectId(data?.id)) {
    throw new ValidationException("Invalid object ID");
  }

  try {
    return {
      data: await InvoicePayment.findOne({ _id: data?.id, deletedAt: null }),
    };
  } catch (error) {
    throw new ValidationException(error);
  }
}

exports.create = async (data, user) => {
  let errorObject = {};

  const invoicePaymentExist = await InvoicePayment.findOne({ code: data?.code }).lean()
  if (invoicePaymentExist) {
    throw new ValidationException({ payment: `Payment Code \"${data?.code}}"\ already taken` });
  }

  const invoice = await Invoice.findOne({ code: data?.invoiceCode }).lean()

  if (!invoice) {
    errorObject = { ...errorObject, invoiceCode: "Invalid Invoice" };
  }
  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  if (invoice?.remainingAmount <= 0) {
    errorObject = { ...errorObject, invoiceCode: "Invocie Already Paid" };
  }
  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }



  const historyData = [...invoice.history]
  const newHistoryItem = {
    event: `Payment Created ${data?.code}`,
    user: userResource.logResource(user),
    timestamps: now(),
  }
  historyData.push(newHistoryItem)

  const newRemainingAmount = invoice?.remainingAmount - data?.amount

  await Invoice.findByIdAndUpdate(
    invoice?._id,
    {
      $set: {
        history: historyData,
        remainingAmount: newRemainingAmount,
        status: newRemainingAmount <= 0 ? 'paid' : newRemainingAmount < invoice?.total ? "partially paid" : invoice?.status
      },
    },
  );

  try {
    return {
      data: await new InvoicePayment(data).save(),
    };
  } catch (error) {
    throw new ValidationException(error);
  }
}

exports.update = async (data, user) => {
  let errorObject = {};

  const invoicePaymentExist = await InvoicePayment.findOne({ code: data?.code }).lean()
  if (!invoicePaymentExist) {
    throw new ValidationException({ payment: `Invalid Invoice Payment` });
  }

  const invoice = await Invoice.findOne({ code: data?.invoiceCode }).lean()

  if (!invoice) {
    errorObject = { ...errorObject, invoiceCode: "Invalid Invoice" };
  }
  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  if (invoice?.remainingAmount <= 0) {
    errorObject = { ...errorObject, invoiceCode: "Invocie Already Paid" };
  }
  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  const historyData = [...invoice.history]
  const newHistoryItem = {
    event: `Payment Update ${data?.code}`,
    user: userResource.logResource(user),
    timestamps: now(),
  }
  historyData.push(newHistoryItem)

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  const newRemainingAmount = (parseFloat(invoice?.remainingAmount) + parseFloat(invoicePaymentExist?.amount)) - parseFloat(data?.amount)

  await Invoice.findByIdAndUpdate(
    invoice?._id,
    {
      $set: {
        history: historyData,
        remainingAmount: newRemainingAmount,
        status: newRemainingAmount <= 0 ? 'paid' : newRemainingAmount < invoice?.total ? "partially paid" : invoice?.status
      },
    },
  );


  try {
    const updated = await InvoicePayment.findByIdAndUpdate(
      data?._id,
      {
        $set: { ...data },
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

  const invoicePaymentExist = await InvoicePayment.findOne({ code: data?.code }).lean()
  if (!invoicePaymentExist) {
    throw new ValidationException({ payment: `Invalid Invoice Payment` });
  }

  const invoice = await Invoice.findOne({ code: data?.invoiceCode }).lean()

  if (!invoice) {
    errorObject = { ...errorObject, invoiceCode: "Invalid Invoice" };
  }
  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  const historyData = [...invoice.history]
  const newHistoryItem = {
    event: `Payment Deleted ${data?.code}`,
    user: userResource.logResource(user),
    timestamps: now(),
  }
  historyData.push(newHistoryItem)

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  const newRemainingAmount = parseFloat(invoice?.remainingAmount) + parseFloat(invoicePaymentExist?.amount)

  await Invoice.findByIdAndUpdate(
    invoice?._id,
    {
      $set: {
        history: historyData,
        remainingAmount: newRemainingAmount,
        status: newRemainingAmount <= 0 ? 'paid' : newRemainingAmount < invoice?.total ? "partially paid" : invoice?.status
      },
    },
  );


  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  try {
    const updated = await InvoicePayment.findByIdAndUpdate(
      data?._id,
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
}

exports.nextNumber = async (data) => {
  try {
    const documentCount = await InvoicePayment.find().countDocuments()
    return {
      nextNumber: formatNumberWithPrefix(documentCount + 1, "SPR"),
    };
  } catch (error) {
    throw new ValidationException(error);
  }
}
