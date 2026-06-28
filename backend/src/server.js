const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const jobActivityRoutes = require('./routes/activityRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/jobs', jobActivityRoutes);
app.use('/api/jobs', interviewRoutes);
app.use('/api/summary', dashboardRoutes);


app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})