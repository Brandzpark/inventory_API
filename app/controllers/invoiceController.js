const InvoiceService = require('../services/InvoiceService')

const {
  createValidationSchema,
  updateValidationSchema,
  deleteValidationSchema,
} = require('../validations/invoiceValidation')

exports.getAll = async (req, res, next) => {
  try {
    const response = await InvoiceService.getAll(req.query);
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
    const response = await InvoiceService.findById(req.params);
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
    const response = await InvoiceService.create(req.body, req.user);
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
    const response = await InvoiceService.update(req.body, req.user);
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
    const response = await InvoiceService.delete(req.body, req.user);
    res.status(200).json({
      status: 200,
      success: true,
      ...response
    });
  } catch (error) {
    next(error);
  }
}

exports.nextNumber = async (req, res, next) => {
  try {
    const response = await InvoiceService.nextNumber(req.query);
    res.status(200).json({
      status: 200,
      success: true,
      ...response
    });
  } catch (error) {
    next(error);
  }
}
