const Router = require("express").Router();
const { job, application, fieldData, field } = require("../config/index");

Router.post("/", async (req, res) => {
  console.log("Incoming req.body:", req.body);

  const { payload, formValues } = req.body;

  const {
    companyId,
    companyName,
    jobTitle,
    jobExperience,
    jobLocation,
    skills,
    jobType,
    jobDescription,
  } = payload;

  try {
    const newJob = await job.create({  
      companyId,
      companyName,
      jobDescription,
      jobExperience,
      jobLocation,
      jobType,
      skills,
      jobTitle,
    });

    console.log("Created job:", newJob);
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
  console.log(req.body);
  const { postDate, expiryDate, visibility} = req.body;
  try{
    const data = await job.update({postDate, expiryDate, visibility},{where:{id:jobId}});
    res.send("Job Posted")
  }catch(err){
    console.error(err)
  }
  
  
})
// POST /job/manualFieldSubmit
Router.post("/manualFieldSubmit", async (req, res) => {
  const { jobId, Fields } = req.body;
  console.log(jobId);
  console.log(Fields);
  
  

  if (!jobId || !Array.isArray(Fields)) {
    return res.status(400).json({ message: "Missing jobId or fields" });
  }

  try {
    for (const customField of Fields) {
      const { fieldLabel: label, fieldType: type, position, value } = customField;
      console.log(customField);
      

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
      const payload = {getjobs, dynamicFields}
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
Router.get('/slug/:slug', async(req, res)=>{
  const {slug} = req.params;
  // console.log(slug);
  try{
    const jobs = await job.findAll({where:{visibility:slug}});
    // console.log(jobs);
    
    res.send(jobs)
  }catch(err){
    console.error("error is getting job with slug", err)
  }
  
});
Router.get("/company/:companyId", async (req, res) => {
  const { companyId } = req.params;
  try {
    const jobs = await job.findAll({
      where: { companyId }, // This assumes companyId is stored in the Job model
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
    console.log(fieldsMeta);
    

    // Step 3: Create a map of fieldId => fieldLabel
    const fieldLabelMap = {};
    fieldsMeta.forEach(f => {
      fieldLabelMap[f.id] = f.fieldLabel;
    });
    console.log(fieldLabelMap);
    
    // Step 4: Build formValues with fieldLabel instead of fieldId
    const formValues = {};
    dynamicFields.forEach(field => {
      const label = fieldLabelMap[field.fieldId];
      if (label) {
        formValues[label] = field.value;
      }
    });
    console.log(formValues);
    
    // Combine job + dynamic field values
    const jobWithFields = {
      ...jobs.toJSON(),
      formValues
    };
    console.log(jobWithFields);
    
    res.send(jobWithFields);
  } catch (err) {
    console.error("Error fetching job:", err);
    res.status(500).send("Failed to fetch job");
  }
});
Router.get('/edit/:id', async (req, res) => {
  const { id } = req.params;
  // console.log('test', id)
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
});
// PUT /job/:jobId
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
    // Update job table
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
  // console.log(id);
  try {
    await job.update(req.body, { where: { id } });
    res.json({ message: "Job updated successfully" });
  } catch (err) {
    console.error("Job update failed:", err);
    res.status(500).json({ error: "Job update failed" });
  }
});
// PUT /job/unpost/:id
Router.put("/unpost/:id", async (req, res) => {
  const {id} = req.params.id
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
// PATCH /job/status/:jobId
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
