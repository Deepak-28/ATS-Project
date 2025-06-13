const Router = require("express").Router();
const { template, templateField } = require("../config/index");

Router.post("/", async (req, res) => {
  const { fieldPositions, name } = req.body;
//   console.log(fieldPositions);
  try {
    const newTemplate = await template.create({ name });
    // console.log(newTemplate);
    const templateId = newTemplate.id
    for (const [fieldId, position] of Object.entries(fieldPositions)) {
      await templateField.create({
        templateId: templateId,
        fieldId: parseInt(fieldId),
        position: position,
      });
    }
    res.send("Template Created");
  } catch (err) {
    console.error("Error in creation template", err);
  }
});
Router.get("/all", async(req, res)=>{
    try{
        const data = await template.findAll()
        res.send(data)
    }catch(err){
        console.error("Error in getting template", err)
    }
});
Router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, fieldPositions } = req.body;
//   console.log(id);
//   console.log(name, fieldPositions);
  try {
    // Update name
    await template.update({ name }, { where: { id } });

    // Clear old field mappings
    await templateField.destroy({ where: { templateId: id } });

    // Re-insert new field mappings
    const entries = Object.entries(fieldPositions);
    for (const [fieldId, position] of entries) {
      await templateField.create({
        templateId: id,
        fieldId,
        position,
      });
    }

    res.status(200).send("Template updated successfully");
  } catch (err) {
    console.error("Error updating template:", err);
    res.status(500).send("Failed to update template");
  }
});
Router.delete('/:id', async(req, res)=>{
    const {id} = req.params;
    // console.log(id, 123);
    try{
        await template.destroy({where:{id}});
        await templateField.destroy({where:{templateId:id}})
        res.send("Done")
    }catch(err){
        console.error("Error in Deleting", err)
    }
    
})

module.exports = Router;
