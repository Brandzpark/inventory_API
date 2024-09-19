const express = require('express');
const router = express.Router();

const SalesRepController = require('../controllers/salesRepController')


router.get("/all", SalesRepController.getAll);
router.get("/findBycode/:code", SalesRepController.findBycode);
router.post("/create", SalesRepController.create);
router.post("/update", SalesRepController.update);
router.post("/destroy", SalesRepController.delete);



module.exports = router
