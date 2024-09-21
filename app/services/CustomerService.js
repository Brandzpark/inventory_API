const Customer = require('../models/Customer')

const { ValidationException } = require('../exceptions');
const { now, isValidObjectId } = require('mongoose');
const { PaginationParameters } = require('mongoose-paginate-v2');

exports.getAll = async (data) => {
  const page = data?.page ?? 1
  const search = data?.search ?? ""
  const regex = new RegExp(search, 'i');
  try {
    return {
      data: await Customer.paginate({
        deletedAt: null,
        $or: [
          { name: regex },
          { email: regex },
          { code: regex }
        ]
      }, {
        page,
        limit: 50,
      })
    }
  } catch (error) {
    throw new ValidationException(error)
  }
}

exports.getAllNoPaginate = async (data) => {
  try {
    return {
      data: await Customer.find({ deletedAt: null })
    }
  } catch (error) {
    throw new ValidationException(error)
  }
}

exports.findByCode = async (data) => {
  if (!data?.code) {
    throw new ValidationException("Missing parameter")
  }

  try {
    return {
      data: await Customer.findOne({ code: data?.code, deletedAt: null })
    }
  } catch (error) {
    throw new ValidationException(error)
  }
}


exports.create = async (data) => {
  const createData = {
    code: data?.code,
    status: data?.status,
    salutation: data?.salutation,
    name: data?.name,
    email: data?.email,
    nic: data?.nic,
    mobileNumber: data?.mobileNumber,
    address: data?.address,
    taxNo: data?.taxNo,
    openingBalance: data?.openingBalance,
    creditLimit: data?.creditLimit,
    creditPeriod: data?.creditPeriod,
  }

  try {
    const created = await new Customer(createData).save()
    return {
      data: created._doc
    }
  } catch (error) {
    throw new ValidationException(error)
  }
}

exports.update = async (req) => {
  const requestData = {
    salutation: req?.salutation,
    status: req?.status,
    name: req?.name,
    email: req?.email,
    nic: req?.nic,
    mobileNumber: req?.mobileNumber,
    address: req?.address,
    taxNo: req?.taxNo,
    openingBalance: req?.openingBalance,
    creditLimit: req?.creditLimit,
    creditPeriod: req?.creditPeriod,
  }

  console.log(requestData);

  try {
    const updated = await Customer.findByIdAndUpdate(
      req?._id,
      {
        $set: { ...requestData },
      },
      { new: true }
    );

    //TODO: update the sales res customer data
    return {
      data: updated._doc
    }
  } catch (error) {
    throw new ValidationException(error)
  }
}

exports.delete = async (req) => {
  try {
    const updated = await Customer.findByIdAndUpdate(
      req?._id,
      {
        $set: {
          deletedAt: now()
        },
      },
      { new: true }
    );
    return {
      data: updated._doc
    }
  } catch (error) {
    throw new ValidationException(error)
  }
}