const Supplier = require('../models/Supplier')

const { ValidationException } = require('../exceptions');
const { now, isValidObjectId } = require('mongoose');

exports.getAll = async () => {
    try {
        return {
            data: await Supplier.find({ deletedAt: null })
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
            data: await Supplier.findOne({ _id: data?.id, deletedAt: null })
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