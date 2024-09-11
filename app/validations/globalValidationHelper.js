const { ValidationException } = require("../exceptions");

const validate = async function (schema, req) {

    const schemaDescription = schema.describe();
    const data = {};
    const requestBody = {...req.body, ...req.files, ...req.query} ?? {};

    Object.keys(schemaDescription?.fields).forEach((key) => {
        data[key] = requestBody[key] ?? null;
    });

    try {
        await schema.validate(data, { abortEarly: false })
    } catch (error) {
        const errors = error.inner.reduce((errors, innerError) => {
            errors[innerError.path] = innerError.message;
            return errors;
        }, {})
        throw new ValidationException(errors);
    }
};

const init = function () {
    global.validate = validate;
};

module.exports.init = init;
