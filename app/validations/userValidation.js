const yup = require("yup");

exports.loginValidationSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
})


exports.basicUpdateValidationSchema = yup.object({
  _id: yup.string().required(),
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  email: yup.string().email().required(),
})


exports.registerValidationSchema = yup.object({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().required(),
  role: yup.string().required(),
})


exports.updateValidationSchema = yup.object({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().required(),
  role: yup.string().required(),
})

exports.passwordChangeValidationSchema = yup.object({
  password: yup.string().required(),
  newPassword: yup.string().required(),
  passwordConfirmation: yup.string()
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm Password is required'),
})

exports.deleteValidationSchema = yup.object({
  _id: yup.string().required(),
})

