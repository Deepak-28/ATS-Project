const Router = require("express").Router();
const { Op } = require('sequelize');
const { job, application, fieldData, field, locationData } = require("../config/index");
const { postOption: PostOption } = require("../config/index");

Router.post("/", async (req, res) => {
  const { payload, formValues } = req.body;

  const { companyId, companyName } = payload;

  try {
    const newJob = await job.create({
      companyId,
      companyName,
    });
    const jobId = newJob.id;

    const dynamicInserts = Object.entries(formValues).map(
      ([fieldId, value]) => ({
        //converts objects into an array of key-value pairs
        jobId,
        fieldId,
        value: typeof value === "object" ? JSON.stringify(value) : value,
      })
    );

    await fieldData.bulkCreate(dynamicInserts);

    res.send("Job Created");
  } catch (err) {
    console.error("Error creating job:", err);
    res.status(500).send("Job creation Failed");
  }
});
Router.post("/create", async (req, res) => {
  try {
    const jobData = req.body;
    const newJob = await job.create(jobData); 
    res.send(newJob);
  } catch (err) {
    console.error("Job creation failed:", err);
    res.status(500).json({ error: "Job creation failed" });
  }
});
Router.post("/visibility/:id", async (req, res) => {
  const { id: jobId } = req.params;
  const { formData } = req.body;

  try {
    if (Array.isArray(formData)) {
      const entries = formData.map(({ postDate, expiryDate, postOption }) => ({
        jobId,
        postDate,
        expiryDate,
        postOption
      }));
      await PostOption.destroy({where:{jobId}})
      await PostOption.bulkCreate(entries);
      await job.update({visibility:"posted"},{where:{id:jobId}})
    } else {
      const { postDate, expiryDate, postOption } = formData;
      await PostOption.create({ jobId, postDate, expiryDate, postOption });
      await job.update({visibility:"posted"},{where:{id:jobId}})
    }

    res.send("Job Posted");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to post job");
  }
});
Router.post("/manualFieldSubmit", async (req, res) => {
  const { jobId, Fields } = req.body;
  if (!jobId || !Array.isArray(Fields)) {
    return res.status(400).json({ message: "Missing jobId or fields" });
  }
  try {
    for (const customField of Fields) {
      const {
        fieldLabel: label,
        fieldType: type,
        position,
        value,
      } = customField;
      // Check if field with the same label exists
      let existingField = await field.findOne({ where: { fieldLabel: label } });
      // If not exists, create a new field
      if (!existingField) {
        existingField = await field.create({
          fieldLabel: label,
          fieldType: type,
          status: "active",
        });
      }
      // Create corresponding field data entry
      await fieldData.create({
        jobId: jobId,
        fieldId: existingField.id,
        value: value,
        position,
      });
    }
    return res
      .status(200)
      .json({ message: "Fields and values saved successfully" });
  } catch (error) {
    console.error("Error saving fields:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
Router.get("/", async (req, res) => {
  try {
    const getjobs = await job.findAll();
    const dynamicFields = await fieldData.findAll();
    const fields = await field.findAll();
    const payload = { getjobs, dynamicFields, fields };
    res.send(payload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
Router.get("/all", async (req, res) => {
  try {
    const getjobs = await job.findAll();
    res.send(getjobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
Router.get("/data", async (req, res) => {
  try {
    // Get all jobs
    const jobs = await job.findAll();
    if (!jobs || jobs.length === 0) {
      return res.status(404).send("No jobs found");
    }
    //  Get all dynamic fields for all jobs
    const dynamicFields = await fieldData.findAll();
    //  Get all field metadata (field labels, etc.)
    const allFieldIds = [...new Set(dynamicFields.map((df) => df.fieldId))];
    const fieldsMeta = await field.findAll({
      where: { id: allFieldIds },
    });

    // Build a lookup for fieldId => fieldLabel
    const fieldLabelMap = {};
    fieldsMeta.forEach((f) => {
      fieldLabelMap[f.id] = f.fieldLabel;
    });

    // Group dynamicFields by jobId
    const jobFieldMap = {};
    dynamicFields.forEach((df) => {
      if (!jobFieldMap[df.jobId]) {
        jobFieldMap[df.jobId] = [];
      }
      jobFieldMap[df.jobId].push(df);
    });

    // Combine job data with related form values
    const jobListWithFields = jobs.map((job) => {
      const jobData = job.toJSON();
      const relatedFields = jobFieldMap[job.id] || [];

      const formValues = {};
      relatedFields.forEach((field) => {
        const label = fieldLabelMap[field.fieldId];
        if (label) {
          formValues[label] = field.value;
        }
      });

      return {
        ...jobData,
        formValues,
      };
    });


    res.send({getjobs: jobListWithFields,});
  } catch (err) {
    console.error("Error fetching all jobs:", err);
    res.status(500).send("Failed to fetch jobs");
  }
});
Router.get("/slug/:slug", async (req, res) => {
  const { slug } = req.params;

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  try {
    // Build visibility filter (matching DB format)
    let visibilityFilter;

    if (slug === "internal") {
      visibilityFilter = { [Op.in]: ["Internal", "Internal-External"] };
    } else if (slug === "external") {
      visibilityFilter = { [Op.in]: ["External", "Internal-External"] };
    } else if (slug.includes("&")) {
      visibilityFilter = {
        [Op.in]: slug.split("&").map(capitalize), // Capitalize each part
      };
    } else {
      visibilityFilter = capitalize(slug);
    }

    // Step 1: Get jobIds from PostOption table
    const matchedOptions = await PostOption.findAll({
      where: { postOption: visibilityFilter },
      attributes: ["jobId"],
      raw: true,
    });

    const jobIds = [...new Set(matchedOptions.map((opt) => opt.jobId))];

    if (!jobIds.length) {
      return res.status(404).send("No jobs found for given visibility slug.");
    }

    // Step 2: Get jobs
    const jobs = await job.findAll({ where: { id: jobIds } });

    // Step 3: Field Data
    const allFieldData = await fieldData.findAll({
      where: { jobId: jobIds },
    });

    const fieldIds = [...new Set(allFieldData.map((fd) => fd.fieldId))];
    const fieldDefs = await field.findAll({
      where: { id: fieldIds },
    });

    const fieldLabelMap = {};
    fieldDefs.forEach((f) => {
      fieldLabelMap[f.id] = f.fieldLabel;
    });

    const jobFieldMap = {};
    allFieldData.forEach((fd) => {
      if (!jobFieldMap[fd.jobId]) {
        jobFieldMap[fd.jobId] = {};
      }
      const label = fieldLabelMap[fd.fieldId];
      if (label) {
        jobFieldMap[fd.jobId][label] = fd.value;
      }
    });

    const jobsWithFields = jobs.map((j) => ({
      ...j.toJSON(),
      formValues: jobFieldMap[j.id] || {},
    }));

    res.send(jobsWithFields);
  } catch (err) {
    console.error("Error fetching jobs with related fields:", err);
    res.status(500).send("Internal server error");
  }
});
Router.get("/company/:companyId", async (req, res) => {
  const { companyId } = req.params;
  try {
    const jobs = await job.findAll({
      where: { companyId },
    });
    const dynamicFields = await fieldData.findAll();
    const payload = {jobs, dynamicFields};
    res.send(payload)
  } catch {
    console.error("Error fetching jobs for company:", err);
    res.status(500).send("Failed to fetch jobs for company", err);
  }
});
Router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Fetch the job
    const jobs = await job.findOne({ where: { id } });
    if (!jobs) {
      return res.status(404).send("Job not found");
    }

    // 2. Fetch all dynamic fieldData rows for this job (no candidateId)
    const dynamicFields = await fieldData.findAll({
      where: {
        jobId: id,
         candidateId: null,
      }, raw:true
    });
    console.log(dynamicFields);
    

    // 3. If there are no dynamic fields, return the job as is
    if (dynamicFields.length === 0) {
      return res.send(jobs);
    }

    // 4. Build a map of fieldId → fieldLabel
    const fieldIds = dynamicFields.map((f) => f.fieldId);
    const fieldsMeta = await field.findAll({
      where: { id: fieldIds },
      raw: true,
    });
    const fieldLabelMap = {};
    fieldsMeta.forEach((f) => {
      fieldLabelMap[f.id] = f.fieldLabel.trim();
    });

    // 5. Fetch any locationData rows for these fieldData entries
    const fieldDataIds = dynamicFields.map((f) => f.id);
    const locationEntries = await locationData.findAll({
      where: {
        jobId: id,
         candidateId: { [Op.is]: null },
        fieldDataId: fieldDataIds,
      },
      raw: true,
    });
    // build a quick lookup: fieldDataId → location record
    const locByFieldDataId = {};
    locationEntries.forEach((loc) => {
      locByFieldDataId[loc.fieldDataId] = loc;
    });

    // 6. Assemble formValues, inserting location strings where appropriate
    const formValues = {};
    dynamicFields.forEach((f) => {
      const label = fieldLabelMap[f.fieldId];
      if (!label) return;
      
      // if there is a location entry for this fieldData row
      const loc = locByFieldDataId[f.id];
      if (loc) {
        // combine into a single display string (or expose raw object)
        formValues[label] = {
          countryCode: loc.countryCode,
          countryName: loc.countryName,
          stateCode: loc.stateCode,
          stateName: loc.stateName,
          cityName: loc.cityName,
          // you can also add a display property:
          display: [loc.countryName, loc.stateName, loc.cityName]
            .filter(Boolean)
            .join(", "),
        };
      } else {
        // normal field
        formValues[label] = f.value;
      }
    });

    // 7. Merge job + dynamic fields
    const jobWithFields = {
      ...jobs.toJSON(),
      formValues,
    };
    res.send(jobWithFields);
  } catch (err) {
    console.error("Error fetching job:", err);
    res.status(500).send("Failed to fetch job");
  }
});
Router.get("/edit/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const ejob = await job.findOne({ where: { id: id }, raw: true });
    if (ejob) {
      res.send(ejob);
    } else {
      res.status(404).send("Job not found!");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
  // res.send('wait')
});
Router.put("/:jobId", async (req, res) => {
  const { jobId } = req.params;
  const { jobValues, formValues } = req.body;
  // Prepare dynamic inserts for JobFieldValue table
  const dynamicInserts = Object.entries(formValues).map(([fieldId, value]) => ({
    jobId: parseInt(jobId),
    fieldId: parseInt(fieldId),
    value: typeof value === "object" ? JSON.stringify(value) : value,
  }));
  try {
    await job.update(jobValues, { where: { id: jobId } });
    for (const field of dynamicInserts) {
      await fieldData.update(
        {
          value: field.value,
        },
        {
          where: {
            jobId: field.jobId,
            fieldId: field.fieldId,
          },
        }
      );
    }
    res.send("Job updated successfully");
  } catch (err) {
    console.error("Error updating job:", err);
    res.status(500).send("Error updating job");
  }
});
Router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await job.update(req.body, { where: { id } });
    res.json({ message: "Job updated successfully" });
  } catch (err) {
    console.error("Job update failed:", err);
    res.status(500).json({ error: "Job update failed" });
  }
});
Router.put("/unpost/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await job.update(
      { visibility: null },
      { where: { id } }
    );
    await PostOption.destroy({where:{id}});
    res.send("Job unposted");
  } catch (err) {
    res.status(500).send("Error unposting job");
  }
});
Router.put("/apply/:id", async (req, res) => {
  const { id } = req.params;
  const { applied } = req.body;
  const jobs = await job.update({ applied: applied }, { where: { id: id } });
  res.send("Job applied!");
});
Router.patch("/status/:jobId", async (req, res) => {
  const { jobId } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: "Status is required." });
  }
  try {
    await job.update({ status }, { where: { id: jobId } });
    res.status(200).json({ message: "Status updated successfully." });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ error: "Failed to update status." });
  }
});
Router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    // First delete all applications linked to this job
    await application.destroy({ where: { jobId: id } });
    // Then delete the job itself
    await job.destroy({ where: { id } });
    await PostOption.destroy({where:{jobId:id}});
    await fieldData.destroy({where:{jobId:id}});
    await locationData.destroy({where:{jobId:id}});
    res.send("Job and associated applications deleted");
  } catch (error) {
    console.error("Error deleting job or applications:", error);
    res.status(500).send("Failed to delete job and associated applications");
  }
});

module.exports = Router;
