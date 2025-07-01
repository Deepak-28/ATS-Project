const Router = require("express").Router();
const { workFlow, workFlowStage } = require("../config/index");
const { Op } = require("sequelize");

Router.post("/create", async (req, res) => {
  const { workflowType, workFlowName, stages } = req.body;

  if (!workflowType || !["job", "applicant"].includes(workflowType)) {
    return res.status(400).json({ error: "Invalid workflow type." });
  }
  if (!workFlowName || !Array.isArray(stages) || stages.length === 0) {
    return res.status(400).json({ error: "Invalid data." });
  }

  try {
    const newWorkflow = await workFlow.create({
      workflowType,
      workFlowName,
    });
    const createdStages = await workFlowStage.bulkCreate(
      stages.map((stage) => ({
        workFlowId: newWorkflow.id,
        StageName: stage.stageName,
        Order: stage.order,
      }))
    );

    res.status(200).json({
      message: "Workflow created successfully",
      workflow: newWorkflow,
      stages: createdStages,
    });
  } catch (error) {
    console.error("Error creating workflow:", error);
    res.status(500).json({ error: "Server error." });
  }
});
Router.get("/:type", async (req, res) => {
  const { type } = req.params;

  try {
    if (!["job", "applicant"].includes(type)) {
      return res.status(400).json({ error: "Invalid workflow type." });
    }
    const workflows = await workFlow.findAll({
      where: { workflowType: type },
      order: [["id", "ASC"]],
    });
    // console.log(workflows);
    
    if (!workflows.length) {
      return res.status(404).json({ message: "No workflows found." });
    }
    const workflowIds = workflows.map((wf) => wf.id);
    const stages = await workFlowStage.findAll({
      where: {
        workFlowId: {
          [Op.in]: workflowIds,
        },
      },
      order: [["order", "ASC"]],
    });
    // console.log(stages);
    
    const stagesByWorkflow = {};
    for (const stage of stages) {
      const wfId = stage.workFlowId;
      if (!stagesByWorkflow[wfId]) {
        stagesByWorkflow[wfId] = [];
      }
      stagesByWorkflow[wfId].push(stage.toJSON());
    }
    const workflowsWithStages = workflows.map((workflow) => ({
      ...workflow.toJSON(),
      stages: stagesByWorkflow[workflow.id] || [],
    }));
    res.send(workflowsWithStages)
    // console.log(workflowsWithStages);
  } catch (error) {
    console.error("Error fetching workflows:", error);
    res.status(500).json({ error: "Server error." });
  }
});
Router.get("/job", async(req, res)=>{
  try{
    const data = await workFlow.findAll({where:{workflowType:"job"}, raw:true})
    res.send(data);
    // console.log(data);
    
  }catch(err){
    console.error("Error in getting workflow", err)
  }
});
Router.get("/job/:id", async (req, res)=>{
  const {id} = req.params;
  try{
    const data = await workFlowStage.findAll({where:{workFlowId: id}, raw:true});
    // console.log(data);
    res.send(data);
    
  }catch(err){
    console.error("error in getting data", err)
  }
  
})
Router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { workFlowName, stages } = req.body;

  try {
    const workflow = await workFlow.findByPk(id);
    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found." });
    }
    await workFlow.update(
      { workFlowName }, 
      { where: { id } } 
    );
    await workFlowStage.destroy({
      where: { workFlowId: id },
    });
    const newStages = await workFlowStage.bulkCreate(
      stages.map((stage, index) => ({
        workFlowId: id,
        StageName: stage.stageName,
        Order: stage.order ?? index + 1,
      }))
    );

    res.status(200).json({
      message: "Workflow updated successfully.",
      // workFlowId: id,
      // stages: newStages,
    });
  } catch (error) {
    console.error("Error updating workflow:", error);
    res.status(500).json({ error: "Server error." });
  }
});
Router.delete("/delete/workflow/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const workflow = await workFlow.findByPk(id);

    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found." });
    }
    await workFlowStage.destroy({
      where: { workFlowId: id },
    });
    await workflow.destroy();

    res.status(200).json({ message: "Workflow and its stages deleted successfully." });
  } catch (error) {
    console.error("Error deleting workflow:", error);
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = Router;
