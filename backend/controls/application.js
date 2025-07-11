const Router = require("express").Router();
const {
  application,
  user,
  job,
  field,
  templateField,
  template,
  fieldData,
} = require("../config/index");
const { Op } = require("sequelize");

Router.get("/status/:candidateId/:jobId", async (req, res) => {
  const { candidateId, jobId } = req.params;
  const existing = await application.findOne({
    where: { candidateId: Number(candidateId), jobId: Number(jobId) },
  });
  res.send(!!existing);
});
// POST /application
Router.post("/", async (req, res) => {
  const { candidateId, jobId } = req.body;
  const existing = await application.findOne({ where: { candidateId, jobId } });
  if (existing) return res.status(400).json({ message: "Already applied" });

  const newApp = await application.create({ candidateId, jobId });
  res.status(201).json(newApp);
});
Router.get("/applicants", async (req, res) => {
  try {
    const applications = await application.findAll({
      where: {
        status: {
          [Op.ne]: null, // status is not null
        },
      },
    });
    res.send(applications);
  } catch (err) {
    console.error("Failed to fetch applicants", err);
  }
});
Router.get("/applicant/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const applicationData = await application.findAll({
      where: { candidateId: parseInt(id) },
      raw: true,
    });

    if (!applicationData.length)
      return res.status(404).json({ error: "No applications found" });

    const userData = await user.findOne({
      where: { id: parseInt(id) },
      raw: true,
    });

    if (!userData) return res.status(404).json({ error: "User not found" });

    const jobIds = applicationData.map((app) => app.jobId);

    const jobDataList = await job.findAll({
      where: { id: jobIds },
      raw: true,
    });

    const templateIds = jobDataList
      .map((job) => job.templateId)
      .filter(Boolean);

    let candidateFormId = null;

    if (templateIds.length > 0) {
      const templateData = await template.findOne({
        where: { id: templateIds[0] },
        raw: true,
      });
      candidateFormId = templateData?.candidateTemplateId || null;
    }

    let orderedCandidateFields = [];

    if (candidateFormId) {
      const templateFields = await templateField.findAll({
        where: { templateId: candidateFormId },
        order: [["order", "ASC"]], // Ensure order is respected (you need an 'order' column for this)
        raw: true,
      });

      const fieldIds = templateFields.map((tf) => tf.fieldId);

      const fieldDefinitions = await field.findAll({
        where: { id: fieldIds },
        raw: true,
      });

      const fieldValues = await fieldData.findAll({
        where: {
          candidateId: parseInt(id),
        },
        raw: true,
      });

      for (const tf of templateFields) {
        const fieldDef = fieldDefinitions.find((f) => f.id === tf.fieldId);
        const valueObj = fieldValues.find((fv) => fv.fieldId === tf.fieldId);

        if (fieldDef) {
          orderedCandidateFields.push({
            label: fieldDef.fieldLabel.trim(),
            value: valueObj?.value || null,
            type: fieldDef.fieldType || "text",
          });
        }
      }
    }

    const jobs = [];

    for (const job of jobDataList) {
      const templateId = job.templateId;
      const application = applicationData.find(
        (app) => Number(app.jobId) === Number(job.id)
      );
      const applicationStatus = application?.status || "Unknown";

      let dynamicFields = [];

      if (templateId) {
        const templateFields = await templateField.findAll({
          where: { templateId },
          order: [["order", "ASC"]], // Respect field order
          raw: true,
        });

        const fieldIds = templateFields.map((tf) => tf.fieldId);

        const fieldDefinitions = await field.findAll({
          where: { id: fieldIds },
          raw: true,
        });

        const fieldValues = await fieldData.findAll({
          where: {
            jobId: job.id,
            candidateId: null, // job-level fields
          },
          raw: true,
        });

        for (const tf of templateFields) {
          const def = fieldDefinitions.find((f) => f.id === tf.fieldId);
          const val = fieldValues.find((fv) => fv.fieldId === tf.fieldId);

          if (def) {
            dynamicFields.push({
              label: def.fieldLabel.trim(),
              value: val?.value || null,
            });
          }
        }
      }

      jobs.push({
        ...job,
        fields: dynamicFields,
        status: applicationStatus,
      });
    }

    res.status(200).json({
      applications: applicationData,
      user: userData,
      jobs,
      candidateFields: orderedCandidateFields, // ✅ ordered list of candidate fields
    });
  } catch (err) {
    console.error("Error fetching applicant jobs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
Router.get("/applicantDetail/:id/:jid", async (req, res) => {
  const { id, jid } = req.params;

  try {
    const applicationData = await application.findAll({
      where: { candidateId: parseInt(id) },
      raw: true,
    });

    if (!applicationData.length)
      return res.status(404).json({ error: "No applications found" });

    const userData = await user.findOne({
      where: { id: parseInt(id) },
      raw: true,
    });

    if (!userData) return res.status(404).json({ error: "User not found" });

    const jobIds = applicationData.map((app) => app.jobId);

    const jobDataList = await job.findAll({
      where: { id: jobIds },
      raw: true,
    });

    // Get specific job data for jid
    const currentJob = jobDataList.find((job) => Number(job.id) === Number(jid));
    if (!currentJob)
      return res.status(404).json({ error: "Job not found for the applicant" });

    const candidateTemplateId = (
      await template.findOne({
        where: { id: currentJob.templateId },
        raw: true,
      })
    )?.candidateTemplateId;

    let candidateFields = [];

    if (candidateTemplateId) {
      const templateFields = await templateField.findAll({
        where: { templateId: candidateTemplateId },
        order: [["order", "ASC"]],
        raw: true,
      });

      const fieldIds = templateFields.map((tf) => tf.fieldId);

      const fieldDefinitions = await field.findAll({
        where: { id: fieldIds },
        raw: true,
      });

      const fieldValues = await fieldData.findAll({
        where: {
          candidateId: parseInt(id),
          jobId: parseInt(jid), // match candidate fields with job-specific id
        },
        raw: true,
      });

      for (const tf of templateFields) {
        const fieldDef = fieldDefinitions.find((f) => f.id === tf.fieldId);
        const valueObj = fieldValues.find((fv) => fv.fieldId === tf.fieldId);

        if (fieldDef) {
          candidateFields.push({
            label: fieldDef.fieldLabel.trim(),
            value: valueObj?.value || null,
            type: fieldDef.fieldType || "text",
          });
        }
      }
    }

    const jobs = [];

    for (const job of jobDataList) {
      const templateId = job.templateId;
      const application = applicationData.find(
        (app) => Number(app.jobId) === Number(job.id)
      );
      const applicationStatus = application?.status || "Unknown";

      let dynamicFields = [];

      if (templateId) {
        const templateFields = await templateField.findAll({
          where: { templateId },
          order: [["order", "ASC"]],
          raw: true,
        });

        const fieldIds = templateFields.map((tf) => tf.fieldId);

        const fieldDefinitions = await field.findAll({
          where: { id: fieldIds },
          raw: true,
        });

        const fieldValues = await fieldData.findAll({
          where: {
            jobId: job.id,
            candidateId: null,
          },
          raw: true,
        });

        for (const tf of templateFields) {
          const def = fieldDefinitions.find((f) => f.id === tf.fieldId);
          const val = fieldValues.find((fv) => fv.fieldId === tf.fieldId);

          if (def) {
            dynamicFields.push({
              label: def.fieldLabel.trim(),
              value: val?.value || null,
            });
          }
        }
      }

      jobs.push({
        ...job,
        fields: dynamicFields,
        status: applicationStatus,
      });
    }

    res.status(200).json({
      applications: applicationData,
      user: userData,
      jobs,
      candidateFields, // ✅ Now job-specific
    });
  } catch (err) {
    console.error("Error fetching applicant jobs:", err);
    res.status(500).json({ error: "Internal server error" });
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
Router.put("/update", async (req, res) => {
  const { candidateId, jobId, status } = req.body;

  if (!candidateId || !jobId || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [updatedRows] = await application.update(
      { status },
      {
        where: { candidateId, jobId },
      }
    );

    if (updatedRows === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    res
      .status(200)
      .json({ message: "Application status updated successfully" });
  } catch (error) {
    console.error("Sequelize error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = Router;
