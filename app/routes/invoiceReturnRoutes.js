const express = require('express');
const router = express.Router();

const InvoiceReturnController = require('../controllers/invoiceReturnController')
const { authGuardMiddleware } = require('../middleware')


router.get("/all", InvoiceReturnController.getAll);
router.get("/findById/:id", InvoiceReturnController.findById);
router.post("/create", InvoiceReturnController.create);
router.put("/update", InvoiceReturnController.update);
router.post("/destroy", InvoiceReturnController.delete);
router.get("/nextNumber", InvoiceReturnController.nextNumber);


module.exports = router
