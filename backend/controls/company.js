const Router = require("express").Router();
const { company, login, application, job, user, fieldData, locationData,postOption } = require("../config/index");
const { Op } = require('sequelize');

Router.post("/add", async (req, res) => {
  const { name, code, e_id, password, industry, country, state, city } =
    req.body;
  try {
    const createdCompany = await company.create(
      {
        name: name,
        code: code,
        e_id: e_id,
        password: password,
        industry: industry,
        country: country,
        state: state,
        city: city,
      },
      { raw: true }
    );
    const data = createdCompany.get({ plain: true });
    // console.log(123,data);

    const data2 = await login.create({
      email: e_id,
      password: password,
      role: "admin",
      cid: data.id,
    });
    res.send("received");
  } catch (err) {
    res.status(500).send(err);
  }
});
Router.get("/companies", async (req, res) => {
  try {
    const company_data = await company.findAll();
    // console.log("Fetched data:", company_data);
    res.json(company_data);
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).send("Failed to Fetch");
  }
});
Router.get("/stats", async (req, res) => {
  try {
    const companyCount = await company.count();
    const jobCount = await job.count();
    const applicationCount = await application.count();
    const usersCount = await login.count({where:{cid:{ [Op.ne]: null,}}});
    // const userCount = await users.count
    const candidateCount = await user.count();

    res.json({
      companies: companyCount,
      jobs: jobCount,
      applications: applicationCount,
      candidates: candidateCount,
      users: usersCount,
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
Router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const data = await company.findOne({ where: { id }, raw: true });
    if (data) {
      res.send(data);
    } else {
      res.send("Company Not Found");
    }
  } catch (err) {
    res.send("Server Error");
  }
});

Router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const update_user = await company.update(data, {
      where: { id },
      raw: true,
    });
    if (update_user) {
      res.send("Company Updated");
    } else {
      res.status(404).send("Company Not Found");
    }
  } catch (err) {
    res.status(500).send("Update Failed");
  }
});
Router.delete("/company/:id", async (req, res) => {
  const companyId = req.params.id;

  try {

    const jobs = await job.findAll({ where: { companyId } });
    const jobIds = jobs.map((j) => j.id);

    if (jobIds.length > 0) {
      await application.destroy({ where: { jobId: { [Op.in]: jobIds } } });
      await postOption.destroy({ where: { jobId: { [Op.in]: jobIds } } });
      await locationData.destroy({ where: { jobId: { [Op.in]: jobIds } } });
      await fieldData.destroy({ where: { jobId: { [Op.in]: jobIds } } });
      await job.destroy({ where: { id: { [Op.in]: jobIds } } });
    }

    await login.destroy({ where: { cid: companyId } });
    await company.destroy({ where: { id: companyId } });

    res.send("Company and all related data deleted successfully.");
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).send("Error deleting company data.");
  }
});

module.exports = Router;
