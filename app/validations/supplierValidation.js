const yup = require("yup");

exports.createValidationSchema = yup.object({
    code: yup.string().required(),
    salutation: yup.string().required(),
    name: yup.string().required(),
    email: yup.string().email().required(),
    mobileNumber: yup.string().required(),
    address: yup.string().required(),
    nic: yup.string().required(),
    taxNo: yup.string().required(),
})


exports.updateValidationSchema = yup.object({
    _id: yup.string().required(),
    salutation: yup.string().required(),
    name: yup.string().required(),
    email: yup.string().email().required(),
    mobileNumber: yup.string().required(),
    address: yup.string().required(),
    nic: yup.string().required(),
    taxNo: yup.string().required(),
})

exports.deleteValidationSchema = yup.object({
    _id: yup.string().required(),
})

