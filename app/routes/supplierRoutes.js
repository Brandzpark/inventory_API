const express = require('express');
const router = express.Router();

const SupplierController = require('../controllers/supplierController')


router.get("/all", SupplierController.getAll);
router.get("/all/noPaginate", SupplierController.getAllNoPaginate);
router.get("/findByCode/:code", SupplierController.findByCode);
router.post("/create", SupplierController.create);
router.post("/update", SupplierController.update);
router.post("/destroy", SupplierController.delete);


module.exports = router
