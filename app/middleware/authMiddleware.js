var jwt = require("jsonwebtoken");
const { key } = require('../config');
const User = require("../models/User");

const userResource = require("../resources/userResource");

module.exports = async (req, res, next) => {
    const authHeader = req.get("authorization");

    if (key == "") {
        return res.status(500).json({ success: false, code: 500, message: "invalid key" });
    }

    if (!authHeader || authHeader.split(" ").length != 2) {
        return res
            .status(401)
            .json({ success: false, message: "Authentication Failed" });
    }

    try {
        const token = authHeader.split(" ")[1];

        var decoded = jwt.verify(token, key);
        const user = await User.findById({ _id: decoded?.data?._id, deletedAt: null })
        if (!user || !user.isActive) {
            return res
                .status(401)
                .json({ success: false, message: "Authentication Failed" });
        }
        req.user = userResource.resource(user);
        next();
    } catch (err) {
        console.log({ err });

        return res
            .status(401)
            .json({ success: false, message: "Authentication Failed" });
    }
};