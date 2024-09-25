const PurchaseOrderService = require("../services/PurchaseOrderService");
const {
  createValidationSchema,
  updateValidationSchema,
  deleteValidationSchema,
} = require("../validations/purchaseOrderValidation");
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

exports.getAll = async (req, res, next) => {
  try {
    const response = await PurchaseOrderService.getAll(req.query);
    res.status(200).json({
      status: 200,
      success: true,
      ...response,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllNoPaginate = async (req, res, next) => {
  try {
    const response = await PurchaseOrderService.getAllNoPaginate(req.query);
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
    const response = await PurchaseOrderService.findByCode(req.params, req.query);
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
    const response = await PurchaseOrderService.create(req.body, req.user);
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
    const response = await PurchaseOrderService.update(req.body, req.user);
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
    const response = await PurchaseOrderService.delete(req.body, req.user);
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
    const response = await PurchaseOrderService.nextNumber();
    res.status(200).json({
      status: 200,
      success: true,
      ...response,
    });
  } catch (error) {
    next(error);
  }
};

exports.print = async (req, res, next) => {
  try {
    const response = await PurchaseOrderService.print(req.params);
    res.status(200).json({
      status: 200,
      success: true,
      ...response,
    });
  } catch (error) {
    next(error);
  }
};

// exports.print = async (req, res, next) => {
//   try {
//     const response = await PurchaseOrderService.print();
//     res.set({
//       'Content-Type': 'application/pdf',
//       'Content-Length': response?.pdfBuffer.length,
//     });
//     res.end(response?.pdfBuffer)
//   } catch (error) {
//     next(error);
//   }
// };