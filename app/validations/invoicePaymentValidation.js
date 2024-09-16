const yup = require("yup");

exports.createValidationSchema = yup.object({
  code: yup.string().required(),
  date: yup.string().required(),
  amount: yup.string().required(),
  paymentMethod: yup.string().required(),
})

exports.updateValidationSchema = yup.object({
  _id: yup.string().required(),
  code: yup.string().required(),
  date: yup.string().required(),
  amount: yup.string().required(),
  paymentMethod: yup.string().required(),
})

exports.deleteValidationSchema = yup.object({
  _id: yup.string().required(),
})