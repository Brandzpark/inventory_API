const express = require('express');
const router = express.Router();

const CustomerController = require('../controllers/customerController')


router.get("/all", CustomerController.getAll);
router.get("/findById/:id", CustomerController.findById);
router.post("/create", CustomerController.create);
router.put("/update", CustomerController.update);
router.post("/destroy", CustomerController.delete);


module.exports = router
