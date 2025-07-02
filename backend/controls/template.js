const Router = require("express").Router();
const { template, templateField } = require("../config/index");
const { Op, where } = require("sequelize");

Router.post("/", async (req, res) => {  
  const { fieldPositions, name, formType, fieldOrder, jobTemplateData } = req.body;
  console.log(jobTemplateData);
  
  const { jobWorkFlowId, candidateWorkFlowId, candidateFormId } = jobTemplateData;
  console.log(jobWorkFlowId,candidateWorkFlowId, candidateFormId );
  
  try {
    const newTemplate = await template.create(
      { name, type: formType, jobWorkFlowId,candidateWorkFlowId ,candidateTemplateId : candidateFormId },
    );
    // console.log(newTemplate);
    const templateId = newTemplate.id;
    for (let index = 0; index < fieldOrder.length; index++) {
      const fieldId = fieldOrder[index];
      const position = fieldPositions[fieldId] || "left"; // fallback to left/right

      await templateField.create({
        templateId: templateId,
        fieldId: parseInt(fieldId),
        position: position,
        order: index, // <-- assuming you have an 'order' column in DB
      });
    }

    res.send("Template Created");
  } catch (err) {
    console.error("Error in creation template", err);
  }
});

Router.get("/all/:formType", async (req, res) => {
  const { formType } = req.params;
  try {
    const templates = await template.findAll({
      where: { type: formType },
      raw: true,
    });
    // console.log(templates);

    const dataId = templates.map((tp) => tp.id);
    const templateFieldsdata = await templateField.findAll({
      where: { templateId: dataId },
      raw: true,
    });
    // console.log(templateFieldsdata);

    const payload = { templates, templateFieldsdata };
    res.send(payload);
    // console.log(payload);
  } catch (err) {
    console.error("Error in getting template", err);
  }
});
Router.get("/candidate", async(req, res)=>{
  try{
    const data = await template.findAll({where:{type:"candidate"}, raw : true});
    res.send(data);
  }catch(err){
    console.error("Error in Fetching candidate template", err)
  }
})
Router.get("/job", async (req, res) => {
  try {
    const data = await template.findAll({ where: { type: "job" }, raw: true });
    const dataId = data.map((tp) => tp.id);
    const templateFieldsdata = await templateField.findAll({
      where: { templateId: dataId },
      raw: true,
    });
    const payload = { data, templateFieldsdata };
    res.send(payload);
  } catch (err) {
    console.error("Error in getting template", err);
  }
});
Router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, fieldPositions, fieldOrder } = req.body;

  try {
    // Update template name
    await template.update({ name }, { where: { id } });

    // Remove previous mappings
    await templateField.destroy({ where: { templateId: id } });

    // Insert updated mappings with correct order
    for (let index = 0; index < fieldOrder.length; index++) {
      const fieldId = fieldOrder[index];
      const position = fieldPositions[fieldId] || "left";

      await templateField.create({
        templateId: id,
        fieldId: parseInt(fieldId),
        position,
        order: index,
      });
    }

    res.status(200).send("Template updated successfully");
  } catch (err) {
    console.error("Error updating template:", err);
    res.status(500).send("Failed to update template");
  }
});

Router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  // console.log(id, 123);
  try {
    await template.destroy({ where: { id } });
    await templateField.destroy({ where: { templateId: id } });
    res.send("Done");
  } catch (err) {
    console.error("Error in Deleting", err);
  }
});

module.exports = Router;
