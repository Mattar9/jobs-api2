const User = require('../models/User');
const {StatusCodes} = require("http-status-codes")
const CustomAPIError = require('../errors/custom-api');

const signup = async (req, res) => {
    const user = await User.create({...req.body})

    const token = user.createJWT()

    res.status(StatusCodes.CREATED).json({
        success: true,
        user: {
            name: user.name,
            lastName:user.lastName,
            email:user.email,
            location:user.location,
            token
        },
    });
}
const login =async (req, res) => {
    const {email,password} = req.body

    if (!email || !password) {
        throw new CustomAPIError('you must provide an email and password',StatusCodes.BAD_REQUEST);
    }

    const user = await User.findOne({email})
    if (!user) {
        throw new CustomAPIError('user does not exist',StatusCodes.UNAUTHORIZED);
    }

    const correctPassword = await user.comparePassword(password)
    if (!correctPassword) {
        throw new CustomAPIError('password is incorrect',StatusCodes.UNAUTHORIZED);
    }

    const token = user.createJWT()

    res.status(StatusCodes.OK).json({
        success: true,
        user: {
            name: user.name,
            lastName:user.lastName,
            email:user.email,
            location:user.location,
            token
        },
    })
}

const updateUser = async (req, res) => {
    const {name,email,lastName,location} = req.body
    if (!name || !lastName || !email  || !location) {
        throw new CustomAPIError('you must provide email,location,name,lastName',StatusCodes.BAD_REQUEST);
    }

    const user = await User.findByIdAndUpdate(req.user.userId,req.body)
    const token = user.createJWT()

   res.status(StatusCodes.OK).json({
       success: true,
       user: {
           name: user.name,
           lastName:user.lastName,
           email:user.email,
           location:user.location,
           token
       }
   })
}

module.exports = {signup, login, updateUser}