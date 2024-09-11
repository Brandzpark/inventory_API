const SalesRep = require('../models/SalesRep')

const { ValidationException } = require('../exceptions');
const { now } = require('mongoose');

exports.getAll = async () => {
    try {
        return {
            data: await SalesRep.find({ deletedAt: null })
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