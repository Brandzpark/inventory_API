const express = require('express');
const router = express.Router();

const PurchaseOrderReceivedController = require('../controllers/purchaseOrderReceivedController')


router.get("/all", PurchaseOrderReceivedController.getAll);
router.get("/findById/:id", PurchaseOrderReceivedController.findById);
router.post("/create", PurchaseOrderReceivedController.create);
router.put("/update", PurchaseOrderReceivedController.update);
router.post("/destroy", PurchaseOrderReceivedController.delete);
router.get("/nextNumber", PurchaseOrderReceivedController.nextNumber);

module.exports = router
