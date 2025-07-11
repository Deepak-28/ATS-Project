const Router = require("express").Router();
const { raw } = require("express");
const { template, templateField, workFlowStage,job, field } = require("../config/index");
const { Op, where } = require("sequelize");

Router.post("/", async (req, res) => {  
  const { fieldPositions, name, formType, fieldOrder, jobTemplateData } = req.body;
  // console.log(jobTemplateData);
  
  const { jobWorkFlowId, candidateWorkFlowId, candidateFormId } = jobTemplateData;
  // console.log(jobWorkFlowId,candidateWorkFlowId, candidateFormId );
  
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
});
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
Router.get("/job/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const templateData = await template.findOne({ where: { id }, raw: true });
    if (!templateData) {
      return res.status(404).json({ message: "Template not found" });
    }

    const workFlowId = templateData.jobWorkFlowId;
    if (!workFlowId) {
      return res.status(404).json({ message: "Workflow ID not found in template" });
    }

    const workflowStages = await workFlowStage.findAll({ where: { workFlowId }, raw: true });

    res.json(workflowStages);

  } catch (err) {
    console.error("Error in Fetching Stages", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});
Router.get("/candidate/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const jobData = await job.findOne({ where: { id }, raw: true });
    if (!jobData) return res.status(404).json({ message: "Job not found" });

    const templateId = jobData.templateId;
    if (!templateId) return res.status(404).json({ message: "Template ID not found in job" });

    const templateData = await template.findOne({ where: { id: templateId }, raw: true });
    if (!templateData) return res.status(404).json({ message: "Template not found" });

    const workFlowId = templateData.candidateWorkFlowId;
    if (!workFlowId) return res.status(404).json({ message: "Workflow ID not found in template" });

    const workflowStages = await workFlowStage.findAll({ where: { workFlowId }, raw: true });
    res.json(workflowStages);
    // console.log(workflowStages);
    
    
  } catch (err) {
    console.error("Error in Fetching Stages", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});
Router.get("/fields/candidate/:id", async(req, res)=>{
  const {id} = req.params;
  // console.log(id, 123);
  try {
    const templateData = await template.findOne({ where: { id }, raw: true });
    const candidateFormId = templateData.candidateTemplateId;

    const templateFields = await templateField.findAll({
      where: { templateId: candidateFormId },
      raw: true,
    });

    const fieldIds = templateFields.map((tf) => tf.fieldId);
    const allFields = await field.findAll({
      where: { id: fieldIds },
      raw: true,
    });
    

    const fieldMap = allFields.reduce((acc, f) => {
      acc[f.id] = f;
      return acc;
    }, {});

    // // Merge field into each templateField
    const result = templateFields.map((tf) => ({
      ...tf,
      field: fieldMap[tf.fieldId],
    }));
    // console.log(result);

    res.send(result);
  } catch (err) {
    console.error("Error in fetch data", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
})
Router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, fieldPositions, fieldOrder, jobTemplateData } = req.body;
  const { jobWorkFlowId, candidateWorkFlowId, candidateFormId } = jobTemplateData;

  try {
    // Update template name
    await template.update({ name,jobWorkFlowId,candidateWorkFlowId ,candidateTemplateId : candidateFormId }, { where: { id } });

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
