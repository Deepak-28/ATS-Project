const Router = require("express").Router();
const {fieldData, locationData} = require('../config/index');

Router.post("/bulkCreate", async (req, res) => {
  // console.log(req.body);
  
  try {
    const data = req.body; // array of { jobId, fieldId, value }

    await fieldData.bulkCreate(data); // insert multiple records
    res.status(201).json({ message: "Field data saved" });
  } catch (err) {
    console.error("Field data insert failed:", err);
    res.status(500).json({ error: "Field data insert failed" });
  }
});
Router.post('/location', async (req, res) => {
  const {
    jobId,
    fieldId,
    countryCode,
    countryName,
    stateCode,
    stateName,
    cityName,
  } = req.body;

  try {
    const fieldDatas = await fieldData.create({
      jobId,
      fieldId,
      value: 'location',
    });

    await locationData.create({
      jobId,
      fieldDataId: fieldDatas.id,
      countryCode,
      countryName,
      stateCode,
      stateName,
      cityName,
    });

    res.status(201).json({ success: true, message: 'Location saved' });
  } catch (err) {
    console.error('Error saving location field:', err);
    res.status(500).json({ success: false, message: 'Error saving location field' });
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
Router.get('/:jobId', async (req, res) => {
  const { jobId } = req.params;

  try {
    const fieldDataList = await fieldData.findAll({
      where: { jobId },
      raw: true,
    });

    const fieldDataIds = fieldDataList.map(fd => fd.id);

    const locationList = await locationData.findAll({
      where: { fieldDataId: fieldDataIds },
      raw: true,
    });

    const response = fieldDataList.map(fd => {
      const location = locationList.find(loc => loc.fieldDataId === fd.id);

      if (location) {
        return {
          fieldId: fd.fieldId,
          fieldType: 'location',
          countryCode: location.countryCode,
          countryName: location.countryName,
          stateCode: location.stateCode,
          stateName: location.stateName,
          cityName: location.cityName,
        };
      } else {
        return {
          fieldId: fd.fieldId,
          value: fd.value,
        };
      }
    });

    res.send(response);
  } catch (err) {
    console.error('Error fetching field data', err);
    res.status(500).send('Error fetching field data');
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