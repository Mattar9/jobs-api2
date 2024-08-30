const express = require('express')
const {
    getAllJobs,
    createJob,
    getJob,
    updateJob,
    deleteJob,
    showStats
} = require("../controllers/jobs");
const router = express.Router()
// const testUser = require('../middleware/testUser')

router.route('/').post(createJob).get(getAllJobs)
router.route('/stats').get(showStats)
router.route('/:id').get(getJob).patch(updateJob).delete(deleteJob)

module.exports = router