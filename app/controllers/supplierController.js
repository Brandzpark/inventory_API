const SupplierService = require('../services/SupplierService')
const { createValidationSchema, updateValidationSchema, deleteValidationSchema } = require('../validations/supplierValidation')


exports.getAll = async (req, res, next) => {
    try {
        const response = await SupplierService.getAll();
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
        const response = await SupplierService.findById(req.params);
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
        const response = await SupplierService.create(req.body);
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
        const response = await SupplierService.update(req.body);
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
        const response = await SupplierService.delete(req.body);
        res.status(200).json({
            status: 200,
            success: true,
            ...response
        });
    } catch (error) {
        next(error);
    }
}