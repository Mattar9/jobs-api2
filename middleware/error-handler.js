const { StatusCodes } = require('http-status-codes')

const errorHandlerMiddleware = (err, req, res, next) => {
  const customError = {
    statusCode:err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || 'something went wrong, please try again later',
  }

  if (err.name === 'ValidationError') {
    customError.message = Object.values(err.errors).map((item) => item.message).join(', ');
    customError.statusCode = StatusCodes.BAD_REQUEST
  }
  if (err.code && err.code === 11000){
    customError.statusCode = StatusCodes.BAD_REQUEST
    customError.message = `Duplicate value entered for ${Object.keys(err.keyValue)} field, please choose another value`
  }
  if(err.name === 'CustomError'){
    customError.message = `no item found with id ${err.value}`
    customError.statusCode = StatusCodes.NOT_FOUND
  }

  return res.status(customError.statusCode).json({ msg:customError.message })
}

module.exports = errorHandlerMiddleware
