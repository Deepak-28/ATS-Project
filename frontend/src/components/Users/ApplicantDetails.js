import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { IoMdArrowRoundBack } from "react-icons/io";
import Navbar from "../admin/Navbar";
import "./ApplicantDetails.css";

function ApplicantDetail() {
  const { jid, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState(null);
  const [workflowStages, setWorkflowStages] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [jobs, setJob] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [user, setUser] = useState([]);
  const [job, setJobs] = useState([]);
  const [candidateInput, setCandidateInput] = useState([]);
  const [candidateStatus, setCandidateStatus] = useState([]);

  const fetchData = async () => {
    try {
      let res;
      if (!jid) {
        res = await axios.get(`application/applicantStatus/${id}`);
        const { userData, status } = res.data;
        setUser(userData);
        setCandidateStatus(status);
      } else {
        res = await axios.get(`/application/applicantDetail/${id}/${jid}`);
        const { user, jobs, applications, candidateFields } = res.data;
        setUser(user);
        setJobs(jobs);
        setCandidateInput(candidateFields);
        setApplicant(res.data);
        const currentApp = applications.find(
          (app) => String(app.jobId) === String(jid)
        );
        setSelectedStatus(currentApp?.status || "");
      }
    } catch (err) {
      console.error("Error loading applicant:", err);
    }
  };
  const fetchJob = async () => {
    try {
      const res = await axios.get(`/job/${jid}`);
      const jobData = res.data;
      setJob(jobData);
      setFormValues(jobData.formValues);
    } catch (error) {
      console.error("failed to fetch job", error);
    }
  };
  const getDynamicField = (formValues, keywords) => {
    return (
      Object.entries(formValues || {}).find(([label]) =>
        keywords.some((keyword) => new RegExp(keyword, "i").test(label))
      )?.[1] || "Not provided"
    );
  };
  const jobTitle = getDynamicField(formValues, [
    "title",
    "job title",
    "position",
  ]);
  const fetchWorkflow = async () => {
    try {
      const res = await axios.get(`/template/candidate/${jid}`);
      setWorkflowStages(res.data);
    } catch (err) {
      console.error("Error in Fetching WorkFlow", err);
    }
  };
  useEffect(() => {
    fetchData();
    if (jid) {
      fetchJob();
      fetchWorkflow();
    }
  }, [id]);
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);

    try {
      await axios.patch(`/application/status/${id}/${jid}`, {
        status: newStatus,
      });
      toast.success("Status updated successfully");
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Failed to update status");
    }
    fetchData();
  };
 
  const from = location?.state?.from || "";
  const jobId = location?.state?.jobId || applicant?.job?.id || "";
  const backLink =
    from === "job" && jobId ? `/applicants/job/${jobId}` : "/applicants";

  return (
    <div className="container">
      <Navbar />
      <div className="admin-container h100">
        <div className="h8 df al ml10">
          <IoMdArrowRoundBack
            onClick={() => navigate(-1)}
            size={18}
            className="cursor-pointer"
          />
          {jid && (
            <div className="h8 df al jcsb w30 ml20">
              <p>
                <strong>Job ID:</strong> 2X0{jid}
              </p>
              <p>
                <strong>Applied for:</strong> {jobTitle}
              </p>
            </div>
          )}
        </div>
        <div className="df jcsa">
          <div className="applicant-detail-container">
            <div className="applicant-card">
              <div className="df al jc h4 w100  ">
                <h3>User Information</h3>
              </div>
              <p>
                <strong>Name:</strong> {user.firstname} {user.lastname}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Phone:</strong> {user.ph_no}
              </p>
              <p>
                <strong>Location:</strong> {user.city}, {user.country}
              </p>
            </div>

            <div className="applicant-card">
              {jid ? (
                <div className="df fdc w100 jc al">
                  <h3>Update Status</h3>
                  <div className="status-dropdown w100 mt10">
                    <label htmlFor="status">
                      <strong>Status:</strong>
                    </label>
                    <select
                      id="status"
                      value={selectedStatus}
                      onChange={handleStatusChange}
                    >
                      <option value="">Please Select</option>
                      {workflowStages.map((stage, idx) => (
                        <option key={idx} value={stage.StageName}>
                          {stage.StageName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="df fdc g5 al">
                  <h3>Applied Job Status</h3>
                  {candidateStatus.map((app, index) => (
                    <div key={index} className="df fdr al g5 w100 ">
                      <strong>{index + 1}.</strong>&nbsp;
                      <strong>Job ID:</strong>{" "}
                      {`2X${String(app.jobId).padStart(2, "0")}`} &nbsp;
                      <strong>Status:</strong> {app.status}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="b-card">
              {jid && (
                <div className="df al fdc g10 w100">
                  <h3>Candidate Information</h3>

                  {candidateInput.length > 0 ? (
                    <div className="candidate-fields w100">
                      {candidateInput.map((field, idx) => {
                        if (field.type === "file") return null;

                        if (field.type === "header") {
                          return (
                            <h3 key={idx} style={{ color: "blue" }}>
                              {field.label}
                            </h3>
                          );
                        }
                        if (field.type === "label") {
                          return (
                            <p key={idx}>
                              <strong>{field.label}</strong>
                            </p>
                          );
                        }

                        return (
                          <p key={idx}>
                            <strong>{field.label}:</strong>{" "}
                            {field.value || "Not provided"}
                          </p>
                        );
                      })}
                    </div>
                  ) : (
                    <p>No candidate fields found.</p>
                  )}
                </div>
              )}
            </div>
            <div className="b-card ">
              {jid && (
                <div className="df al fdc g10 w100">
                  <h3>Candidate Files</h3>
                  {candidateInput.length > 0 ? (
                    <div className="candidate-fields w100">
                      {candidateInput
                        .filter((field) => field.type === "file")
                        .map((field, idx) => (
                          <p key={idx}>
                            <strong>{field.label}:</strong>{" "}
                            {field.value ? (
                              <button
                                onClick={() =>
                                  window.open(
                                    `${process.env.REACT_APP_BASE_URL}/uploads/${field.value}`,
                                    "_blank"
                                  )
                                }
                              >
                                View File
                              </button>
                            ) : (
                              "Not provided"
                            )}
                          </p>
                        ))}
                    </div>
                  ) : (
                    <p>No candidate fields found.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicantDetail;
