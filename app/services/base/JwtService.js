var jwt = require("jsonwebtoken");

const { key } = require('../../config')

exports.generateToken = (user) => {
    return jwt.sign(
        {
            data: {
                _id: user._id,
                firstName: user?.firstName,
                lastName: user?.lastName,
                email: user?.email,
            },
        },
        key,
        { expiresIn: "24h" }
    );
}