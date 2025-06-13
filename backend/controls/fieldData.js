const Router = require("express").Router();
const {fieldData} = require('../config/index');

Router.post("/bulkCreate", async (req, res) => {
  console.log(req.body);
  
  try {
    const data = req.body; // array of { jobId, fieldId, value }

    await fieldData.bulkCreate(data); // insert multiple records
    res.status(201).json({ message: "Field data saved" });
  } catch (err) {
    console.error("Field data insert failed:", err);
    res.status(500).json({ error: "Field data insert failed" });
  }
});
Router.get("/all", async(req, res)=>{
  try{
    const data = await fieldData.findAll();
    res.send(data);
    // console.log(data);
    
  }catch(err){
    console.error("Failed to Fetch Field Data", err)
  }
})
Router.get("/:jobId", async(req, res)=>{
  const {jobId} = req.params;
   try {
    const data = await fieldData.findAll({
      where: { jobId }
    });
    res.send(data)
  }catch(err){
      console.error("error in fectching field data", err)
    }
});

Router.put("/bulkUpdate", async (req, res) => {
  const updates = req.body; // [{ jobId, fieldId, value }]
// console.log(req.body);

  try {
    for (const field of updates) {
      const existing = await fieldData.findOne({
        where: { jobId: field.jobId, fieldId: field.fieldId },
      });

      if (existing) {
        await fieldData.update(
          { value: field.value },
          { where: { jobId: field.jobId, fieldId: field.fieldId } }
        );
      } else {
        await fieldData.create(field);
      }
    }

    res.json({ message: "Field data updated successfully" });
  } catch (err) {
    console.error("Field data update failed:", err);
    res.status(500).json({ error: "Field data update failed" });
  }
});

module.exports = Router;