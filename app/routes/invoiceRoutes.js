const express = require('express');
const router = express.Router();

const InvoiceController = require('../controllers/invoiceController')
const { authGuardMiddleware } = require('../middleware')


router.get("/all", InvoiceController.getAll);
router.get("/findById/:id", InvoiceController.findById);
router.post("/create", InvoiceController.create);
router.put("/update", InvoiceController.update);
router.post("/destroy", InvoiceController.delete);
router.get("/nextNumber", InvoiceController.nextNumber);


module.exports = router
