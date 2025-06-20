const Router = require("express").Router();
const { job, application, fieldData, field } = require("../config/index");

Router.post("/", async (req, res) => {
  const { payload, formValues } = req.body;

  const {
    companyId,
    companyName,
  } = payload;

  try {
    const newJob = await job.create({  
      companyId,
      companyName,
    });
    const jobId = newJob.id;

    const dynamicInserts = Object.entries(formValues).map(([fieldId, value]) => ({  //converts objects into an array of key-value pairs
      jobId,
      fieldId,
      value: typeof value === "object" ? JSON.stringify(value) : value,
    }));

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
    const newJob = await job.create(jobData); // create job
    res.send(newJob); // return jobId to frontend
  } catch (err) {
    console.error("Job creation failed:", err);
    res.status(500).json({ error: "Job creation failed" });
  }
});
Router.post("/visibility/:id", async(req, res)=>{
  const {id : jobId} = req.params;
  // console.log(req.body);
  const { postDate, expiryDate, visibility} = req.body;
  try{
    const data = await job.update({postDate, expiryDate, visibility},{where:{id:jobId}});
    res.send("Job Posted")
  }catch(err){
    console.error(err)
  }
});
Router.post("/manualFieldSubmit", async (req, res) => {
  const { jobId, Fields } = req.body;
  if (!jobId || !Array.isArray(Fields)) {
    return res.status(400).json({ message: "Missing jobId or fields" });
  }
  try {
    for (const customField of Fields) {
      const { fieldLabel: label, fieldType: type, position, value } = customField;
      // Check if field with the same label exists
      let existingField = await field.findOne({ where: {fieldLabel: label} });
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
    return res.status(200).json({ message: "Fields and values saved successfully" });
  } catch (error) {
    console.error("Error saving fields:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
Router.get('/', async (req, res) => {
  try {
      const getjobs = await job.findAll();
      const dynamicFields = await fieldData.findAll();
      const fields = await field.findAll()
      const payload = {getjobs, dynamicFields, fields}
      res.send(payload);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});
Router.get('/all', async (req, res) => {
  try {
      const getjobs = await job.findAll();
      res.send(getjobs);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});
Router.get("/data", async (req, res) => {
  try {
    // Step 1: Get all jobs
    const jobs = await job.findAll();
    if (!jobs || jobs.length === 0) {
      return res.status(404).send("No jobs found");
    }

    // Step 2: Get all dynamic fields for all jobs
    const dynamicFields = await fieldData.findAll();

    // Step 3: Get all field metadata (field labels, etc.)
    const allFieldIds = [...new Set(dynamicFields.map(df => df.fieldId))];
    const fieldsMeta = await field.findAll({
      where: { id: allFieldIds }
    });

    // Step 4: Build a lookup for fieldId => fieldLabel
    const fieldLabelMap = {};
    fieldsMeta.forEach(f => {
      fieldLabelMap[f.id] = f.fieldLabel;
    });

    // Step 5: Group dynamicFields by jobId
    const jobFieldMap = {};
    dynamicFields.forEach(df => {
      if (!jobFieldMap[df.jobId]) {
        jobFieldMap[df.jobId] = [];
      }
      jobFieldMap[df.jobId].push(df);
    });

    // Step 6: Combine job data with related form values
    const jobListWithFields = jobs.map(job => {
      const jobData = job.toJSON();
      const relatedFields = jobFieldMap[job.id] || [];

      const formValues = {};
      relatedFields.forEach(field => {
        const label = fieldLabelMap[field.fieldId];
        if (label) {
          formValues[label] = field.value;
        }
      });

      return {
        ...jobData,
        formValues
      };
    });

    // Final response
    res.send({
      getjobs: jobListWithFields,
      // dynamicFields: dynamicFields, // raw values if needed elsewhere
      // fields: fieldsMeta             // field metadata
    });

  } catch (err) {
    console.error("Error fetching all jobs:", err);
    res.status(500).send("Failed to fetch jobs");
  }
});
Router.get('/slug/:slug', async (req, res) => {
  const { slug } = req.params;
  // console.log(slug);
  try {
    // Step 1: Get all jobs with matching slug
    const jobs = await job.findAll({ where: { visibility: slug } });
    
    

    // If no jobs, return early
    if (!jobs || jobs.length === 0) {
      return res.status(404).send("No jobs found with given slug.");
    }

    // Step 2: Get all jobIds
    const jobIds = jobs.map(j => j.id);
    

    // Step 3: Get all dynamic field data for these jobs
    const allFieldData = await fieldData.findAll({
      where: { jobId: jobIds }
    });

    // Step 4: Get all unique fieldIds from the field data
    const fieldIds = [...new Set(allFieldData.map(fd => fd.fieldId))];
    
    // Step 5: Get metadata for the fields
    const fieldDefs = await field.findAll({
      where: { id: fieldIds }
    });
    
    // Step 6: Create a map of fieldId => fieldLabel
    const fieldLabelMap = {};
    fieldDefs.forEach(f => {
      fieldLabelMap[f.id] = f.fieldLabel;
    });
   
    // Step 7: Group fieldData by jobId and format them
    const jobFieldMap = {};
    allFieldData.forEach(fd => {
      if (!jobFieldMap[fd.jobId]) {
        jobFieldMap[fd.jobId] = {};
      }
      const label = fieldLabelMap[fd.fieldId];
      if (label) {
        jobFieldMap[fd.jobId][label] = fd.value;
      }
    });

    // Step 8: Attach formValues to each job
    const jobsWithFields = jobs.map(j => ({
      ...j.toJSON(),
      formValues: jobFieldMap[j.id] || {}
    }));

    res.send(jobsWithFields);
    // console.log(jobsWithFields);
    // res.send("done")
    
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
    res.status(200).send(jobs);
  } catch {
    console.error("Error fetching jobs for company:", err);
    res.status(500).send("Failed to fetch jobs for company", err);
  }
});
Router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const jobs = await job.findOne({ where: { id } });
    if (!jobs) {
      return res.status(404).send("Job not found");
    }
    const dynamicFields = await fieldData.findAll({ where: { jobId: id } });
    if (dynamicFields.length === 0) {
      return res.send(jobs);
    }
    // Step 1: Get all unique fieldIds
    const fieldIds = dynamicFields.map(field => field.fieldId);
    // Step 2: Fetch field metadata (assuming you have a model called "field")
    const fieldsMeta = await field.findAll({
      where: { id: fieldIds }
    });
    // Step 3: Create a map of fieldId => fieldLabel
    const fieldLabelMap = {};
    fieldsMeta.forEach(f => {
      fieldLabelMap[f.id] = f.fieldLabel;
    });
    // Step 4: Build formValues with fieldLabel instead of fieldId
    const formValues = {};
    dynamicFields.forEach(field => {
      const label = fieldLabelMap[field.fieldId];
      if (label) {
        formValues[label] = field.value;
      }
    });
    // Combine job + dynamic field values
    const jobWithFields = {
      ...jobs.toJSON(),
      formValues
    };
    res.send(jobWithFields);
  } catch (err) {
    console.error("Error fetching job:", err);
    res.status(500).send("Failed to fetch job");
  }
});
Router.get('/edit/:id', async (req, res) => {
  const {id} = req.params;
  try {
      const ejob = await job.findOne({ where: { id: id }, raw: true });
      if (ejob) {
          res.send(ejob)
      }
      else {
          res.status(404).send( 'Job not found!' );
      }
  } catch (err) {
      res.status(500).send(err.message );
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
    // Update or insert each dynamic field value
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
  const {id} = req.params
  try {
    await job.update(
      { postDate: null, expiryDate: null, visibility: null },
      { where: { id } }
    );
    res.send("Job unposted");
  } catch (err) {
    res.status(500).send("Error unposting job");
  }
});
Router.put('/apply/:id', async (req, res) => {
  const { id } = req.params;
  const { applied } = req.body;
  const jobs = await job.update({ applied: applied }, { where: { id: id } });
  res.send( 'Job applied!');
})
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
    res.send("Job and associated applications deleted");
  } catch (error) {
    console.error("Error deleting job or applications:", error);
    res.status(500).send("Failed to delete job and associated applications");
  }
});


module.exports = Router;
