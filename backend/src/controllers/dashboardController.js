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
            }
        });
    } catch (err) {
        console.error("Get Dashboard Summary Error: ", err.message);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

module.exports = {
    getDashboardSummary
}