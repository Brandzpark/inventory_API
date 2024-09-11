const yup = require("yup");

exports.createValidationSchema = yup.object({
    name: yup.string().required(),
    permissions: yup.array()
        .of(yup.string())
        .defined()
        .required()
        .min(1),
})


exports.updateValidationSchema = yup.object({
    _id: yup.string().required(),
    name: yup.string().required(),
    permissions: yup.array()
        .of(yup.string())
        .defined()
        .required()
        .min(1),
})



exports.deleteValidationSchema = yup.object({
    _id: yup.string().required(),
})

