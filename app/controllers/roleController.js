const RoleService = require('../services/RoleService')
const { createValidationSchema, updateValidationSchema, deleteValidationSchema } = require('../validations/roleValidation')


exports.getAll = async (req, res, next) => {
    try {
        const response = await RoleService.getAll();
        res.status(200).json({
            status: 200,
            success: true,
            ...response
        });
    } catch (error) {
        next(error);
    }
}

exports.create = async (req, res, next) => {
    try {
        await global.validate(createValidationSchema, req);
        const response = await RoleService.create(req.body);
        res.status(200).json({
            status: 200,
            success: true,
            ...response
        });
    } catch (error) {
        next(error);
    }
}


exports.update = async (req, res, next) => {
    try {
        await global.validate(updateValidationSchema, req);
        const response = await RoleService.update(req.body);
        res.status(200).json({
            status: 200,
            success: true,
            ...response
        });
    } catch (error) {
        next(error);
    }
}


exports.delete = async (req, res, next) => {
    try {
        await global.validate(deleteValidationSchema, req);
        const response = await RoleService.delete(req.body);
        res.status(200).json({
            status: 200,
            success: true,
            ...response
        });
    } catch (error) {
        next(error);
    }
}