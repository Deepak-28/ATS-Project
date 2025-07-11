const Router = require("express").Router();
const { user, login, application, fieldData } = require("../config/index");
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
  // console.log(req.body)
  try {
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
    let users;

    if (postsegment === "candidates") {
      users = await user.findAll(); // return all users
    } else if (postsegment === "applicants") {
      // Get all candidateIds from applications
      const applications = await application.findAll({
        attributes: ["candidateId"],
        raw: true,
      });

      const candidateIds = applications.map((app) => app.candidateId);

      // Get users matching those candidateIds
      users = await user.findAll({
        where: {
          id: candidateIds,
        },
        raw: true,
      });
    } else {
      return res.status(400).json({ message: "Invalid post segment" });
    }
    console.log(users);

    res.json(users);
  } catch (err) {
    res.status(500).send(err.message);
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
    // 1. Log form data
    // console.log("Uploaded Files:", req.files);
    // console.log("Text Fields:", req.body);

    // 2. Parse static user data
    const userData = JSON.parse(req.body.data || "{}");
    // console.log("Parsed User Data:", userData);

    // 3. Merge dynamic fields
    const formValues = Object.entries(req.body).reduce((acc, [key, value]) => {
      if (key !== "data") acc[key] = value;
      return acc;
    }, {});

    // 4. Include uploaded files
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        formValues[file.fieldname] = file.filename;
      });
    }

    console.log("Parsed formValues:", formValues);

    // 5. Prepare dynamic inserts for fieldData table
    const dynamicInserts = Object.entries(formValues)
      .map(([fieldId, value]) => ({
        candidateId: parseInt(candidateId),
        jobId: parseInt(jobId),
        fieldId: parseInt(fieldId),
        value: typeof value === "object" ? JSON.stringify(value) : value,
      }))
      .filter((f) => !isNaN(f.fieldId));

    // 6. Upsert dynamic field data
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

    const [record, created] = await application.findOrCreate({
      where: {
        candidateId: candidateId,
        jobId: jobId,
      },
      defaults: {
        status: "applied",
      },
    });

    if (!created) {
      await record.update({ status: "applied" });
    }

    res
      .status(200)
      .json({ success: true, message: "Application saved & status updated." });
  } catch (err) {
    console.error("Error handling application submission:", err);
    res.status(500).json({ error: "Failed to process application." });
  }
});

module.exports = Router;
