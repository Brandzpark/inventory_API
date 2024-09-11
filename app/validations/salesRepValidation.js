const yup = require("yup");

exports.createValidationSchema = yup.object({
    code: yup.string().required(),
    salutation: yup.string().required(),
    name: yup.string().required(),
    email: yup.string().email().required(),
    address: yup.string().required(),
    mobileNumber: yup.string().required(),
    nic: yup.string().required(),
    taxNo: yup.string().required(),
    customers: yup.array()
        .defined()
        .required()
        .min(1),
})


exports.updateValidationSchema = yup.object({
    _id: yup.string().required(),
    salutation: yup.string().required(),
    name: yup.string().required(),
    email: yup.string().email().required(),
    address: yup.string().required(),
    mobileNumber: yup.string().required(),
    nic: yup.string().required(),
    taxNo: yup.string().required(),
    customers: yup.array()
        .defined()
        .required()
        .min(1),
})



exports.deleteValidationSchema = yup.object({
    _id: yup.string().required(),
})

