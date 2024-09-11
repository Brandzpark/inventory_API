var jwt = require("jsonwebtoken");
const { key } = require('../config');
const User = require("../models/User");


module.exports.can = (...permissions) => {
  const permissionsList = [].concat.apply([], permissions);

  return async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(" ")[1];

    var decoded = jwt.verify(token, key);
    const user = await User.findById({ _id: decoded?.data?._id, deletedAt: null })
    const userPermissionsList = user.permissions

    if (userPermissionsList.includes(permissionsList.sort().toString())) {
      return next();
    }
    return res
      .status(403)
      .json({ success: false, message: "Forbidden. you don't have permission to access this resource" });

  }
}