const Router = require('express').Router();
const {workFlow} = require('../config/index');

Router.post("/create", async (req, res) => {
  try {
    const { workflowType, stages } = req.body;

    if (!workflowType || !["job", "applicant"].includes(workflowType)) {
      return res.status(400).json({ error: "Invalid workflow type." });
    }

    if (!Array.isArray(stages) || stages.length === 0) {
      return res.status(400).json({ error: "Stages are required." });
    }

    // Delete existing stages for that workflowType
    await workFlow.destroy({ where: { workflowType } });

    // Bulk create new stages
    const createdStages = await workFlow.bulkCreate(
      stages.map((stage) => ({
        workflowType,
        stageName: stage.stageName,
        order: stage.order,
      }))
    );

    res.status(200).json({ message: "Workflow saved successfully.", data: createdStages });
  } catch (error) {
    console.error("Error saving workflow:", error);
    res.status(500).json({ error: "Server error." });
  }
});

Router.get("/:type", async (req, res) => {
  const { type } = req.params;
  const workflows = await workFlow.findAll({
    where: { workflowType: type },
    order: [["order", "ASC"]],
  });
  res.json(workflows);
});
Router.put("/update", async (req, res) => {
  const { workflows } = req.body;

  try {
    for (const wf of workflows) {
      await workFlow.update(
        { stageName: wf.stageName, order: wf.order },
        { where: { id: wf.id } }
      );
    }
    res.status(200).json({ message: "Workflow updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
});
Router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const stage = await workFlow.findByPk(id);

    if (!stage) {
      return res.status(404).json({ error: "Stage not found." });
    }

    await stage.destroy();

    res.status(200).json({ message: "Stage deleted successfully." });
  } catch (error) {
    console.error("Error deleting stage:", error);
    res.status(500).json({ error: "Server error." });
  }
});



module.exports = Router;