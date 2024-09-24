const yup = require("yup");

exports.createValidationSchema = yup.object({
  code: yup.string().required(),
  purchaseOrderCode: yup.string().required(),
  receivedDate: yup.string().required(),
  remark: yup.string().nullable().optional(),
  items: yup
    .array()
    .of(
      yup.object({
        code: yup.string().required(),
        receivedQuantity: yup.string().required(),
      })
    )
    .defined()
    .required()
    .min(1),
});

exports.updateValidationSchema = yup.object({
  _id: yup.string().required(),
  code: yup.string().required(),
  purchaseOrderCode: yup.string().required(),
  receivedDate: yup.string().required(),
  remark: yup.string().nullable().optional(),
  items: yup
    .array()
    .of(
      yup.object({
        code: yup.string().required(),
        receivedQuantity: yup.string().required(),
      })
    )
    .defined()
    .required()
    .min(1),
});

exports.deleteValidationSchema = yup.object({
  _id: yup.string().required(),
  purchaseOrderCode: yup.string().required(),
});