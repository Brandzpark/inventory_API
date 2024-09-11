const UserService = require('../services/UserService')

const {
  loginValidationSchema,
  registerValidationSchema,
  basicUpdateValidationSchema,
  passwordChangeValidationSchema,
  deleteValidationSchema,
} = require('../validations/userValidation')

exports.getAll = async (req, res, next) => {
  try {
    const response = await UserService.getAll(req.params);
    res.status(200).json({
      status: 200,
      success: true,
      ...response
    });
  } catch (error) {
    next(error);
  }
}

exports.loginUser = async (req, res, next) => {
  try {
    await global.validate(loginValidationSchema, req);
    const response = await UserService.loginUser(req.body);
    res.status(200).json({
      status: 200,
      success: true,
      ...response
    });
  } catch (error) {
    next(error);
  }
}


exports.registerUser = async (req, res, next) => {
  try {
    await global.validate(registerValidationSchema, req);
    const response = await UserService.registerUser(req.body);
    res.status(200).json({
      status: 200,
      success: true,
      ...response
    });
  } catch (error) {
    next(error);
  }
}

exports.updateUser = async (req, res, next) => {
  try {
    await global.validate(registerValidationSchema, req);
    const response = await UserService.updateUser(req.body);
    res.status(200).json({
      status: 200,
      success: true,
      ...response
    });
  } catch (error) {
    next(error);
  }
}

exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      status: 200,
      success: true,
      user: req?.user
    });
  } catch (error) {
    next(error);
  }
}

exports.baseUpdateUser = async (req, res, next) => {
  try {
    await global.validate(basicUpdateValidationSchema, req);
    const response = await UserService.baseUpdateUser(req);
    res.status(200).json({
      status: 200,
      success: true,
    });
  } catch (error) {
    next(error);
  }
}

exports.passwordChange = async (req, res, next) => {
  try {
    await global.validate(passwordChangeValidationSchema, req);
    const response = await UserService.passwordChange(req.body, req.user);
    res.status(200).json({
      status: 200,
      success: true,
    });
  } catch (error) {
    next(error);
  }
}

exports.delete = async (req, res, next) => {
  try {
    await global.validate(deleteValidationSchema, req);
    const response = await UserService.delete(req.body);
    res.status(200).json({
      status: 200,
      success: true,
      ...response
    });
  } catch (error) {
    next(error);
  }
}