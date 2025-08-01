import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineAvTimer, MdDeleteForever } from "react-icons/md";
import { IoArrowBackCircle } from "react-icons/io5";
import { FaBriefcase, FaEdit, FaUser } from "react-icons/fa";
import "./AdminJobDetails.css";
import Navbar from "../admin/Navbar";

const AdminJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState({});
  const [popup, setPopup] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isPosted, setIsPosted] = useState(false);
  const [workflowStages, setWorkflowStages] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [options, setOptions] = useState([]);
  const [formData, setFormData] = useState([]);
  const today = new Date().toISOString().split("T")[0];
  const role = localStorage.getItem("role");

  const fetchJobDetails = async () => {
    try {
      const res = await axios.get(`/job/${id}`);
      const jobData = res.data;
      setJob(jobData);
      fetchTemplate(jobData.templateId);
      setSelectedStatus(jobData.status);
      if (jobData.workFlowId) {
        fetchWorkflow(jobData.workFlowId);
      }
      setIsPosted(!!jobData.visibility);
    } catch (err) {
      console.error("Error fetching job details:", err);
    }
  };
  const fetchTemplate = async (id) => {
    try {
      const res = await axios.get(`/template/job/${id}`);
      if (Array.isArray(res.data)) {
        setWorkflowStages(res.data.map((stage) => stage.StageName));
      }
    } catch (err) {
      console.error("Error in fetching template data", err);
    }
  };
  const fetchWorkflow = (id) => {
    // axios
    //   .get(`/workFlow/job/${id}`)
    //   .then((res) => {
    //     if (Array.isArray(res.data)) {
    //       setWorkflowStages(res.data.map((stage) => stage.StageName));
    //     }
    //   })
    //   .catch((err) => console.error("Error fetching workflow stages:", err));
  };
  const getPortal = async () => {
    try {
      const res = await axios.get("/portal");
      const portal = res.data;
      // const portalNames = portal.map((p) => p.Name);
      const initialForm = portal.map((p) => ({
        id: p.id,
        name: p.Name,
        postDate: "",
        expiryDate: "",
        postOption: "",
      }));
      setFormData(initialForm);

      setOptions(portal);
    } catch (err) {
      console.error("failed to get portal", err);
    }
  };
  const handleFormChange = (index, field, value) => {
    const updatedForm = [...formData];
    updatedForm[index][field] = value;
    setFormData(updatedForm);
  };
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);

    try {
      await axios.patch(`/job/status/${id}`, {
        status: newStatus,
      });
      toast.success("Status updated successfully");
      fetchJobDetails(); // Refresh to reflect updated status
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Failed to update status");
    }
  };
  const handleSubmit = () => {
     if (!Array.isArray(formData) || formData.length === 0) {
          toast.error("Please fill in at least one post option.");
          return;
        }
        let hasAtLeastOneValidRow = false;
    
        for (let i = 0; i < formData.length; i++) {
          const { postDate, expiryDate, postOption } = formData[i];
    
          const isAnyFilled = postDate || expiryDate || postOption;
    
          if (isAnyFilled) {
            if (!postDate || !expiryDate || !postOption) {
              toast.error(`Please complete all fields for row ${i + 1}`);
              return;
            }
            hasAtLeastOneValidRow = true;
          }
        }
        if (!hasAtLeastOneValidRow) {
          toast.error("Please complete at least one option to post.");
          return;
        }
        // Submit only fully filled rows
        const filteredFormData = formData.filter(
          (f) => f.postDate && f.expiryDate && f.postOption
        );
    const jobVisibilityData = {
      jobId: selectedJobId,
      formData:filteredFormData,
    };
    axios
      .post(`/job/visibility/${id}`, jobVisibilityData)
      .then((res) => {
        toast.success("Job posted successfully!");
        setIsPosted(true);
        clearFunction();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to post job.");
      });
  };
  const handleUnpost = async () => {
    try {
      await axios.put(`/job/unpost/${id}`);
      toast.success("Job unposted");
      clearFunction();
    } catch (err) {
      console.error("Error unposting job", err);
    }
  };
  const deleteJob = async (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await axios.delete(`/job/${id}`);
        toast.success("Job deleted successfully");
        fetchJobDetails();
      } catch (err) {
        console.error("Error deleting Job:", err);
        toast.error("Failed to delete Job");
      }
    }
  };
  const clearFunction = () => {
    setPopup(false);
    fetchJobDetails();
  };
  const handleback = () => {
    navigate(-1);
  };
  const getDynamicField = (formValues, keywords) => {
    return (
      Object.entries(formValues || {}).find(([label]) =>
        keywords.some((keyword) => new RegExp(keyword, "i").test(label))
      )?.[1] || "Not provided"
    );
  };
  const formValues = job.formValues || {};
  const companyName = job.companyName || "No Company";
  const experience = formValues["Experience"] || "N/A";
  const jobTitle = getDynamicField(formValues, [
    "title",
    "job title",
    "position",
  ]);
  const location = getDynamicField(formValues, [
    "location",
    "place",
    "job location",
  ]);
  const workMode = getDynamicField(formValues, [
    "mode",
    "work mode",
    "job type",
    "remote",
    "onsite",
    "hybrid",
  ]);
  useEffect(() => {
    fetchJobDetails();
    getPortal();
  }, []);

  return (
    <div className="container">
      <Navbar />
      <div className="admin-container  ">
        <div className="h10 df al jcsb  ">
          <div className="df al g10">
            <IoArrowBackCircle
              onClick={handleback}
              size={24}
              className="cursor-pointer ml10"
            />
            <span>
              Job ID:<strong>2X0{job.id}</strong>
            </span>
          </div>
          <div className=" w30 df mr10 jcsb al g10">
            <div className="status-dropdown w20  ">
              <label htmlFor="status">
                <strong>Status:</strong>
              </label>
              <select
                id="status"
                value={selectedStatus}
                onChange={handleStatusChange}
                className="w15 "
              >
                <option value="">Please Select</option>
                {workflowStages.map((stage, idx) => (
                  <option key={idx} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>
            <div className="w8  df jcsb">
              <FaUser
                size={18}
                color="blue"
                className="cursor-pointer"
                onClick={() => navigate(`/applicants/job/${id}`)}
              />
              <FaEdit
                onClick={() => navigate(`/Job/${job.id}`)}
                size={20}
                color="blue"
                className="cursor-pointer"
              />
              {role !== "recruiter" &&(
                <MdDeleteForever
                onClick={() => deleteJob(job.id)}
                size={20}
                color="red"
                className="cursor-pointer"
              />
              )}
            </div>
          </div>
        </div>
        <div className="h15 job-detail df al jcsb ml10 w99 mr10  ">
          <div className="ml10  h90  df fdc jcsa">
            <h2>{jobTitle}</h2>

            <p>
              <span className="highlight">{companyName}</span>
            </p>
            <p className="details">
              <FaBriefcase /> {experience} | <MdOutlineAvTimer />
              {workMode} | <IoLocationOutline />
              {typeof location === "object" && location !== null
                ? location.display || "N/A"
                : location || "N/A"}
            </p>
          </div>
          <div className="w8 h100 df jcsa al">
            <span
              title={job.visibility ? "Unpost this job" : "Post this job"}
            ></span>
            <div className="w8  df al fdc">
              <button
                className={`p-btn ${job.visibility ? "orange" : "green"}`}
                onClick={() => setPopup(true)}
              >
                {job.visibility ? "Unpost" : "Post"}
              </button>
            </div>
          </div>
        </div>
        <div className="job-detail h60 ml10 mt10 mr10  ">
          {Object.keys(formValues).length > 0 && (
            <div className="admin-job-section">
              {/* <h4>Dynamic Fields</h4> */}
              <div className="form-value-list">
                {Object.entries(formValues)
                  .filter(([label]) => {
                    const keywordsToExclude = [
                      "title",
                      "job title",
                      "experience",
                      "location",
                      "place",
                      "job location",
                      "work type",
                      "job type",
                      "employment type",
                      "mode",
                      "work mode",
                      "remote",
                      "onsite",
                      "hybrid",
                      "company",
                    ];
                    return !keywordsToExclude.some((keyword) =>
                      new RegExp(keyword, "i").test(label)
                    );
                  })
                  .map(([label, value]) => (
                    <div key={label} className="form-value-item">
                      <span className="form-label">
                        <strong>{label}:</strong>
                      </span>
                      <pre className="form-value">
                        {value || <em>Not provided</em>}
                      </pre>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {popup && (
        <div className="test df al jc">
          <div className="post-box df jcsb al fdc">
            <div className="w90 df fdc  mt20 g10">
              {job.visibility ? <h3>Job Unpost</h3> : <h3>Job Post</h3>}

              <div className="df fdc w100 g10">
                {" "}
                {formData.map((entry, index) => (
                  <div key={entry.id} className="df fdr w100 g10 al">
                    {" "}
                    <label className="input fdc mt10">
                      Post Date:
                      <input
                        type="date"
                        value={entry.postDate}
                        min={today}
                        onChange={(e) =>
                          handleFormChange(index, "postDate", e.target.value)
                        }
                      />
                    </label>
                    <label className="input fdc mt10">
                      Expiry Date:
                      <input
                        type="date"
                        value={entry.expiryDate}
                        min={today}
                        onChange={(e) =>
                          handleFormChange(index, "expiryDate", e.target.value)
                        }
                      />
                    </label>
                    <label className="input fdc mt10">
                      Post Option:
                      <select
                        value={entry.postOption}
                        onChange={(e) =>
                          handleFormChange(index, "postOption", e.target.value)
                        }
                      >
                        <option value="">Select Option</option>
                         {options.map((opt) => {
                          const isUsedElsewhere = formData.some(
                            (item, i) =>
                              i !== index && item.postOption === opt.Name
                          );
                          return (
                            <option
                              key={opt.id}
                              value={opt.Name}
                              disabled={isUsedElsewhere}
                            >
                              {opt.Name}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="box-border w100 df jce ae g10 mb20">
              <button
                type="button"
                className="gray s-btn mr10"
                onClick={clearFunction}
              >
                Cancel
              </button>
              {isPosted ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleUnpost(job.id)}
                    className="orange s-btn mr30"
                  >
                    Unpost
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="b s-btn mr30"
                >
                  Post
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobDetails;
