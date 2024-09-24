const express = require('express');
const router = express.Router();

const PurchaseOrderReceivedController = require('../controllers/purchaseOrderReceivedController')


router.get("/all", PurchaseOrderReceivedController.getAll);
router.get("/findByCode/:code", PurchaseOrderReceivedController.findByCode);
router.post("/create", PurchaseOrderReceivedController.create);
router.put("/update", PurchaseOrderReceivedController.update);
router.post("/destroy", PurchaseOrderReceivedController.delete);
router.get("/nextNumber", PurchaseOrderReceivedController.nextNumber);

module.exports = router
