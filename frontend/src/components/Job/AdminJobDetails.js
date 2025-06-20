import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineAvTimer, MdDeleteForever } from "react-icons/md";
import { IoArrowBackCircle } from "react-icons/io5";
import { FaBriefcase, FaEdit } from "react-icons/fa";
import "./AdminJobDetails.css";
import Navbar from "../admin/Navbar";

const AdminJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState({});
  // const [formValues, setFormValues] = useState({});
  const [popup, setPopup] = useState(false);
  const [postDate, setPostDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [postOption, setPostOption] = useState("");
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isPosted, setIsPosted] = useState(false);
  const [workflowStages, setWorkflowStages] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");

  const fetchJobDetails = async () => {
    try {
      const res = await axios.get(`/job/${id}`);
      const jobData = res.data;
      setJob(jobData);
      // Set dynamic fields (if any)
      // setFormValues(jobData.formValues || {});
      // console.log(jobData.formValues);

      // Format date helper
      const formatDate = (dateStr) =>
        dateStr ? new Date(dateStr).toISOString().slice(0, 10) : "";

      setPostDate(formatDate(jobData.postDate));
      setExpiryDate(formatDate(jobData.expiryDate));
      setPostOption(jobData.visibility || "");
      setIsPosted(!!jobData.visibility);
    } catch (err) {
      console.error("Error fetching job details:", err);
    }
  };
   const fetchWorkflow = () => {
    axios
      .get("/workFlow/job")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setWorkflowStages(res.data.map((stage) => stage.stageName));
        }
      })
      .catch((err) => console.error("Error fetching workflow stages:", err));
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
  const dateOnly = job.postDate?.slice(0, 10) || "N/A";
  const handleSubmit = () => {
    if (!postOption) {
      alert("Please select a post option before submitting.");
      return;
    }
    const jobVisibilityData = {
      jobId: selectedJobId,
      postDate,
      expiryDate,
      visibility: postOption,
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
    setExpiryDate("");
    setPostDate("");
    setPostOption("");
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
  const jobType = getDynamicField(formValues, [
    "work type",
    "job type",
    "employment type",
  ]);
  const workMode = getDynamicField(formValues, [
    "mode",
    "work mode",
    "remote",
    "onsite",
    "hybrid",
  ]);
  const salary = getDynamicField(formValues, [
    "salary",
    "pay",
    "income",
    "stipend",
  ]);
  useEffect(() => {
    fetchJobDetails();
    fetchWorkflow();
  }, []);

  return (
    <div className="container">
      <Navbar />
      <div className="admin-container  ">
        <div className="h10 df al jcsb  ">
          <IoArrowBackCircle
            onClick={handleback}
            size={24}
            className="cursor-pointer ml10"
          />
          <div className=" w30 df mr10 jcsb al g10">
             <div className="status-dropdown">
                <label htmlFor="status">
                  <strong>Status:</strong>
                </label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={handleStatusChange}
                >
                  {workflowStages.map((stage, idx) => (
                    <option key={idx} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>
            <FaEdit
              onClick={() => navigate(`/Job/${job.id}`)}
              size={20}
              color="blue"
              className="cursor-pointer"
            />
            <MdDeleteForever
              onClick={() => deleteJob(job.id)}
              size={20}
              color="red"
              className="cursor-pointer"
            />
          </div>
        </div>
        <div className="h15 job-detail df al jcsb ml10 w99 mr10 ">
          <div className="ml10">
            <h2>{jobTitle}</h2>
            <p>
              <span className="highlight">{companyName}</span>
            </p>
            <p className="details">
              <FaBriefcase /> {experience} | <MdOutlineAvTimer />
              {workMode} | <IoLocationOutline /> {location}
            </p>
          </div>
          <div className="w8 h100 df jcsa al">
            <span
              title={job.visibility ? "Unpost this job" : "Post this job"}
            ></span>
            <div className="w8  df al fdc">
              <span className="date">{dateOnly}</span>
              <button
                className={`p-btn ${job.visibility ? "gray" : "gray"}`}
                onClick={() => setPopup(true)}
              >
                {job.visibility ? "Post/Unpost" : "Post/Unpost"}
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
                      "position",
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
                      <span className="form-value">
                        {value || <em>Not provided</em>}
                      </span>
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
            <div className="w90 df fdc mt20 g10">
              {job.visibility ? <h3>Job Unpost</h3> : <h3>Job Post</h3>}

              <div className="df fdr w100 g10">
                <label className="input">
                  Post Date:
                  <input
                    type="date"
                    value={postDate}
                    onChange={(e) => setPostDate(e.target.value)}
                  />
                </label>

                <label className="input">
                  Expiry Date:
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </label>

                <label className="input">
                  Post Option:
                  <select
                    value={postOption}
                    onChange={(e) => setPostOption(e.target.value)}
                  >
                    <option value="">Select Option</option>
                    <option value="internal">Internal</option>
                    <option value="external">External</option>
                    <option value="internal-external">Internal-External</option>
                    <option value="agency">Agency</option>
                  </select>
                </label>
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
                    className="b s-btn mr30"
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
