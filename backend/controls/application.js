const Router = require("express").Router();
const {
  application,
  user,
  job,
  field,
  templateField,
  template,
  fieldData,
  locationData,
  workFlowStage
} = require("../config/index");
const { Op } = require("sequelize");

Router.get("/status/:candidateId/:jobId", async (req, res) => {
  const { candidateId, jobId } = req.params;
  try{
    const existing = await application.findOne({
    where: { candidateId: Number(candidateId), jobId: Number(jobId) },
  });
  res.send(!!existing);
  }catch(err){
    console.error("Error in getting data", err)
  }
});
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
Router.get("/applicantStatus/:id", async (req, res) => {
  const { id } = req.params;
  // console.log(id);
  try {
    const status = await application.findAll({
      where: { candidateId: id },
      raw: true,
    });
    const userData = await user.findOne({ where: { id }, raw: true });
    const payload = { status, userData };
    // console.log(userData);
    res.send(payload);
  } catch (err) {
    console.error("Error in getting status", err);
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

        const fieldDataIds = fieldValues.map((fd) => fd.id);

        const locationEntries = await locationData.findAll({
          where: {
            jobId: job.id,
            candidateId: null,
            fieldDataId: fieldDataIds,
          },
          raw: true,
        });

        const locByFieldDataId = {};
        locationEntries.forEach((loc) => {
          locByFieldDataId[loc.fieldDataId] = loc;
        });

        for (const tf of templateFields) {
          const def = fieldDefinitions.find((f) => f.id === tf.fieldId);
          const val = fieldValues.find((fv) => fv.fieldId === tf.fieldId);

          if (def) {
            const loc = val ? locByFieldDataId[val.id] : null;

            let value;
            if (loc) {
              value = {
                countryCode: loc.countryCode,
                countryName: loc.countryName,
                stateCode: loc.stateCode,
                stateName: loc.stateName,
                cityName: loc.cityName,
                display: [loc.countryName, loc.stateName, loc.cityName]
                  .filter(Boolean)
                  .join(", "),
              };
            } else {
              value = val?.value || null;
            }

            dynamicFields.push({
              label: def.fieldLabel.trim(),
              value,
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
      candidateFields: orderedCandidateFields,
    });
  } catch (err) {
    console.error("Error fetching applicant jobs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
Router.get("/application-status/:companyId", async (req, res) => {
  const { companyId } = req.params;

  try {
    // Step 1: Get all jobs for the company
    const jobs = await job.findAll({
      where: { companyId },
      attributes: ['id', 'templateId'],
      raw: true,
    });
    
    
    const jobMap = {}; // jobId => templateId
    const jobIds = jobs.map((j) => {
      jobMap[j.id] = j.templateId;
      return j.id;
    });
// console.log(jobIds);
    if (!jobIds.length) {
      return res.status(404).json({ message: "No jobs found for this company" });
    }

    // Step 2: Get applications for those job IDs
    const applications = await application.findAll({
      where: { jobId: jobIds },
      attributes: ['jobId', 'status'],
      raw: true,
    });
// console.log(applications);

    if (!applications.length) {
      return res.json({ statusSummary: [] });
    }

    // Step 3: Get templates and workflow mapping
    const templateIds = [...new Set(jobs.map(j => j.templateId).filter(Boolean))];
    const templates = await template.findAll({
      where: { id: templateIds },
      attributes: ['id', 'candidateWorkFlowId'],
      raw: true,
    });
// console.log(templateIds);

    const templateToWorkflowMap = {};
    templates.forEach(t => {
      templateToWorkflowMap[t.id] = t.workFlowId;
    });

    // Step 4: Get all workflow stages
    const workflowIds = [...new Set(templates.map(t => t.workflowId))];
    const stages = await workFlowStage.findAll({
      where: { workFlowId: workflowIds },
      attributes: ['workFlowId', 'StageName', 'order'],
      order: [['order', 'ASC']],
      raw: true,
    });

    // Step 5: Group by jobId and status
    const grouped = {};

    applications.forEach(app => {
      const { jobId, status } = app;

      if (!grouped[jobId]) grouped[jobId] = {};

      if (!grouped[jobId][status]) {
        grouped[jobId][status] = 1;
      } else {
        grouped[jobId][status]++;
      }
    });

    // Step 6: Format result into an array grouped by jobId
    const statusSummary = Object.entries(grouped).map(([jobId, stageCounts]) => ({
      jobId: parseInt(jobId),
      stages: Object.entries(stageCounts).map(([stage, count]) => ({
        stage,
        count,
      })),
    }));

    res.json({ statusSummary });
    // res.send("wait")

  } catch (err) {
    console.error("Error fetching application workflow status summary:", err);
    res.status(500).json({ error: "Server error" });
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
    const currentJob = jobDataList.find(
      (job) => Number(job.id) === Number(jid)
    );
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
          jobId: parseInt(jid),
        },
        raw: true,
      });

      // 👇 Fetch all locationData for those fieldData records
      const fieldDataIds = fieldValues.map((fv) => fv.id);
      const locationValues = await locationData.findAll({
        where: {
          candidateId: parseInt(id),
          jobId: parseInt(jid),
          fieldDataId: fieldDataIds,
        },
        raw: true,
      });

      for (const tf of templateFields) {
        const fieldDef = fieldDefinitions.find((f) => f.id === tf.fieldId);
        const valueObj = fieldValues.find((fv) => fv.fieldId === tf.fieldId);

        if (fieldDef) {
          if (fieldDef.fieldType === "location") {
            const locationEntry = locationValues.find(
              (loc) => loc.fieldDataId === valueObj?.id
            );

            candidateFields.push({
              label: fieldDef.fieldLabel.trim(),
              type: "location",
              value: locationEntry
                ? `${locationEntry.countryName || ""}, ${
                    locationEntry.stateName || ""
                  }, ${locationEntry.cityName || ""}`
                : null,
              raw: locationEntry || null, // optional: include full location details
            });
          } else {
            candidateFields.push({
              label: fieldDef.fieldLabel.trim(),
              value: valueObj?.value || null,
              type: fieldDef.fieldType || "text",
            });
          }
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
      candidateFields,
    });
  } catch (err) {
    console.error("Error fetching applicant jobs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
Router.get("/job/:jobId", async (req, res) => {
  const { jobId } = req.params;

  try {
    const applications = await application.findAll({
      where: { jobId },
    });

    const applicantData = await Promise.all(
      applications.map(async (app) => {
        const userData = await user.findOne({
          where: { id: app.candidateId },
          raw: true,
        });

        const jobData = await job.findOne({
          where: { id: app.jobId },
          raw: true,
        });

        const dynamicFields = await fieldData.findAll({
          where: {
            candidateId: {
              [Op.ne]: null,
            },
            jobId: app.jobId,
            candidateId: app.candidateId,
          },
          raw: true,
        });

        const fieldDataIds = dynamicFields.map((fd) => fd.id);

        const locationEntries = await locationData.findAll({
          where: {
            fieldDataId: fieldDataIds,
            candidateId: app.candidateId,
            jobId: app.jobId,
          },
          raw: true,
        });

        // Attach matching location data to each dynamic field
        const locationMap = {};
        locationEntries.forEach((loc) => {
          locationMap[loc.fieldDataId] = loc;
        });

        const dynamicWithLocation = dynamicFields.map((field) => ({
          ...field,
          location: locationMap[field.id] || null,
        }));
        // console.log(dynamicWithLocation);
        
        return {
          id: app.id,
          status: app.status,
          createdAt: app.createdAt,
          candidateId: app.candidateId,
          user: userData,
          job: jobData,
          dynamicData: dynamicWithLocation,
        };
      })
    );

   res.json({
  applicants: applicantData.map(({ dynamicData, ...rest }) => rest),
  dynamicData: applicantData.flatMap((a) => a.dynamicData),
});

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
