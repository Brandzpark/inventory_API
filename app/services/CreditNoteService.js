const CreditNote = require('../models/CreditNote')
const Customer = require('../models/Customer')

const userResource = require("../resources/userResource");

const { formatNumberWithPrefix, isPositiveNumber } = require('../helper')
const { ValidationException } = require('../exceptions');
const { now, isValidObjectId } = require('mongoose');


exports.getAll = async (data) => {
  try {
    return {
      data: await CreditNote.find({ ...data, deletedAt: null })
    }
  } catch (error) {
    throw new ValidationException(error)
  }
}
exports.findById = async (data) => {
  if (!data?.id) {
    throw new ValidationException("Missing parameter")
  }

  if (!isValidObjectId(data?.id)) {
    throw new ValidationException("Invalid object ID")
  }

  try {
    return {
      data: await CreditNote.findOne({ _id: data?.id, deletedAt: null })
    }
  } catch (error) {
    throw new ValidationException(error)
  }
}
exports.create = async (data, user) => {
  let errorObject = {};
  const existing = await CreditNote.findOne({ code: data?.code })
  if (existing) {
    errorObject = { ...errorObject, code: "Credit note code already taken" };
  }

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  const customer = await Customer.findOne({ code: data?.customerCode })
  if (!customer) {
    errorObject = { ...errorObject, customerCode: "Customer not found" };
  }

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  const history = [{
    event: `Created`,
    user: userResource.logResource(user),
    timestamps: now(),
  }]

  const requestData = {
    code: data?.code,
    customerCode: data?.customerCode,
    paymentDate: data?.paymentDate,
    amount: data?.amount,
    availableAmount: data?.amount,
    remark: data?.remark,
    history,
  }
  try {
    return {
      data: await new CreditNote(requestData).save(),
    };
  } catch (error) {
    throw new ValidationException(error);
  }
}
exports.update = async (data, user) => {
  let errorObject = {};
  const existing = await CreditNote.findOne({ code: data?.code })
  if (!existing) {
    errorObject = { ...errorObject, code: "Credit note not found" };
  }

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  const history = [...existing?.history]

  history.push({
    event: `Updated`,
    user: userResource.logResource(user),
    timestamps: now(),
  })

  const requestData = {
    paymentDate: data?.paymentDate,
    amount: data?.amount,
    availableAmount: parseFloat(data?.amount) - (parseFloat(existing?.amount) - parseFloat(existing?.availableAmount)),
    remark: data?.remark,
    history,
  }

  try {
    const updated = await CreditNote.findByIdAndUpdate(
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
  const existing = await CreditNote.findOne({ _id: data?._id, deletedAt: null }).lean()
  if (!existing) {
    errorObject = { ...errorObject, code: "Credit note not found" };
  }

  if (Object.keys(errorObject)?.length > 0) {
    throw new ValidationException(errorObject);
  }

  const history = [...existing?.history]

  history.push({
    event: `Deleted`,
    user: userResource.logResource(user),
    timestamps: now(),
  })

  try {
    const updated = await CreditNote.findByIdAndUpdate(
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
exports.nextNumber = async () => {
  try {
    const documentCount = await CreditNote.find().countDocuments()
    return {
      nextNumber: formatNumberWithPrefix(documentCount + 1, "CN"),
    };
  } catch (error) {
    throw new ValidationException(error);
  }
}