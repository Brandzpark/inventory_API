const Role = require('../models/Role')
const User = require('../models/User')

const { ValidationException } = require('../exceptions');
const { now } = require('mongoose');

exports.getAll = async () => {
    try {
        return {
            data: await Role.find({ deletedAt: null })
        }
    } catch (error) {
        throw new ValidationException(error)
    }
}


exports.create = async (data) => {
    const roleData = {
        name: data?.name,
        permissions: data?.permissions,
    }

    try {
        const role = await new Role(roleData).save()
        return {
            data: role._doc
        }
    } catch (error) {
        throw new ValidationException(error)
    }
}

exports.update = async (req) => {
    try {
        const roleBeforeUpdate = await Role.findById(req?._id)

        await User.updateMany(
            { role: roleBeforeUpdate?.name },
            {
                role: req?.name,
                permissions: req?.permissions,
            }
        )

        const role = await Role.findByIdAndUpdate(
            req?._id,
            {
                $set: { ...req },
            },
            { new: true }
        );

        return {
            data: role._doc
        }
    } catch (error) {
        throw new ValidationException(error)
    }
}

exports.delete = async (req) => {
    try {
        const role = await Role.findByIdAndUpdate(
            req?._id,
            {
                $set: {
                    deletedAt: now()
                },
            },
            { new: true }
        );
        return {
            data: role._doc
        }
    } catch (error) {
        throw new ValidationException(error)
    }
}