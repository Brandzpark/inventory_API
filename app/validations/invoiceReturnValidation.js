const yup = require("yup");

exports.createValidationSchema = yup.object({
  code: yup.string().required(),
  date: yup.string().required(),
  invoiceCode: yup.string().required(),
  remark: yup.string().required(),
  items: yup
    .array()
    .of(
      yup.object({
        code: yup.string().required(),
        name: yup.string().required(),
        remark: yup.string().required(),
        rate: yup.string().required(),
        quantity: yup.string().required(),
        isDamaged: yup.boolean().required(),
      })
    )
    .defined()
    .required()
    .min(1),
})

exports.updateValidationSchema = yup.object({
  _id: yup.string().required(),
  code: yup.string().required(),
  date: yup.string().required(),
  invoiceCode: yup.string().required(),
  remark: yup.string().required(),
  items: yup
    .array()
    .of(
      yup.object({
        code: yup.string().required(),
        name: yup.string().required(),
        remark: yup.string().required(),
        rate: yup.string().required(),
        quantity: yup.string().required(),
        isDamaged: yup.boolean().required(),
      })
    )
    .defined()
    .required()
    .min(1),
})
exports.deleteValidationSchema = yup.object({
  _id: yup.string().required(),
})