const CustomerService = require('../services/CustomerService')
const { createValidationSchema, updateValidationSchema, deleteValidationSchema } = require('../validations/customerValidation')


exports.getAll = async (req, res, next) => {
    try {
        const response = await CustomerService.getAll();
        res.status(200).json({
            status: 200,
            success: true,
            ...response
        });
    } catch (error) {
        next(error);
    }
}



exports.findById = async (req, res, next) => {
    try {
        const response = await CustomerService.findById(req.params);
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
        const response = await CustomerService.create(req.body);
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
        const response = await CustomerService.update(req.body);
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
        const response = await CustomerService.delete(req.body);
        res.status(200).json({
            status: 200,
            success: true,
            ...response
        });
    } catch (error) {
        next(error);
    }
}