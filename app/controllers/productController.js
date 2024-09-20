const ProductService = require('../services/ProductService')
const { createValidationSchema, updateValidationSchema, deleteValidationSchema, stockAdjustmentSchema } = require('../validations/productValidation')


exports.getAll = async (req, res, next) => {
  try {
    const response = await ProductService.getAll(req?.query);
    res.status(200).json({
      status: 200,
      success: true,
      ...response
    });
  } catch (error) {
    next(error);
  }
}

exports.getAllNoPaginate = async (req, res, next) => {
  try {
    const response = await ProductService.getAllNoPaginate(req?.query);
    res.status(200).json({
      status: 200,
      success: true,
      ...response
    });
  } catch (error) {
    next(error);
  }
}



exports.findBycode = async (req, res, next) => {
  try {
    const response = await ProductService.findBycode(req.params);
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

exports.getAllStockAdjustment = async (req, res, next) => {
  try {
    const response = await ProductService.getAllstockAdjustments(req.query);
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



exports.createCategory = async (req, res, next) => {
  try {
    const response = await ProductService.createCategory(req.body);
    res.status(200).json({
      status: 200,
      success: true,
      ...response
    });
  } catch (error) {
    next(error);
  }
}


exports.getCategories = async (req, res, next) => {
  try {
    const response = await ProductService.getCategories();
    res.status(200).json({
      status: 200,
      success: true,
      ...response
    });
  } catch (error) {
    next(error);
  }
}


exports.createDepartment = async (req, res, next) => {
  try {
    const response = await ProductService.createDepartment(req.body);
    res.status(200).json({
      status: 200,
      success: true,
      ...response
    });
  } catch (error) {
    next(error);
  }
}


exports.getDepartments = async (req, res, next) => {
  try {
    const response = await ProductService.getDepartments();
    res.status(200).json({
      status: 200,
      success: true,
      ...response
    });
  } catch (error) {
    next(error);
  }
}
