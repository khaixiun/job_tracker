const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const {protect} = require('../middleware/authMiddleware');

router.route('/')
    .all(protect)
    .post(jobController.createJob)
    .get(jobController.getJobs);

router.route('/:id')
    .all(protect)
    .get(jobController.getJobById)
    .put(jobController.updateJob)
    .delete(jobController.deleteJob);

module.exports = router;