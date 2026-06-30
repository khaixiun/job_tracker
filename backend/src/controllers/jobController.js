const pool = require('../config/db');

const STATUS_MAP = {
    'Pending' : 'P',
    'Interviewing': 'I',
    'Rejected': 'R',
    'Offered': 'O'
};

const DISPLAY_STATUS_MAP = {
    'P': 'Pending',
    'I': 'Interviewing',
    'R': 'Rejected',
    'O': 'Offered'
};

const formatJobStatus = (job) => {
    if (!job) return null;
    return {
        ...job,
        currentStatus: DISPLAY_STATUS_MAP[job.currentStatus] || 'Unknown'
    };
};

const createJob = async (req, res) => {
    const companyName = req.body.companyName?.trim();
    const jobTitle = req.body.jobTitle?.trim();
    const salary = req.body.salary?.trim();
    const location = req.body.location?.trim();
    const jobUrl = req.body.jobUrl?.trim();
    const rawStatus = req.body.status?.trim();

    const currentStatus = rawStatus
        ? rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase()
        : null;

    if(currentStatus && !STATUS_MAP[currentStatus]){
        return res.status(400).json({
            message: "Invalid status value provided"
        });
    }

    const statusCode = currentStatus ? STATUS_MAP[currentStatus] : "P";
    const statusText = DISPLAY_STATUS_MAP[statusCode] || "Pending";

    if(!companyName || !jobTitle) {
        return res.status(400).json({
            message: "Company name and job title fields are required"
        });
    }

    const connection = await pool.getConnection();

    try{
        const userId = req.user.id;

        await connection.beginTransaction();

        const [result] = await connection.query(
            `INSERT INTO jobs(user_id, company_name, job_title, salary, location, job_url, current_status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
             [
                userId,
                companyName,
                jobTitle,
                salary || null,
                location || null,
                jobUrl || null,
                statusCode
             ]
        );

        const jobId = result.insertId;
        await connection.query(
            `INSERT INTO job_activities (job_id, status, notes) VALUES (?, ?, ?)`,
            [jobId, statusCode, `Job tracking application initialized under status ${statusText}`]
        )

        await connection.commit();

        return res.status(201).json({
            message: "Job application added successfully! ",
            jobId: jobId
        })
    } catch (err){
        await connection.rollback();
        console.error("Create Job Error", err);
        return res.status(500).json({message: "Internal Server Error"});
    } finally {
        connection.release();
    }
};

const getJobs = async (req, res) => {
    try{
        const userId = req.user.id;
        const {search, status} = req.query;

        const searchText = search?.trim();
        const rawStatus = status?.trim();

        const statusText = rawStatus
            ? rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase()
            : null;

        if (statusText && !STATUS_MAP[statusText]) {
            return res.status(400).json({
                message: "Invalid status filter"
            });
        }

        let query = `
            SELECT
                job_id AS jobId,
                user_id AS userId,
                company_name AS companyName,
                job_title AS jobTitle,
                current_status AS currentStatus,
                job_url AS jobUrl,
                salary,
                location,
                created_at AS createdAt,
                updated_at AS updatedAt,
                deleted_at AS deletedAt
            FROM jobs
            WHERE user_id = ? AND deleted_at IS NULL
        `;

        let queryParams = [userId];

        if (searchText) {
            query += ' AND (company_name LIKE ? OR job_title LIKE ?)';
            const searchWildcard = `%${searchText}%`;
            queryParams.push(searchWildcard, searchWildcard);
        }

        if (statusText) {
            query += ' AND current_status = ?';
            queryParams.push(STATUS_MAP[statusText]);
        }

        query += ' ORDER BY created_at DESC';
        
        //console.log("EXECUTING QUERY:", query);
        //console.log("WITH PARAMETERS:", queryParams);

        const [jobs] = await pool.query(query, queryParams);
        const formattedJobs = jobs.map(formatJobStatus);

        return res.status(200).json(formattedJobs);
    } catch(err) {
        console.error("Get Jobs Error", err);
        return res.status(500).json({message: "Internal Server Error"});
    }
};

const getJobById = async (req, res) => {
    try{
        const userId = req.user.id;
        const jobId = req.params.id;

        const [jobs] = await pool.query(
            `SELECT
                job_id AS jobId,
                user_id AS userId,
                company_name AS companyName,
                job_title AS jobTitle,
                current_status AS currentStatus,
                job_url AS jobUrl,
                salary,
                location,
                created_at AS createdAt,
                updated_at AS updatedAt,
                deleted_at AS deletedAt
            FROM jobs
            WHERE user_id = ? AND deleted_at IS NULL`,
            [jobId, userId] 
        )

        if(jobs.length === 0){
            return res.status(404).json({message: "Job application not found"});
        }

        const formattedJobs = formatJobStatus(jobs[0]);

        return res.status(200).json(formattedJobs);

    } catch(err) {
        console.error("Get Job By ID Error: ", err.message);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

const updateJob = async (req, res) => {
    const connection = await pool.getConnection();

    try{
        const userId = req.user.id;
        const jobId = req.params.id;

        const companyName = req.body.companyName?.trim();
        const jobTitle = req.body.jobTitle?.trim();
        const salary = req.body.salary?.trim();
        const location = req.body.location?.trim();
        const jobUrl = req.body.jobUrl?.trim();
        const rawStatus = req.body.status?.trim();

        const currentStatus = rawStatus
            ? rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase()
            : null;

        if(!companyName || !jobTitle || !currentStatus) {
            return res.status(400).json({message: "Company name, job title, and status are required fields"});
        }

        const statusCode = STATUS_MAP[currentStatus];
        if(!statusCode) {
            return res.status(400).json({message: "Invalid status value provided"});
        }

        await connection.beginTransaction();

        const [currentJobState] = await connection.query(
            `SELECT current_status FROM jobs WHERE job_id = ? AND user_id = ? AND deleted_at IS NULL`,
            [jobId, userId]
        )

        if(currentJobState.length === 0){
            await connection.rollback();
            return res.status(404).json({message: "Job application not found or unauthorized"});
        };

        const oldStatusCode = currentJobState[0].current_status;

        const[result] = await connection.query(
            `UPDATE jobs
             SET company_name = ?, job_title = ?, salary = ?, location = ?, job_url = ?, current_status = ? 
             WHERE job_id = ? AND user_id = ? AND deleted_at IS NULL`,
             [companyName, jobTitle, salary || null, location || null, jobUrl || null, statusCode, jobId, userId]
        )

        if (result.affectedRows === 0)  {
            await connection.rollback();
            return res.status(409).json({
                message: "This job application is no longer available to update"
            });
        }

        if(oldStatusCode !== statusCode) {
            const oldStatusText = DISPLAY_STATUS_MAP[oldStatusCode] || 'Unknown';
            const newStatusText = DISPLAY_STATUS_MAP[statusCode] || "Unknown";

            await connection.query(
                `INSERT INTO job_activities (job_id, status, notes) VALUES (?, ?, ?)`,
                [jobId, statusCode, `Status changed from ${oldStatusText} to ${newStatusText}`]
            );
        }

        await connection.commit();

        return res.status(200).json({
            message: "Job application updated successfully!"
        });

    } catch (err) {
        await connection.rollback();
        console.error("Update Job Error: ", err.message);
        return res.status(500).json({message: "Internal Server Error"});
    } finally {
        connection.release();
    }
}

const deleteJob = async (req, res) => {

    const connection = await pool.getConnection();

    try{
        const userId = req.user.id;
        const jobId = req.params.id;

        await connection.beginTransaction();

        const [currentJobState] = await connection.query(
            `SELECT current_status, company_name FROM jobs WHERE job_id = ? AND user_id = ? AND deleted_at IS NULL`,
            [jobId, userId]
        )

        if(currentJobState.length === 0) {
            await connection.rollback();
            return res.status(404).json({message: "Job application not found or unauthorized"});
        }

        const job = currentJobState[0];
        const finalStatusText = DISPLAY_STATUS_MAP[job.current_status] || 'Unknown';

        const [result] = await connection.query(
            `UPDATE jobs 
             SET deleted_at = NOW()
             WHERE job_id = ? AND user_id = ? AND deleted_at IS NULL`,
             [jobId, userId]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(409).json({ message: "This job application has already been deleted." });
        }
        
        await connection.query(
            `INSERT INTO job_activities(job_id, status, notes) VALUES (?, ?, ?)`,
            [jobId, job.current_status, `Job application for ${job.company_name} was removed from dashboard while status was ${finalStatusText}`]
        );

        await connection.commit();

        return res.status(200).json({message: "Job application deleted successfully"});

    } catch(err) {
        await connection.rollback();
        console.error("Delete Job Error: ", err.message);
        return res.status(500).json({message: "Internal Server Error"});
    } finally {
        connection.release();
    }
}

module.exports = {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob
};