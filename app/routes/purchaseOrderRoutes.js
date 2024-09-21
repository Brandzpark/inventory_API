const express = require('express');
const router = express.Router();

const PurchaseOrderController = require('../controllers/purchaseOrderController')


router.get("/all", PurchaseOrderController.getAll);
router.get("/findByCode/:code", PurchaseOrderController.findByCode);
router.post("/create", PurchaseOrderController.create);
router.put("/update", PurchaseOrderController.update);
router.post("/destroy", PurchaseOrderController.delete);
router.get("/nextNumber", PurchaseOrderController.nextNumber);


module.exports = router
