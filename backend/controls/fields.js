const express = require("express");
const { Op } = require('sequelize');
const router = express.Router();
const { field, fieldOption, fieldData, locationData } = require("../config/index");

router.post("/create", async (req, res) => {
  const {
    companyId,
    formType,
    fieldCode,
    fieldLabel,
    fieldType,
    options, // expected as array of objects [{ value, order, status }, ...]
    isRequired,
    isActive,
    isDuplicate,
  } = req.body;

  if (!formType || !fieldLabel || !fieldType) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Create field record first
    const newField = await field.create({
      companyId,
      formType,
      fieldCode,
      fieldLabel,
      fieldType,
      isRequired: isRequired || false,
      isActive: isActive || false,
      isDuplicate: isDuplicate || false,
    });

    // If options is an array, bulk create fieldOptions linked to this field
    if (Array.isArray(options) && options.length > 0) {
      const optionsToCreate = options
        .filter((opt) => opt.value && opt.value.trim() !== "")
        .map((opt) => ({
          fieldId: newField.id,
          value: opt.value.trim(),
          order: opt.order || 0,
          status: opt.status || "Active",
          optionCode: opt.optionCode,
        }));

      if (optionsToCreate.length > 0) {
        await fieldOption.bulkCreate(optionsToCreate);
      }
    }

    res.status(201).json({ message: "Field created", field: newField });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
router.get("/options/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await fieldOption.findAll({
      where: { fieldId: id },
      raw: true,
    });
    // console.log(data);
    res.send(data);
  } catch (err) {
    console.error("Error in getting data", err);
  }
});
router.get("/:companyId/:formType", async (req, res) => {
  const { companyId, formType } = req.params;

  try {
    const fields = await field.findAll({
      where: { formType },
      order: [["id", "ASC"]],
    });
    // console.log(fields);

    res.send(fields);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching fields");
  }
});
router.get("/template/:formType", async (req, res) => {
  const { formType } = req.params;
  try {
    const fields = await field.findAll({ where: { formType } });
    // console.log(fields);
    res.send(fields);
  } catch (error) {
    console.error("Error in Fetching Fields", error);
  }
});
router.get("/job", async (req, res) => {
  try {
    const fields = await field.findAll({ where: { formType: "job" } });
    res.send(fields);
  } catch (error) {
    console.error("Error in Fetching Fields", error);
  }
});
router.get("/candidate", async (req, res) => {
  try {
    const fields = await field.findAll();
    const dynamicData = await fieldData.findAll();
    const location = await locationData.findAll();

    res.status(200).send({
      fields,
      dynamicData,
      location
    });
  } catch (error) {
    console.error("Error in Fetching Fields", error);
    res.status(500).json({ error: "Failed to fetch candidate data" });
  }
});
router.get("/all", async (req, res)=>{
  try{
    const fields = await field.findAll({where:{formType:"candidate"}});
    // console.log(fields);
    
    res.send(fields)
  }catch(err){
    console.error("Error in fetching fields", err)
  }
});
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const {
    companyId,
    formType,
    fieldCode,
    fieldLabel,
    fieldType,
    options,
    isRequired,
    isActive,
    isDuplicate,
  } = req.body;

  try {
    // 1. Update the field itself
    const [updatedCount] = await field.update(
      {
        companyId,
        formType,
        fieldCode,
        fieldLabel,
        fieldType,
        isRequired,
        isActive,
        isDuplicate,
      },
      { where: { id } }
    );

    if (updatedCount === 0) {
      return res.status(404).json({ message: "Field not found or unchanged" });
    }

    // 2. Update dropdown/checkbox options smartly
    if (
      (fieldType === "dropdown" || fieldType === "checkbox") &&
      Array.isArray(options)
    ) {
      const existingOptions = await fieldOption.findAll({
        where: { fieldId: id },
      });
      const existingOptionIds = existingOptions.map((opt) => opt.id);

      const incomingOptionIds = [];

      for (const opt of options) {
        if (opt.id) {
          // Update existing option
          incomingOptionIds.push(opt.id);
          await fieldOption.update(
            {
              value: opt.value.trim(),
              order: opt.order || 0,
              status: opt.status || "Active",
            },
            { where: { id: opt.id, fieldId: id } }
          );
        } else {
          // Create new option
          const newOpt = await fieldOption.create({
            fieldId: id,
            value: opt.value.trim(),
            order: opt.order || 0,
            status: opt.status || "Active",
          });
          incomingOptionIds.push(newOpt.id);
        }
      }

      // 3. Delete removed options
      const toDelete = existingOptionIds.filter(
        (existingId) => !incomingOptionIds.includes(existingId)
      );
      if (toDelete.length > 0) {
        await fieldOption.destroy({ where: { id: toDelete } });
      }
    } else {
      // If fieldType is changed to something without options (e.g. "text"), remove existing options
      await fieldOption.destroy({ where: { fieldId: id } });
    }

    res.json({ message: "Field and options updated successfully" });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Update failed", error: error.message });
  }
});
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await field.destroy({ where: { id } });
    res.send("field deleted!");
  } catch (error) {
    res.status(500).send("field Not Deleted");
  }
});
module.exports = router;
