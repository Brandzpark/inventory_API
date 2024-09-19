const express = require('express');
const router = express.Router();

const ProductController = require('../controllers/productController')


router.get("/all", ProductController.getAll);
router.get("/findBycode/:code", ProductController.findBycode);
router.post("/create", ProductController.create);
router.post("/update", ProductController.update);
router.post("/destroy", ProductController.delete);

router.post("/stockAdjestment", ProductController.stockAdjustment);


router.post("/create/category", ProductController.createCategory);
router.get("/get/categories", ProductController.getCategories);
router.post("/create/department", ProductController.createDepartment);
router.get("/get/departments", ProductController.getDepartments);




module.exports = router
