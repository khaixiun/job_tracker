const pool = require('../config/db');

const scheduleInterview = async (req, res) => {
    const connection = await pool.getConnection();

    try{
        const jobId = req.params.id;
        const userId = req.user.id;

        const interviewType = req.body.interviewType?.trim();
        const meetingLink = req.body.meetingLink?.trim();
        const notes = req.body.notes?.trim();
        const scheduledAt = req.body.scheduledAt;

        if (!scheduledAt) {
            return res.status(400).json({ message: "Scheduled date/time is required." });
        }

        const parsedDate = new Date(scheduledAt);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({ message: "Invalid scheduled date/time format." });
        }
        
        if(!interviewType) {
            return res.status(400).json({message: "Interview type and scheduled date/time are required"});
        }

        if(interviewType.length > 20){
            return res.status(400).json({message: "Interview type must be 20 characters or less."});
        }
 
        await connection.beginTransaction();

        const [jobCheck] = await connection.query(
            `SELECT company_name, current_status FROM jobs WHERE job_id = ? AND user_id = ? AND deleted_at IS NULL`,
             [jobId, userId]
        );

        if(jobCheck.length === 0) {
            await connection.rollback();
            return res.status(404).json({message: "Job application not found or unauthorized"});
        }

        const job = jobCheck[0];

        const [interviewResult] = await connection.query(
            `INSERT INTO interviews (job_id, interview_type, scheduled_at, meeting_link, notes) VALUES (?, ?, ?, ?, ?)`,
             [jobId, interviewType, scheduledAt, meetingLink || null, notes || null]
        );

        await connection.query(
            `INSERT INTO job_activities (job_id, status, notes) VALUES (?, ?, ?)`,
            [jobId, job.current_status, `Scheduled ${interviewType} for ${job.company_name} at ${scheduledAt}`]
        );

        await connection.commit();
        return res.status(201).json({ 
            message: "Interview scheduled successfully",
            interviewId: interviewResult.insertId
        });
    } catch (err) {
        await connection.rollback();
        console.error("Schedule Interview Error: ", err.message);
        return res.status(500).json({message: "Internal Server Error"});
    } finally {
        connection.release();
    }
};

const getJobInterviews = async (req, res) => {
    try{
        const jobId = req.params.id;
        const userId = req.user.id;

        const [interviews] = await pool.query(
            `SELECT i.interview_id AS interviewId, i.interview_type AS interviewType,
                    i.scheduled_at AS scheduledAt, i.meeting_link AS meetingLink, i.notes
             FROM interviews i
             JOIN jobs j ON i.job_id = j.job_id
             WHERE j.job_id = ? AND j.user_id = ? AND j.deleted_at IS NULL
             ORDER BY i.scheduled_at ASC`,
             [jobId, userId]
        );

        return res.status(200).json(interviews);
    } catch (err) {
        console.error("Get Job Interview Error: ", err.message);
        return res.status(500).json({message: "Internal Server Error"});
    }
};

const updateInterview = async (req, res) => {
    const connection = await pool.getConnection();

    try{
        const userId = req.user.id;
        const jobId = req.params.id;
        const interviewId = req.params.interviewId;

        const interviewType = req.body.interviewType?.trim();
        const meetingLink = req.body.meetingLink?.trim();
        const notes = req.body.notes?.trim();
        const scheduledAt = req.body.scheduledAt;

        if (!scheduledAt) {
            return res.status(400).json({ message: "Scheduled date/time is required." });
        }

        const parsedDate = new Date(scheduledAt);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({ message: "Invalid scheduled date/time format." });
        }

        if(!interviewType){
            return res.status(400).json({message: "Interview type and scheduled date/time are required."});
        }

        if(interviewType.length > 20){
            return res.status(400).json({message: "Interview type must be 20 characters or less."});
        }

        await connection.beginTransaction();

        const [currentState] = await connection.query(
            `SELECT i.interview_type, j.company_name, j.current_status
             FROM interviews i
             JOIN jobs j ON i.job_id = j.job_id
             WHERE i.interview_id = ? AND j.job_id = ? AND j.user_id = ? AND j.deleted_at IS NULL`,
             [interviewId, jobId, userId]
        );

        if(currentState.length === 0){
            await connection.rollback();
            return res.status(404).json({message: "Interview record or job application not found"});
        }

        const interview = currentState[0];
        const oldInterviewType = interview.interview_type;
        const companyName = interview.company_name;
        const currentStatus = interview.current_status;

        const [result] = await connection.query(
            `UPDATE interviews
             SET interview_type = ?,
                 scheduled_at = ?,
                 meeting_link = ?,
                 notes = ?
             WHERE interview_id = ? AND job_id = ?`,
             [interviewType, scheduledAt, meetingLink || null, notes || null, interviewId, jobId]
        );

        if(result.affectedRows === 0){
            await connection.rollback();
            return res.status(409).json({message: "Update failed due to a conflict or record missing."});
        }

        let logMessage = `Updated interview details for ${interviewType} round at ${companyName}`;
        if(oldInterviewType !== interviewType){
            logMessage = `Interview round changed from "${oldInterviewType}" to "${interviewType}" at ${companyName}`;
        }

        await connection.query(
            `INSERT INTO job_activities (job_id, status, notes) VALUES (?, ?, ?)`,
            [jobId, currentStatus, logMessage]
        );

        await connection.commit();
        return res.status(200).json({message: "Interview details updated successfully"});

    } catch(err) {
        await connection.rollback();
        console.error("Update interview Error: ", err.message);
        return res.status(500).json({message: "Internal Server Error"});
    } finally {
        connection.release();
    }
};

const deleteInterview = async (req, res) => {
    const connection = await pool.getConnection();

    try{
        const userId = req.user.id;
        const jobId = req.params.id;
        const interviewId = req.params.interviewId;

        await connection.beginTransaction();

        const [currentState] = await connection.query(
            `SELECT i.interview_type, j.company_name, j.current_status
             FROM interviews i 
             JOIN jobs j ON i.job_id = j.job_id
             WHERE i.interview_id = ? AND j.job_id = ? AND j.user_id = ? AND j.deleted_at IS NULL`,
             [interviewId, jobId, userId]
        );

        if(currentState.length === 0){
            await connection.rollback();
            return res.status(404).json({message: "Interview record or job application not found"});
        }

        const interview = currentState[0];
        const interviewType = interview.interview_type;
        const companyName = interview.company_name;
        const currentStatus = interview.current_status;

        const [result] = await connection.query(
            `DELETE FROM interviews WHERE interview_id = ? AND job_id = ?`,
            [interviewId, jobId]
        );

        if(result.affectedRows === 0){
            await connection.rollback();
            return res.status(409).json({message: "Delete operation failed or record already removed"});
        }

        await connection.query(
            `INSERT INTO job_activities (job_id, status, notes) VALUES (?, ?, ?)`,
            [jobId, currentStatus, `Cancelled/Removed ${interviewType} round for ${companyName}`]
        );

        await connection.commit();
        return res.status(200).json({message: "Interview round deleted successfully"});
    } catch (err) {
        await connection.rollback();
        console.error("Delete Interview Error ", err.message);
        return res.status(500).json({message: "Internal Server Error"});
    } finally {
        connection.release();
    }
};

module.exports = {
    scheduleInterview,
    getJobInterviews,
    updateInterview,
    deleteInterview
}