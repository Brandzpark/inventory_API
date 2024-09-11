const express = require('express');
const router = express.Router();

const UserController = require('../controllers/userController')

const { authMiddleware, authGuardMiddleware } = require('../middleware')


router.get(
  "/",
  authMiddleware,
  authGuardMiddleware.can(['user.view']),
  UserController.getAll
);
router.post(
  "/login",
  UserController.loginUser
);
router.post(
  "/register",
  authMiddleware,
  authGuardMiddleware.can(['user.create']),
  UserController.registerUser
);
router.post(
  "/update",
  authMiddleware,
  authGuardMiddleware.can(['user.update']),
  UserController.updateUser
);

router.post(
  "/destroy",
  authMiddleware,
  authGuardMiddleware.can(['user.delete']),
  UserController.delete
);

router.get(
  "/me",
  authMiddleware,
  UserController.getMe
);
router.post(
  "/baseUpdate",
  authMiddleware,
  UserController.baseUpdateUser
);
router.post(
  "/passsword/change",
  authMiddleware,
  UserController.passwordChange
);


module.exports = router