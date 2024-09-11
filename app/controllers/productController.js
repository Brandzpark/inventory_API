const ProductService = require('../services/ProductService')
const { createValidationSchema, updateValidationSchema, deleteValidationSchema, stockAdjustmentSchema } = require('../validations/productValidation')


exports.getAll = async (req, res, next) => {
    try {
        const response = await ProductService.getAll();
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
        const response = await ProductService.findById(req.params);
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
        const response = await ProductService.create(req.body, req.user);
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
        const response = await ProductService.update(req.body, req.user);
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
        const response = await ProductService.delete(req.body, req.user);
        res.status(200).json({
            status: 200,
            success: true,
            ...response
        });
    } catch (error) {
        next(error);
    }
}


exports.stockAdjustment = async (req, res, next) => {
    try {
        await global.validate(stockAdjustmentSchema, req);
        const response = await ProductService.stockAdjustment(req.body, req.user);
        res.status(200).json({
            status: 200,
            success: true,
            ...response
        });
    } catch (error) {
        next(error);
    }
}

