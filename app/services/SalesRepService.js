const SalesRep = require('../models/SalesRep')
const Customer = require('../models/Customer')

const { ValidationException } = require('../exceptions');
const { now } = require('mongoose');

exports.getAll = async (data) => {
  const page = data?.page ?? 1
  const search = data?.search ?? ""
  const regex = new RegExp(search, 'i');
  try {
    return {
      data: await SalesRep.paginate({
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

exports.findBycode = async (data) => {
  if (!data?.code) {
    throw new ValidationException("Missing parameter")
  }

  const salesRep = await SalesRep.findOne({ code: data?.code, deletedAt: null }).lean()
  // salesRep.customers = await Promise.all(salesRep?.customers?.map(async (row) => {
  //   const customer = await Customer.findOne({ _id: row }).lean()
  //   return customer
  // }))
  try {
    return {
      data: salesRep
    }
  } catch (error) {
    throw new ValidationException(error)
  }
}

exports.create = async (data) => {
  const requestData = {
    code: data?.code,
    salutation: data?.salutation,
    name: data?.name,
    email: data?.email,
    address: data?.address,
    mobileNumber: data?.mobileNumber,
    nic: data?.nic,
    taxNo: data?.taxNo,
    customers: data?.customers,
  }

  try {
    const salesRep = await new SalesRep(requestData).save()
    return {
      data: salesRep._doc
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
    address: req?.address,
    mobileNumber: req?.mobileNumber,
    nic: req?.nic,
    taxNo: req?.taxNo,
    customers: req?.customers,
  }
  try {
    const salesRep = await SalesRep.findByIdAndUpdate(
      req?._id,
      {
        $set: { ...requestData },
      },
      { new: true }
    );

    return {
      data: salesRep._doc
    }
  } catch (error) {
    console.log(error);

    throw new ValidationException(error)
  }
}

exports.delete = async (req) => {
  try {
    const salesRep = await SalesRep.findByIdAndUpdate(
      req?._id,
      {
        $set: {
          deletedAt: now()
        },
      },
      { new: true }
    );
    return {
      data: salesRep._doc
    }
  } catch (error) {
    throw new ValidationException(error)
  }
}