const Router = require("express").Router();
const { user, login, application, fieldData, locationData,job } = require("../config/index");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: async (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });
Router.post("/", async (req, res) => {
  const {
    firstname,
    lastname,
    ph_no,
    address,
    country,
    state,
    city,
    email,
    password,
  } = req.body;

  try {
    const existingUser = await user.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json("Email is already registered");
    }

    const candidate = await user.create({
      firstname,
      lastname,
      ph_no,
      address,
      country,
      state,
      city,
      email,
      password,
    });
    const user_id = `A${String(candidate.id).padStart(3, "0")}`;
    candidate.user_id = user_id;
    await candidate.save();
    const useid = candidate.get({ plain: true }).id;
    const createLogin = await login.create({
      candidateId: candidate.id,
      email,
      password,
      role: "candidate",
    });
    // console.log(createLogin)
    res.status(201).send(" User created!", candidate);
  } catch (err) {
    res.status(500).send(err);
  }
});
Router.get("/:postsegment", async (req, res) => {
  const { postsegment } = req.params;

  try {
    let result;

    if (postsegment === "candidates") {
      result = await user.findAll(); // Return all users
    } else if (postsegment === "applicants") {
      const applicationData = await application.findAll({ raw: true });

      if (!applicationData.length) {
        return res.status(404).json({ error: "No applicants found" });
      }

      const candidateIds = [...new Set(applicationData.map(a => a.candidateId))];
      const jobIds = [...new Set(applicationData.map(a => a.jobId))];

      const users = await user.findAll({
        where: { id: candidateIds },
        raw: true
      });

      const jobs = await job.findAll({
        where: { id: jobIds },
        raw: true
      });

      const fieldDataRows = await fieldData.findAll({
        where: {
          candidateId: candidateIds,
          jobId: jobIds
        },
        raw: true
      });

      const userMap = {};
      users.forEach(u => { userMap[u.id] = u; });

      const jobMap = {};
      jobs.forEach(j => { jobMap[j.id] = j; });

      result = applicationData.map(app => {
        const candidate = userMap[app.candidateId] || {};
        const job = jobMap[app.jobId] || {};

        return {
          applicationId: app.id,
          candidateId: app.candidateId,
          jobId: app.jobId,
          status: app.status,
          firstname: candidate.firstname,
          lastname: candidate.lastname,
          email: candidate.email,
          ph_no: candidate.ph_no,
          jobTitle: job.title,
          companyName: job.companyName,
          fieldData: fieldDataRows
            .filter(fd => fd.candidateId === app.candidateId && fd.jobId === app.jobId)
            .map(fd => ({
              fieldId: fd.fieldId,
              value: fd.value
            }))
        };
      });
    } else {
      return res.status(400).json({ message: "Invalid post segment" });
    }

    res.json(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
Router.get("/applicants/:companyId", async (req, res) => {
  const { companyId } = req.params;

  try {
    // 1. Get all jobs for this company
    const companyJobs = await job.findAll({
      where: { companyId },
      raw: true
    });

    if (!companyJobs.length) {
      return res.status(404).json({ error: "No jobs found for this company" });
    }

    const jobIds = companyJobs.map(j => j.id);

    // 2. Get applications for these jobs
    const applications = await application.findAll({
      where: { jobId: jobIds },
      raw: true
    });

    if (!applications.length) {
      return res.status(404).json({ error: "No applicants found for this company" });
    }

    const candidateIds = [...new Set(applications.map(app => app.candidateId))];

    // 3. Get candidate data
    const users = await user.findAll({
      where: { id: candidateIds },
      raw: true
    });

    // 4. Get dynamic field data for those candidates and jobs
    const fieldDataRows = await fieldData.findAll({
      where: {
        candidateId: candidateIds,
        jobId: jobIds
      },
      raw: true
    });

    // 5. Prepare mapping for fast lookup
    const userMap = {};
    users.forEach(u => { userMap[u.id] = u; });

    const jobMap = {};
    companyJobs.forEach(j => { jobMap[j.id] = j; });

    // 6. Build result
    const result = applications.map(app => {
      const candidate = userMap[app.candidateId] || {};
      const jobItem = jobMap[app.jobId] || {};

      return {
        applicationId: app.id,
        candidateId: app.candidateId,
        jobId: app.jobId,
        status: app.status,
        firstname: candidate.firstname,
        lastname: candidate.lastname,
        email: candidate.email,
        ph_no: candidate.ph_no,
        jobTitle: jobItem.title,
        companyName: jobItem.companyName,
        fieldData: fieldDataRows
          .filter(fd => fd.candidateId === app.candidateId && fd.jobId === app.jobId)
          .map(fd => ({
            fieldId: fd.fieldId,
            value: fd.value
          }))
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Error fetching company applicants:", err);
    res.status(500).send("Server error");
  }
});
Router.get("/:id", async (req, res) => {
  const { id } = req.params;
  // console.log('test', id)
  try {
    const candidate = await user.findOne({ where: { id: id }, raw: true });
    // console.log(candidate)
    if (candidate) {
      res.send(candidate);
    } else {
      res.status(404).send("Candidate not found!");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});
Router.get("/applicant/:id", async (req, res) => {
  const { id } = req.params;
  // console.log('test', id)
  try {
    const candidate = await user.findOne({ where: { id: id }, raw: true });
    // console.log(candidate)
    if (candidate) {
      res.send(candidate);
    } else {
      res.status(404).send("Applicant not found!");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});
Router.get("/get-pdf/:filename", (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, "uploads", filename);
  res.sendFile(filepath);
});
Router.put("/:candidateId/:jobId", upload.any(), async (req, res) => {
  const { candidateId, jobId } = req.params;
  try {
    // 1. Parse user data (static fields)
    const userData = JSON.parse(req.body.data || "{}");
    // 2. Parse location fields array (if provided)
    const locationDataArray = JSON.parse(req.body.locationData || "[]");
    // 3. Merge dynamic fields (non-location)
    const formValues = Object.entries(req.body).reduce((acc, [key, value]) => {
      if (key !== "data" && key !== "locationData") acc[key] = value;
      return acc;
    }, {});
    // 4. Add uploaded files into formValues
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        formValues[file.fieldname] = file.filename;
      });
    }
    // 5. Prepare inserts for basic dynamic fields
    const dynamicInserts = Object.entries(formValues)
      .map(([fieldId, value]) => ({
        candidateId: parseInt(candidateId),
        jobId: parseInt(jobId),
        fieldId: parseInt(fieldId),
        value: typeof value === "object" ? JSON.stringify(value) : value,
      }))
      .filter((f) => !isNaN(f.fieldId));
    // 6. Upsert basic dynamic fields
    for (const field of dynamicInserts) {
      const [record, created] = await fieldData.findOrCreate({
        where: {
          candidateId: field.candidateId,
          jobId: field.jobId,
          fieldId: field.fieldId,
        },
        defaults: {
          value: field.value,
        },
      });

      if (!created) {
        await record.update({ value: field.value });
      }
    }
    // 7. Handle location field inserts
    for (const loc of locationDataArray) {
      const { fieldId, countryCode, countryName, stateCode, stateName, cityName } = loc;
      // Create or find the main fieldData row (as a placeholder for location)
      const [fieldDataRecord, created] = await fieldData.findOrCreate({
        where: {
          candidateId: candidateId,
          jobId: jobId,
          fieldId: fieldId,
        },
        defaults: {
          value: "location", // just a marker
        },
      });
      if (!created) {
        await fieldDataRecord.update({ value: "location" });
      }
      const fieldDataId = fieldDataRecord.id;
      // Check if locationData already exists
      const existing = await locationData.findOne({
        where: {
          fieldDataId,
          jobId,
          candidateId,
        },
      });
      if (existing) {
        await existing.update({
          countryCode,
          countryName,
          stateCode,
          stateName,
          cityName,
        });
      } else {
        await locationData.create({
          jobId,
          candidateId,
          fieldDataId,
          countryCode,
          countryName,
          stateCode,
          stateName,
          cityName,
        });
      }
    }
    // 8. Upsert application record
    const [record, created] = await application.findOrCreate({
      where: {
        candidateId: candidateId,
        jobId: jobId,
      },
      defaults: {
        status: "Submited",
      },
    });

    if (!created) {
      await record.update({ status: "Submited" });
    }

    res.status(200).json({ success: true, message: "Application saved & status updated." });
  } catch (err) {
    console.error("Error handling application submission:", err);
    res.status(500).json({ error: "Failed to process application." });
  }
});


module.exports = Router;
