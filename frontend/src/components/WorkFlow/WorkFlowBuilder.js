import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import "./WorkFlowBuilder.css";
import axios from "axios";
import Navbar from "../admin/Navbar";

const WorkflowBuilder = () => {
  const [stageName, setStageName] = useState("");
  const [workFlowName, setWorkFlowName] = useState("");
  const [stages, setStages] = useState([]);
  const [workflowType, setWorkflowType] = useState("job");
  const [workFlowData, setWorkFlowData] = useState([]);
  const [editingWorkflowId, setEditingWorkflowId] = useState(null);

  const fetchWorkflow = async () => {
    try {
      const res = await axios.get(`/workFlow/${workflowType}`);
      setWorkFlowData(res.data.workflows || res.data); // supports both response formats
    } catch (err) {
      console.error("Error fetching workflow:", err);
    }
  };
  const handleAddStage = () => {
    if (stageName.trim()) {
      setStages([...stages, { name: stageName.trim() }]);
      setStageName("");
    }
  };
  const handleDeleteStage = (index) => {
    setStages(stages.filter((_, i) => i !== index));
  };
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...stages];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setStages(updated);
  };
  const handleMoveDown = (index) => {
    if (index === stages.length - 1) return;
    const updated = [...stages];
    [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
    setStages(updated);
  };
const handleSaveWorkflow = async () => {
  if (!workFlowName.trim() || stages.length === 0) {
    toast.error("Please add a workflow name and at least one stage.");
    return;
  }

  const payload = {
    workFlowName,
    stages: stages.map((stage, index) => ({
      stageName: stage.name,
      order: index + 1,
    })),
  };

  try {
    if (editingWorkflowId) {
      
      const res = await axios.put(`/workFlow/update/${editingWorkflowId}`, payload);
      if (res.status === 200) {
        toast.success("Workflow updated successfully!");
      } else {
        toast.error("Failed to update workflow.");
      }
    } else {
     
      const res = await axios.post("/workFlow/create", {
        workflowType,
        workFlowName,
        stages: payload.stages,
      });

      if (res.status === 200) {
        toast.success("Workflow created successfully!");
      } else {
        toast.error("Failed to create workflow.");
      }
    }

    clearForm();
    fetchWorkflow();
  } catch (err) {
    console.error("Error saving/updating workflow:", err);
    toast.error("Server error occurred.");
  }
};
  const handleDeleteWorkflow = async (id) => {
    try {
      const res = await axios.delete(`/workFlow/delete/workflow/${id}`);
      if (res.status === 200) {
        toast.success("Workflow deleted.");
        fetchWorkflow();
      } else {
        toast.error("Failed to delete workflow.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Server error during delete.");
    }
  };
 const handleEditWorkflow = (workflow) => {
  setWorkFlowName(workflow.workFlowName);
  setStages(
    workflow.stages.map((s) => ({
      name: s.StageName,
      order: s.Order,
    }))
  );
  setEditingWorkflowId(workflow.id); // Track for update
};
  const clearForm = () => {
    setWorkFlowName("");
    setStageName("");
    setStages([]);
    setEditingWorkflowId(null);
  };
  const handleWorkflowTypeChange = (type) => {
    setWorkflowType(type);
    clearForm();
  };
  useEffect(() => {
    fetchWorkflow();
  }, [workflowType]);

  return (
    <div className="container">
      <Navbar />
      <div className="admin-container h100 df jcsb">
        <div className="wb-container">
          <h2 className="wb-heading">Workflow Builder</h2>

          <div className="wb-toggle-group">
            <button
              className={`wb-toggle-button ${
                workflowType === "job" ? "active" : ""
              }`}
              onClick={() => handleWorkflowTypeChange("job")}
            >
              Job Workflow
            </button>
            <button
              className={`wb-toggle-button ${
                workflowType === "applicant" ? "active" : ""
              }`}
              onClick={() => handleWorkflowTypeChange("applicant")}
            >
              Applicant Workflow
            </button>
          </div>

          <div className="wb-form-group">
            <label className="wb-label">Workflow Name</label>
            <input
              type="text"
              className="wb-input"
              value={workFlowName}
              onChange={(e) => setWorkFlowName(e.target.value)}
              placeholder="e.g., WorkFlow 1"
            />

            <label className="wb-label">Stage Name</label>
            <input
              type="text"
              className="wb-input"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              placeholder="e.g., Applied, Interview"
            />

            <div className="df al jc ">
              <button className="b btn" onClick={handleAddStage}>
                Add
              </button>
            </div>
          </div>
          <div className="wb-scroll df jcsb fdc">
            <ul className="wb-stage-list">
              {stages.map((stage, index) => (
                <li key={index} className="wb-stage-item">
                  <span>
                    {index + 1}. {stage.name}
                  </span>
                  <div>
                    <button onClick={() => handleMoveUp(index)}>⬆️</button>
                    <button onClick={() => handleMoveDown(index)}>⬇️</button>
                    <button onClick={() => handleDeleteStage(index)}>❌</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="df ae  jc mt5">
              <button className="green btn" onClick={handleSaveWorkflow}>
                {editingWorkflowId ? "Update" : "Save"}
              </button>
              <button className="btn gray ml5" onClick={clearForm}>
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="wb-container2 df al fdc">
          <h3>Existing Workflows</h3>
          <div className="templates df fdc ">
            {workFlowData.map((workflow) => (
              <div key={workflow.id} className="templates-list df al jcsb g10 ">
                <div className="ml10">
                  <h4>{workflow.workFlowName}</h4>
                   <p className="mt5">
                    <strong>Stages:</strong>{" "}
                  {workflow.stages
                    .sort((a, b) => a.Order - b.Order)
                    .map((stage) => stage.StageName)
                    .join(", ")}
                   </p>
                </div>
                <div className="df al g5 mr10">
                    <FaEdit
                      size={16}
                      color="blue"
                      className="cursor-pointer"
                      onClick={() => handleEditWorkflow(workflow)}
                      title="Edit WorkFlow"
                    />
                    <MdDeleteForever
                      size={20}
                      color="red"
                      className="cursor-pointer"
                      onClick={() => handleDeleteWorkflow(workflow.id)}
                      title="Delete WorkFlow"
                    />
                  </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
