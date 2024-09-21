const express = require('express');
const router = express.Router();

const CustomerController = require('../controllers/customerController')


router.get("/all", CustomerController.getAll);
router.get("/all/noPaginate", CustomerController.getAllNoPaginate);
router.get("/findByCode/:code", CustomerController.findByCode);
router.post("/create", CustomerController.create);
router.post("/update", CustomerController.update);
router.post("/destroy", CustomerController.delete);


module.exports = router
