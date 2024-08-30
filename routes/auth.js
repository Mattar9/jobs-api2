const express = require('express')
const {signup, login,updateUser} = require("../controllers/auth");
const protectedRoute = require('../middleware/authentication');
const rateLimiter = require('express-rate-limit');
const router = express.Router()

const apiLimiter = rateLimiter({
    windowMs:15 * 60 * 1000,
    max:15,
    message:{
        msg:'too many requests from this api, please try again after 15 minutes'
    }
})

router.route('/register').post(apiLimiter,signup)
router.route('/login').post(apiLimiter,login)
router.route('/updateUser').patch( protectedRoute,updateUser)

module.exports = router