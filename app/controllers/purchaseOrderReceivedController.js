const PurchaseOrderReceivedService = require("../services/PurchaseOrderReceivedService");
const {
  createValidationSchema,
  updateValidationSchema,
  deleteValidationSchema,
} = require("../validations/purchaseOrderReceivedValidation");

exports.getAll = async (req, res, next) => {
  try {
    const response = await PurchaseOrderReceivedService.getAll(req.query);
    res.status(200).json({
      status: 200,
      success: true,
      ...response,
    });
  } catch (error) {
    next(error);
  }
};

exports.findByCode = async (req, res, next) => {
  try {
    const response = await PurchaseOrderReceivedService.findByCode(req.params);
    res.status(200).json({
      status: 200,
      success: true,
      ...response,
    });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    await global.validate(createValidationSchema, req);
    const response = await PurchaseOrderReceivedService.create(req.body, req.user);
    res.status(200).json({
      status: 200,
      success: true,
      ...response,
    });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    await global.validate(updateValidationSchema, req);
    const response = await PurchaseOrderReceivedService.update(req.body, req.user);
    res.status(200).json({
      status: 200,
      success: true,
      ...response,
    });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await global.validate(deleteValidationSchema, req);
    const response = await PurchaseOrderReceivedService.delete(req.body, req.user);
    res.status(200).json({
      status: 200,
      success: true,
      ...response,
    });
  } catch (error) {
    next(error);
  }
};

exports.nextNumber = async (req, res, next) => {
  try {
    const response = await PurchaseOrderReceivedService.nextNumber();
    res.status(200).json({
      status: 200,
      success: true,
      ...response,
    });
  } catch (error) {
    next(error);
  }
};
