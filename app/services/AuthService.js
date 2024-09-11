const UserService = require('./UserService')
const { generateToken } = require('./JwtService')

exports.loginUser = async (req) => {
    const user = await UserService.login(req)
    const token = generateToken(user)
    return {
        user,
        token
    }
}

exports.registerUser = async (req) => {
    const user = await UserService.create(req)
    const token = generateToken(user)
    return {
        user,
        token
    }
}