const yup = require("yup");

exports.createValidationSchema = yup.object({
  code: yup.string().required(),
  status: yup.string().required(),
  salutation: yup.string().required(),
  name: yup.string().required(),
  email: yup.string().email().required(),
  nic: yup.string().required(),
  mobileNumber: yup.string().required(),
  address: yup.string().required(),
  taxNo: yup.string().required(),
  openingBalance: yup.string().required(),
  // creditLimit: yup.string().required(),
  creditPeriod: yup.string().required(),
})


exports.updateValidationSchema = yup.object({
  _id: yup.string().required(),
  status: yup.string().required(),
  salutation: yup.string().required(),
  name: yup.string().required(),
  email: yup.string().email().required(),
  nic: yup.string().required(),
  mobileNumber: yup.string().required(),
  address: yup.string().required(),
  taxNo: yup.string().required(),
  openingBalance: yup.string().required(),
  // creditLimit: yup.string().required(),
  creditPeriod: yup.string().required(),
})

exports.deleteValidationSchema = yup.object({
  _id: yup.string().required(),
})

