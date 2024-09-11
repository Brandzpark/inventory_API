const express = require('express');
const router = express.Router();

const SalesRepController = require('../controllers/salesRepController')


router.get("/all", SalesRepController.getAll);
router.post("/create", SalesRepController.create);
router.put("/update", SalesRepController.update);
router.post("/destroy", SalesRepController.delete);



module.exports = router
