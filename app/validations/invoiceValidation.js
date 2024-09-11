const yup = require("yup");

exports.createValidationSchema = yup.object({
  code: yup.string().required(),
  date: yup.string().required(),
  deliveryDate: yup.string().required(),
  customer: yup.string().required(),
  salesRep: yup.string().required(),
  address: yup.string().required(),
  type: yup.string().required(),
  customerRemark: yup.string().required(),
  customerRemarkFreeItems: yup.string().required(),
  hasFreeIssueItems: yup.boolean().required(),
  items: yup
    .array()
    .of(
      yup.object({
        code: yup.string().required(),
        name: yup.string().required(),
        remark: yup.string().required(),
        rate: yup.string().required(),
        discount: yup.string().required(),
        quantity: yup.string().required(),
        type: yup.string().required(),
      })
    )
    .defined()
    .required()
    .min(1),
})
exports.updateValidationSchema = yup.object({})
exports.deleteValidationSchema = yup.object({})