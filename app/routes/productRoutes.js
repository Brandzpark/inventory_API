const express = require('express');
const router = express.Router();

const ProductController = require('../controllers/productController')


router.get("/all", ProductController.getAll);
router.get("/findById/:id", ProductController.findById);
router.post("/create", ProductController.create);
router.put("/update", ProductController.update);
router.post("/destroy", ProductController.delete);

router.post("/stockAdjestment", ProductController.stockAdjustment);



module.exports = router
