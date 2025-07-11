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

  const fetchData = async () => {
    try {
      const res = await axios.get(`/application/applicantDetail/${id}/${jid}`);
      const { user, jobs, applications, candidateFields } = res.data;
      setUser(user);
      setJobs(jobs);
      // console.log(candidateFields);
      setCandidateInput(candidateFields);
      setApplicant(res.data);
      setSelectedStatus(applications.status);
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
      console.log("Error in Fetching WorkFlow", err);
    }
  };
  useEffect(() => {
    fetchData();
    fetchWorkflow();
    fetchJob();
  }, [id]);
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);

    try {
      await axios.patch(`/application/status/${id}/${jid}`, {
        status: newStatus,
      });
      toast.success("Status updated successfully");
      fetchData();
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Failed to update status");
    }
  };
  if (!applicant) return <p>Loading...</p>;

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
            onClick={() => navigate(backLink)}
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
              <div className="df jcsb al  h5  ">
                <h3>Applicant Details</h3>
                {/* <p>
                  <strong>Resume:</strong>{" "}
                  <button
                    onClick={() =>
                      window.open(
                        `http://localhost:7000/uploads/${user.resume}`,
                        "_blank"
                      )
                    }
                  >
                    View
                  </button>
                </p> */}
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
              {jid && (
                <div>
                  <h3>Update Status</h3>
                  <div className="status-dropdown mt10">
                    <label htmlFor="status">
                      <strong>Status:</strong>
                    </label>
                    <select
                      id="status"
                      value={selectedStatus}
                      onChange={handleStatusChange}
                    >
                      <option value="">Update Status</option>
                      {workflowStages.map((stage, idx) => (
                        <option key={idx} value={stage.StageName}>
                          {stage.StageName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div className="b-card">
              <h3>Candidate Form Fields</h3>
              {candidateInput.length > 0 ? (
                <div className="candidate-fields">
                  {candidateInput.map((field, idx) => (
                    <p key={idx}>
                      <strong>{field.label}:</strong>{" "}
                      {field.type === "file" && field.value ? (
                        <button
                          onClick={() =>
                            window.open(
                              `http://localhost:7000/uploads/${field.value}`,
                              "_blank"
                            )
                          }
                        >
                          View File
                        </button>
                      ) : (
                        field.value || "Not provided"
                      )}
                    </p>
                  ))}
                </div>
              ) : (
                <p>No candidate fields found.</p>
              )}
            </div>

            <div className="b-card"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicantDetail;
