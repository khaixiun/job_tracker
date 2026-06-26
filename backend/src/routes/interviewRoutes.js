const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const {protect} = require('../middleware/authMiddleware');

router.route('/:id/interviews')
    .all(protect)
    .post(interviewController.scheduleInterview)
    .get(interviewController.getJobInterviews);

router.route('/:id/interviews/:interviewId')
    .all(protect)
     .put(interviewController.updateInterview)
     .delete(interviewController.deleteInterview);

module.exports = router;