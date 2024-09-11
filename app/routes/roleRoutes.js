const express = require('express');
const router = express.Router();

const RoleController = require('../controllers/roleController')
const { authMiddleware, authGuardMiddleware } = require('../middleware')


router.get(
  "/all",
  authMiddleware,
  authGuardMiddleware.can(['role.view']),
  RoleController.getAll
);

router.post(
  "/create",
  authMiddleware,
  authGuardMiddleware.can(['role.create']),
  RoleController.create
);

router.put(
  "/update",
  authMiddleware,
  authGuardMiddleware.can(['role.update']),
  RoleController.update
);

router.post(
  "/destroy",
  authMiddleware,
  authGuardMiddleware.can(['role.delete']),
  RoleController.delete
);



module.exports = router
