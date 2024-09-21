const yup = require("yup");

exports.createValidationSchema = yup.object({
  code: yup.string().required(),
  orderDate: yup.string().required(),
  requiredDate: yup.string().required(),
  remark: yup.string().nullable().optional(),
  supplier: yup
    .object({
      _id: yup.string().required(),
      code: yup.string().required(),
    })
    .required(),
  items: yup
    .array()
    .of(
      yup.object({
        code: yup.string().required(),
        remark: yup.string().optional(),
        rate: yup.string().required(),
        discount: yup.string().required(),
        quantity: yup.string().required(),
      })
    )
    .defined()
    .required()
    .min(1),
});

exports.updateValidationSchema = yup.object({
  _id: yup.string().required(),
  code: yup.string().required(),
  orderDate: yup.string().required(),
  requiredDate: yup.string().required(),
  remark: yup.string().nullable().optional(),
  supplier: yup
    .object({
      _id: yup.string().required(),
      code: yup.string().required(),
    })
    .required(),
  items: yup
    .array()
    .of(
      yup.object({
        code: yup.string().required(),
        remark: yup.string().optional(),
        rate: yup.string().required(),
        discount: yup.string().required(),
        quantity: yup.string().required(),
      })
    )
    .defined()
    .required()
    .min(1),
});

exports.deleteValidationSchema = yup.object({
  _id: yup.string().required(),
});