const Customer = require('../models/Customer')

const { ValidationException } = require('../exceptions');
const { now, isValidObjectId } = require('mongoose');

exports.getAll = async () => {
    try {
        return {
            data: await Customer.find({ deletedAt: null })
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
            data: await Customer.findOne({ _id: data?.id, deletedAt: null })
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