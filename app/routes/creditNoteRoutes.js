const express = require('express');
const router = express.Router();

const CreditNoteController = require('../controllers/creditNoteController')
const { authGuardMiddleware } = require('../middleware')


router.get("/all", CreditNoteController.getAll);
router.get("/findById/:id", CreditNoteController.findById);
router.post("/create", CreditNoteController.create);
router.put("/update", CreditNoteController.update);
router.post("/destroy", CreditNoteController.delete);
router.get("/nextNumber", CreditNoteController.nextNumber);


module.exports = router
