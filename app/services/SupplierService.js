const Supplier = require('../models/Supplier')

const { ValidationException } = require('../exceptions');
const { now, isValidObjectId } = require('mongoose');

exports.getAll = async (data) => {
  const page = data?.page ?? 1
  const search = data?.search ?? ""
  const regex = new RegExp(search, 'i');
  try {
    return {
      data: await Supplier.paginate({
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
      data: await Supplier.find({ deletedAt: null })
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
      data: await Supplier.findOne({ code: data?.code, deletedAt: null })
    }
  } catch (error) {
    throw new ValidationException(error)
  }
}


exports.create = async (data) => {
  const createData = {
    code: data?.code,
    salutation: data?.salutation,
    name: data?.name,
    email: data?.email,
    mobileNumber: data?.mobileNumber,
    address: data?.address,
    nic: data?.nic,
    taxNo: data?.taxNo,
  }

  try {
    const created = await new Supplier(createData).save()
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
    name: req?.name,
    email: req?.email,
    mobileNumber: req?.mobileNumber,
    address: req?.address,
    nic: req?.nic,
    taxNo: req?.taxNo,
  }
  try {
    const updated = await Supplier.findByIdAndUpdate(
      req?._id,
      {
        $set: { ...requestData },
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

exports.delete = async (req) => {
  try {
    const updated = await Supplier.findByIdAndUpdate(
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