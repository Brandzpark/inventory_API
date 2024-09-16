const CreditNoteService = require('../services/CreditNoteService')

const {
  createValidationSchema,
  updateValidationSchema,
  deleteValidationSchema,
} = require('../validations/creditValidation')


exports.getAll = async (req, res, next) => {
  try {
    const response = await CreditNoteService.getAll(req.query);
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
    const response = await CreditNoteService.findById(req.params);
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
    const response = await CreditNoteService.create(req.body, req.user);
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
    const response = await CreditNoteService.update(req.body, req.user);
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
    const response = await CreditNoteService.delete(req.body, req.user);
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
