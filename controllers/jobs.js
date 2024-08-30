const Jobs = require('../models/Job');
const {StatusCodes} = require('http-status-codes')
const {CustomAPIError} = require("../errors");
const mongoose = require('mongoose');
const moment = require('moment');

const getAllJobs = async (req, res) => {
    const {search, status, jobType, sort} = req.query

    const queryObject = {
        createdBy: req.user.userId
    }

    if (search) {
        queryObject.position = {$regex: search, $options: "i"};
    }
    if (status && status !== 'all') {
        queryObject.status = status;
    }
    if (jobType && jobType !== 'all') {
        queryObject.jobType = jobType;
    }

    let result = Jobs.find(queryObject)

    if (sort === 'latest') {
        result = result.sort('-createdAt');
    }
    if (sort === 'oldest') {
        result = result.sort('createdAt');
    }
    if (sort === 'a-z') {
        result = result.sort('position')
    }
    if (sort === 'z-a') {
        result = result.sort('-position')
    }

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    result = result.skip(skip).limit(limit)

    const jobs = await result

    const totalJobs = await Jobs.countDocuments(queryObject)
    const numOfPages = Math.ceil(totalJobs / limit)

    res.status(StatusCodes.OK).json({
        success: true,
        jobs,
        totalJobs,
        numOfPages,
    })
}

const getJob = async (req, res) => {
    const {id} = req.params
    const job = await Jobs.findById(id)
    const createdBy = job.createdBy.toString()

    if (createdBy !== req.user.userId) {
        throw new CustomAPIError(`job with id ${id} does not belong to you`, StatusCodes.UNAUTHORIZED)
    }
    if (!job) {
        throw new CustomAPIError(`job with id ${id} not found`, StatusCodes.NOT_FOUND)
    }

    res.status(StatusCodes.OK).json({
        success: true,
        data: job
    })
}
const createJob = async (req, res) => {
    req.body.createdBy = req.user.userId;
    const job = await Jobs.create(req.body)
    res.status(StatusCodes.CREATED).json({
        success: true,
        data: job
    })
}
const updateJob = async (req, res) => {
    const {
        body: {company, position},
        params: {id: jobId},
        user: {userId}
    } = req

    if (company === '' || position === '' || !company || !position) {
        throw new CustomAPIError('please provide company and position', StatusCodes.BAD_REQUEST)
    }

    const job = await Jobs.findOneAndUpdate({_id: jobId, createdBy: userId}, req.body, {new: true, runValidators: true})

    if (!job) {
        throw new CustomAPIError(`job with id ${jobId} not found`, StatusCodes.NOT_FOUND)
    }

    res.status(StatusCodes.OK).json({
        success: true,
        data: job
    })
}
const deleteJob = async (req, res) => {
    const {
        params: {id: jobId},
        user: {userId}
    } = req

    const job = await Jobs.findOneAndDelete({_id: jobId, createdBy: userId})

    if (!job) {
        throw new CustomAPIError(`job with id ${jobId} not found`, StatusCodes.NOT_FOUND)
    }

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Job deleted successfully'
    })
}

const showStats = async (req, res) => {
    let stats = await Jobs.aggregate([
        {$match: {createdBy: new mongoose.Types.ObjectId(req.user.userId)}},
        {$group: {_id: '$status', count: {$sum: 1}}}
    ])

    stats = stats.reduce((acc, current) => {
        const {_id: title, count} = current
        acc[title] = count
        return acc
    }, {})

    const defaultStats = {
        pending: stats.pending || 0,
        interview: stats.interview || 0,
        declined: stats.declined || 0
    }

    let monthlyApplications = await Jobs.aggregate([
        {$match: {createdBy: new mongoose.Types.ObjectId(req.user.userId)}},
        {
            $group: {
                _id: {year: {$year: '$createdAt'}, month: {$month: '$createdAt'}},
                count: {$sum: 1}
            },
        },
        {$sort:{'_id.year': -1,'_id.month': -1}},
        {$limit:6}
    ])

    monthlyApplications = monthlyApplications.map((item)=>{
      const {_id:{year,month},count} = item
        const date = moment().month(month - 1).year(year).format('MMM Y')
        return {date,count}
    }).reverse()

    res.status(StatusCodes.OK).json({
        success: true,
        defaultStats,
        monthlyApplications
    })
}

module.exports = {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    showStats
}
