
const mongoose = require('mongoose');


module.exports = (e, req, res, next) => {

    if (e instanceof mongoose.Error.ValidationError) {
        e = transformMonooseValidationError(e);
    }
    console.log(e);
    
    if (e.code == 11000) {
        return res.status(e.code).json(e);
    }
    if (e.code == 422) {
        return res.status(e.code).json(e);
    }

    return res.status(500).json({
        success: false,
        message: "something went wrong"
    });
}


/**
 * 
 * @param MongooseValidationError  
 * @returns  ValidationError
 */
function transformMonooseValidationError(e) {
    const newError = {
        success: false,
        code: 422,
        name: "validationError",
    };
    const newList = {};
    const keys = Object.keys(e.errors);
    keys.forEach((k) => {
        newList[k] = e.errors[k].properties.message;
    })

    newError.errors = newList;

    return newError;
}