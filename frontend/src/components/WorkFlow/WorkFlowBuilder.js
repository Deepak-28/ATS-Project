import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import "./WorkFlowBuilder.css";
import axios from "axios";
import Navbar from "../admin/Navbar";

const WorkflowBuilder = () => {
  const [stageName, setStageName] = useState("");
  const [stages, setStages] = useState([]);
  const [workflowType, setWorkflowType] = useState("job");

  // Fetch workflow on mount and when workflowType changes
  useEffect(() => {
    fetchWorkflow();
  }, [workflowType]);

  const fetchWorkflow = async () => {
    try {
      const res = await axios.get(`/workFlow/${workflowType}`);
      if (Array.isArray(res.data)) {
        setStages(
          res.data.map((stage) => ({
            id: stage.id,
            name: stage.stageName,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching workflow:", err);
    }
  };

  const handleAddStage = () => {
    if (stageName.trim()) {
      setStages([...stages, { name: stageName.trim() }]); // No `id` means not saved yet
      setStageName("");
    }
  };

  const handleDelete = async (index) => {
    const stage = stages[index];

    // If not saved in DB yet
    if (!stage.id) {
      const updated = stages.filter((_, i) => i !== index);
      setStages(updated);
      return;
    }

    // Delete from DB
    try {
      const res = await axios.delete(`/workFlow/delete/${stage.id}`);
      if (res.status === 200) {
        const updated = stages.filter((_, i) => i !== index);
        setStages(updated);
        toast.success("Stage deleted successfully.");
      } else {
        toast.error("Failed to delete stage.");
      }
    } catch (err) {
      console.error("Error deleting stage:", err);
      toast.error("Something went wrong while deleting.");
    }
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
    if (stages.length === 0) {
      alert("Add at least one stage.");
      return;
    }

    const payload = {
      workflowType, // "job" or "applicant"
      stages: stages.map((stage, index) => ({
        stageName: stage.name,
        order: index + 1,
      })),
    };

    try {
      const response = await axios.post("/workFlow/create", payload);
      if (response.status === 200) {
        toast.success("Workflow saved successfully!");
        fetchWorkflow(); // Refetch to get IDs
      } else {
        toast.error("Failed to save workflow.");
      }
    } catch (error) {
      console.error("Error saving workflow:", error);
      toast.error("Something went wrong. Check the console for details.");
    }
  };

  const handleWorkflowTypeChange = (type) => {
    setWorkflowType(type);
  };

  return (
    <div className="container ">
      <Navbar />
      <div className="admin-container h100 ">
        <div className="wb-container  ">
          <h2 className="wb-heading">Workflow Builder</h2>

          <div className="wb-toggle-group ">
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
            <label className="wb-label">Stage Name</label>
            <input
              type="text"
              className="wb-input"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              placeholder="e.g., Applied, Screening"
            />
            <div className="df al jc">
              <button className="b btn" onClick={handleAddStage}>
                Add
              </button>
            </div>
          </div>

          <div className="wb-scroll">
            <ul className="wb-stage-list">
              {stages.map((stage, index) => (
                <li key={index} className="wb-stage-item">
                  <span>{stage.name}</span>
                  <div>
                    <button onClick={() => handleMoveUp(index)}>⬆️</button>
                    <button onClick={() => handleMoveDown(index)}>⬇️</button>
                    <button onClick={() => handleDelete(index)}>❌</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="df al jc  h5 mt5">
              <button className="green btn" onClick={handleSaveWorkflow}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
