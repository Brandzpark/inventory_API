const Invoice = require('../models/Invoice')

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
  const requestData = {

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
  const requestData = {

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
  try {
    const updated = await Invoice.findByIdAndUpdate(
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
    const documentCount = await Invoice.find({ type: data.type }).countDocuments()
    return {
      nextNumber: formatNumberWithPrefix(documentCount + 1, data.type == "tax" ? "TINV" : "INV"),
    };
  } catch (error) {
    throw new ValidationException(error);
  }
}

