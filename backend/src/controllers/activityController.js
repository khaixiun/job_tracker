const pool = require('../config/db');

const addActivity = async (req, res) => {
    try{
        const jobId = req.params.id;
        const userId = req.user.id;
        const {status, notes} = req.body;

        const [jobCheck] = await pool.query(
            'SELECT job_id FROM jobs WHERE job_id = ? AND user_id = ? AND deleted_at IS NULL',
            [jobId, userId]
        )

        if (jobCheck.length === 0) {
            return res.status(400).json({message: "Job application not found or unauthorized"});
        }

        await pool.query(
            `INSERT INTO job_activities (job_id, status, notes) VALUES (?, ?, ?)`,
            [jobId, status || null, notes]
        );

        return res.statsu(201).json({message: "Activity logged successfully"});

    } catch(err) {
        console.error("Add Activity Error: ", err.message);
        return res.status(500).json({message: "Internal Server Error"});
    }
};

const getJobActivities = async (req, res) => {
    try{
        const jobId = req.params.id;
        const userId = req.user.id;

        const [activities] = await pool.query(
            `SELECT a.* FROM job_activities a
            JOIN jobs j on a.job_id = j.job_id
            WHERE j.job_id = ? AND j.user_id = ? AND j.deleted_at IS NULL
            ORDER BY a.activity_date DESC`,
            [jobId, userId]
        );

        return res.status(200).json(activities);
    } catch(err){
        console.error("Get Activities Error: ", err.message);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

module.exports = {
    addActivity,
    getJobActivities
}