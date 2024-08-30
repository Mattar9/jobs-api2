const CustomAPIError = require('../errors/custom-api');
const {StatusCodes} = require("http-status-codes");
const jwt = require("jsonwebtoken");

const protectedRoute = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new CustomAPIError('there is no token', StatusCodes.UNAUTHORIZED)
    }
    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {userId: payload.userId, name: payload.name};
        next()
    } catch (err) {
        throw new CustomAPIError('token is invalid', StatusCodes.UNAUTHORIZED)
    }
}

module.exports = protectedRoute