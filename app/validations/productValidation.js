const yup = require("yup");

exports.createValidationSchema = yup.object({
    code: yup.string().required(),
    name: yup.string().required(),
    category: yup.string().required(),
    department: yup.string().required(),
    remark: yup.string().nullable().optional(),
    price: yup.string().required(),
    isActive: yup.boolean().required(),
    cost: yup.string().required(),
    discount: yup.string().optional(),
    warehouseQuantity: yup.array()
        .of(yup.object({
            warehouse: yup.string().default("Default"),
            quantity: yup.string().required(),
        }))
        .defined()
        .required()
        .min(1),
})


exports.updateValidationSchema = yup.object({
    _id: yup.string().required(),
    name: yup.string().required(),
    category: yup.string().required(),
    department: yup.string().required(),
    remark: yup.string().nullable().optional(),
    price: yup.string().required(),
    isActive: yup.boolean().required(),
    cost: yup.string().required(),
    discount: yup.string().optional(),
})

exports.deleteValidationSchema = yup.object({
    _id: yup.string().required(),
})

exports.stockAdjustmentSchema = yup.object({
    date: yup.string().required(),
    type: yup.string().required(),
    reason: yup.string().required(),
    description: yup.string().optional(),
    items: yup.array()
    .of(yup.object({
        code: yup.string().required(),
        quantity: yup.string().required(),
    }))
    .defined()
    .required()
    .min(1),
})