const express = require('express');
const router = express.Router();

const InvoicePaymentController = require('../controllers/invoicePaymentController')
const { authGuardMiddleware } = require('../middleware')


router.get("/all", InvoicePaymentController.getAll);
router.get("/findById/:id", InvoicePaymentController.findById);
router.post("/create", InvoicePaymentController.create);
router.put("/update", InvoicePaymentController.update);
router.post("/destroy", InvoicePaymentController.delete);
router.get("/nextNumber", InvoicePaymentController.nextNumber);


module.exports = router
