const bcrypt = require("bcryptjs");
const User = require('../models/User')
const Role = require('../models/Role')
const { generateToken } = require('./base/JwtService')
const { ValidationException } = require('../exceptions')
const fs = require('fs');
const path = require('path');
const { now } = require('mongoose');


const { v4: uuidv4 } = require('uuid');
const userResource = require('../resources/userResource')


exports.getAll = async (query) => {
  const users = await User.find({ deletedAt: null }).exec();
  return {
    users
  }
}

exports.loginUser = async (data) => {
  const user = await User.findOne({ email: data?.email, deletedAt: null, isActive: true }).exec();
  if (user == null || !(await bcrypt.compare(data?.password, user.password))) {
    throw new ValidationException({ email: "Invalid email or password" });
  }
  const token = generateToken(user?._doc)
  return {
    user: userResource.resource(user?._doc),
    token
  }
}

exports.registerUser = async (data) => {

  const role = await Role.findOne({ name: data?.role }).lean()
  if (!role) {
    throw new ValidationException({ role: "Role is not valid" })
  }
  const userData = {
    firstName: data?.firstName,
    lastName: data?.lastName,
    email: data?.email,
    password: await bcrypt.hash(data?.password, 10),
    role: role.name,
    isActive: data.isActive,
    permissions: role?.permissions,
  }

  try {
    const user = await new User(userData).save()
    return {
      user: userResource.resource(user?._doc),
    }
  } catch (error) {
    throw new ValidationException(error)
  }
}

exports.updateUser = async (data) => {
  const role = await Role.findOne({ name: data?.role }).lean()
  if (!role) {
    throw new ValidationException({ role: "Role is not valid" })
  }
  const userData = {
    firstName: data?.firstName,
    lastName: data?.lastName,
    email: data?.email,
    role: role.name,
    isActive: data.isActive,
    permissions: role?.permissions,
  }
  try {
    const user = await User.findByIdAndUpdate(data._id,
      {
        ...userData
      },
      { new: true }
    )
    return {
      user: userResource.resource(user?._doc),
    }
  } catch (error) {
    throw new ValidationException(error)
  }
}


exports.baseUpdateUser = async (req) => {
  let data = req.body
  if (req.files?.image) {
    const image = req.files.image
    const uploadDir = path.join('uploads', 'profileImages');
    const uploadPath = path.join(uploadDir, uuidv4() + ".png");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    image.mv(uploadPath)
    const baseUrl = `${req.protocol}://${req.get('host')}/`;
    const imageUrl = baseUrl + uploadPath
    data = { ...data, image: imageUrl }
  }

  const userData = {
    firstName: data?.firstName,
    lastName: data?.lastName,
    image: data?.image ?? null
  }
  try {
    const user = await User.findByIdAndUpdate(
      data?._id,
      { ...userData },
      { new: true }
    )
    return {
      user: userResource.resource(user?._doc),
    }
  } catch (error) {
    throw new ValidationException(error)
  }
}

exports.passwordChange = async (data, user) => {
  const userData = await User.findOne({ _id: user?._id }).lean()

  if (userData == null || !(await bcrypt.compare(data?.password, userData.password))) {
    throw new ValidationException({ password: "Current passowrd is incorrect" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      userData?._id,
      { password: await bcrypt.hash(data?.newPassword, 10), },
      { new: true }
    )
    return {
      user: userResource.resource(user?._doc),
    }
  } catch (error) {
    throw new ValidationException(error)
  }
}

exports.delete = async (req) => {
  try {
    const role = await User.findByIdAndUpdate(
      req?._id,
      {
        $set: {
          deletedAt: now()
        },
      },
      { new: true }
    );
    return {
      data: role._doc
    }
  } catch (error) {
    throw new ValidationException(error)
  }
}