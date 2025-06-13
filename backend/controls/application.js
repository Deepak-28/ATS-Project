const Router = require('express').Router();
const {application, user, job} = require('../config/index')
const { Op } = require("sequelize");
// GET /application/status?candidateId=123&jobId=456
Router.get('/status', async (req, res) => {
    const { candidateId, jobId } = req.query;
    const existing = await application.findOne({
        where: { candidateId: Number(candidateId), jobId: Number(jobId) }
    });
    res.json({ applied: !!existing });
});

// POST /application
Router.post('/', async (req, res) => {
    const { candidateId, jobId } = req.body;
    const existing = await application.findOne({ where: { candidateId, jobId } });
    if (existing) return res.status(400).json({ message: "Already applied" });

    const newApp = await application.create({ candidateId, jobId });
    res.status(201).json(newApp);
});
Router.get('/applicants', async (req, res)=>{
    try{
        const applications = await application.findAll({
            where: {
              status: {
                [Op.ne]: null  // status is not null
              }
            }}
        )
        res.send(applications)
    }catch(err){
        console.error("Failed to fetch applicants", err);
        
    }
});
Router.get("/applicant/:id", async (req, res) => {
  const { id } = req.params; // Get the candidateId from the params

  try {
    // Fetch the application by candidateId
    const applicationData = await application.findOne({
      where: { candidateId: id },
    });

    if (!applicationData)
      return res.status(404).send("Application not found");

    // Fetch user details using candidateId
    const userData = await user.findOne({
      where: { id: applicationData.candidateId },
    });

    if (!userData) return res.status(404).send("User not found");

    // Fetch job details using jobId from application
    const jobData = await job.findOne({
      where: { id: applicationData.jobId },
    });

    if (!jobData) return res.status(404).send("Job not found");

    // Send combined result
    res.send({
      application: applicationData,
      user: userData,
      job: jobData,
    });
  } catch (err) {
    console.error("Error fetching applicant:", err);
    res.status(500).send("Server error");
  }
});
Router.get("/job/:jobId", async (req, res) => {
  const { jobId } = req.params;

  try {
    // 1. Get all applications for the job
    const applications = await application.findAll({
      where: { jobId },
    });

    // if (!applications.length) {
    //   return res.status(404).json({ message: "No applicants found for this job." });
    // }

    // 2. Fetch user and job details for each application manually
    const applicantData = await Promise.all(
      applications.map(async (app) => {
        const userData = await user.findOne({ where: { id: app.candidateId } });
        const jobData = await job.findOne({ where: { id: app.jobId } });

        return {
          id: app.id,
          status: app.status,
          createdAt: app.createdAt,
          candidateId: app.candidateId,
          user: userData,
          job: jobData,
        };
      })
    );

    // 3. Send collected data
    res.json(applicantData);

  } catch (err) {
    console.error("Error fetching applicants:", err);
    res.status(500).send("Server error");
  }
});
Router.patch("/status/:candidateId/:jobId", async (req, res) => {
  const { candidateId, jobId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required." });
  }

  try {
    const [updatedCount] = await application.update(
      { status },
      {
        where: {
          candidateId: candidateId,
          jobId: jobId,
        },
      }
    );

    if (updatedCount === 0) {
      return res.status(404).json({ error: "No matching application found." });
    }

    res.status(200).json({ message: "Status updated successfully." });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ error: "Failed to update status." });
  }
});
Router.put('/update', async (req, res) => {
    const { candidateId, jobId, status } = req.body;
    // console.log(candidateId, jobId, status)

    if (!candidateId || !jobId || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const [updatedRows] = await application.update(
            { status }, // what to update
            {
                where: {
                    candidateId,
                    jobId
                }
            }
        );

    //     if (updatedRows === 0) {
    //         return res.status(404).json({ message: 'Application not found' });
    //     }

        res.status(200).json({ message: 'Application status updated successfully' });
    } catch (error) {
        console.error('Sequelize error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
module.exports = Router;