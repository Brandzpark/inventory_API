const InvoicePaymentService = require('../services/InvoicePaymentService')

const {
  createValidationSchema,
  updateValidationSchema,
  deleteValidationSchema,
} = require('../validations/invoicePaymentValidation')

exports.getAll = async (req, res, next) => {
  try {
    const response = await InvoicePaymentService.getAll();
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
    const response = await InvoicePaymentService.findById(req.params);
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
    const response = await InvoicePaymentService.create(req.body, req.user);
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
    const response = await InvoicePaymentService.update(req.body, req.user);
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
    const response = await InvoicePaymentService.delete(req.body, req.user);
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
    const response = await InvoicePaymentService.nextNumber(req.body, req.user);
    res.status(200).json({
      status: 200,
      success: true,
      ...response
    });
  } catch (error) {
    next(error);
  }
}
