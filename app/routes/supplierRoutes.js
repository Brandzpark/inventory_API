const express = require('express');
const router = express.Router();

const SupplierController = require('../controllers/supplierController')


router.get("/all", SupplierController.getAll);
router.get("/findById/:id", SupplierController.findById);
router.post("/create", SupplierController.create);
router.put("/update", SupplierController.update);
router.post("/destroy", SupplierController.delete);


module.exports = router
