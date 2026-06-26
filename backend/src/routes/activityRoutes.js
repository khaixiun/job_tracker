const express = require('express');
const router = express.Router();
const activityController = require ('../controllers/activityController');
const {protect} = require('../middleware/authMiddleware');

router.route('/:id/activities')
    .all(protect)
    .post(activityController.addActivity)
    .get(activityController.getJobActivities);

module.exports = router;