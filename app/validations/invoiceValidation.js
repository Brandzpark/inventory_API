const yup = require("yup");

exports.createValidationSchema = yup.object({
  code: yup.string().required(),
  date: yup.string().required(),
  deliveryDate: yup.string().required(),
  customerCode: yup.string().required(),
  address: yup.string().required(),
  salesRepCode: yup.string().required(),
  type: yup.string().required(),
  customerRemark: yup.string().optional(),
  customerRemarkFreeItems: yup.string().optional(),
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

exports.createWithPaymentValidationSchema = yup.object({
  code: yup.string().required(),
  date: yup.string().required(),
  deliveryDate: yup.string().required(),
  customerCode: yup.string().required(),
  address: yup.string().required(),
  salesRepCode: yup.string().required(),
  type: yup.string().required(),
  customerRemark: yup.string().optional(),
  customerRemarkFreeItems: yup.string().optional(),
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
  payment: yup.object({
    code: yup.string().required(),
    date: yup.string().required(),
    amount: yup.string().required(),
    paymentMethod: yup.string().required(),
  })
})

exports.updateValidationSchema = yup.object({
  _id: yup.string().required(),
  code: yup.string().required(),
  date: yup.string().required(),
  deliveryDate: yup.string().required(),
  customerCode: yup.string().required(),
  address: yup.string().required(),
  salesRepCode: yup.string().required(),
  type: yup.string().required(),
  customerRemark: yup.string().optional(),
  customerRemarkFreeItems: yup.string().optional(),
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
exports.deleteValidationSchema = yup.object({
  _id: yup.string().required(),
})