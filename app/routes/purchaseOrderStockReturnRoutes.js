const express = require('express');
const router = express.Router();

const purchaseOrderStockReturnController = require('../controllers/purchaseOrderStockReturnController')


router.get("/all", purchaseOrderStockReturnController.getAll);
router.get("/findById/:id", purchaseOrderStockReturnController.findById);
router.post("/create", purchaseOrderStockReturnController.create);
router.put("/update", purchaseOrderStockReturnController.update);
router.post("/destroy", purchaseOrderStockReturnController.delete);
router.get("/nextNumber", purchaseOrderStockReturnController.nextNumber);


module.exports = router
