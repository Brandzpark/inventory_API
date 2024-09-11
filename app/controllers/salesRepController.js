const SalesRepService = require('../services/SalesRepService')
const { createValidationSchema, updateValidationSchema, deleteValidationSchema } = require('../validations/salesRepValidation')


exports.getAll = async (req, res, next) => {
    try {
        const response = await SalesRepService.getAll();
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
        const response = await SalesRepService.create(req.body);
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
        const response = await SalesRepService.update(req.body);
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
        const response = await SalesRepService.delete(req.body);
        res.status(200).json({
            status: 200,
            success: true,
            ...response
        });
    } catch (error) {
        next(error);
    }
}