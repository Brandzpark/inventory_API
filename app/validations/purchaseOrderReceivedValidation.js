const yup = require("yup");

exports.createValidationSchema = yup.object({
    code: yup.string().required(),
    purchaseOrderCode: yup.string().required(),
    receivedDate: yup.string().required(),
    remark: yup.string().required(),
    discount: yup.string().required(),
    items: yup
        .array()
        .of(
            yup.object({
                code: yup.string().required(),
                name: yup.string().required(),
                orderedQuantity: yup.string().required(),
                receivedQuantity: yup.string().required(),
                requestAmount: yup.string().required(),
                amount: yup.string().required(),
            })
        )
        .defined()
        .required()
        .min(1),
});

exports.updateValidationSchema = yup.object({
    code: yup.string().required(),
    purchaseOrderCode: yup.string().required(),
    receivedDate: yup.string().required(),
    remark: yup.string().required(),
    discount: yup.string().required(),
    items: yup
        .array()
        .of(
            yup.object({
                code: yup.string().required(),
                name: yup.string().required(),
                orderedQuantity: yup.string().required(),
                receivedQuantity: yup.string().required(),
                requestAmount: yup.string().required(),
                amount: yup.string().required(),
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