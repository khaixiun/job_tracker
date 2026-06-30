const pool = require('../config/db');

const getDashboardSummary = async (req, res) => {
    try{
        const userId = req.user.id;

        const [rows] = await pool.query(
            `SELECT current_status, COUNT(*) as count
             FROM jobs
             WHERE user_id = ? AND deleted_at IS NULL
             GROUP BY current_status`,
             [userId]
        );

        let pending = 0;
        let interviewing = 0;
        let rejected = 0;
        let offered = 0;

        rows.forEach(row => {
            const statusValue = row.current_status;

            if(statusValue === 'P') pending = parseInt(row.count, 10);
            if (statusValue === 'I') interviewing = parseInt(row.count, 10);
            if (statusValue === 'R') rejected = parseInt(row.count, 10);
            if (statusValue === 'O') offered = parseInt(row.count, 10);
        });

        const totalApplication = pending + interviewing + rejected + offered;

        const rejectionRate = totalApplication > 0
            ? Math.round((rejected / totalApplication) * 100)
            : 0;

        const successRate = totalApplication > 0
            ? Math.round((offered / totalApplication) * 100)
            : 0;

        const [interviewRows] = await pool.query(
            `SELECT
                i.interview_id AS interviewId,
                i.interview_type AS interviewType,
                i.scheduled_at AS scheduledAt,
                i.meeting_link AS meetingLink,
                j.company_name AS companyName,
                j.job_title AS jobTitle
            FROM interviews i
            INNER JOIN jobs j ON i.job_id = j.job_id
            WHERE j.user_id = ? AND i.scheduled_at > NOW() AND j.deleted_at IS NULL
            ORDER BY i.scheduled_at ASC`,
            [userId]
        );

        return res.status(200).json({
            totalApplication,
            activeInterviews: interviewing,
            offersReceived: offered,
            rejectionRate: rejectionRate,
            successRate: successRate,
            pipeline: {
                applied: pending,
                interviewing,
                offered,
                rejected
            },
            upcomingInterviews: interviewRows
        });
    } catch (err) {
        console.error("Get Dashboard Summary Error: ", err.message);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

module.exports = {
    getDashboardSummary
}