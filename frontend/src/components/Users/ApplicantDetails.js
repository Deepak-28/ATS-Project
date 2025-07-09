import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { IoMdArrowRoundBack } from "react-icons/io";
import Navbar from "../admin/Navbar";
import "./ApplicantDetails.css";

function ApplicantDetail() {
  const {jid, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState(null);
  const [workflowStages, setWorkflowStages] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");

  const fetchData = () => {
    axios
      .get(`/application/applicant/${id}`)
      .then((res) => {
        setApplicant(res.data);
        setSelectedStatus(res.data.application.status);
      })
      .catch((err) => console.error("Error loading applicant:", err));
  };

  const fetchWorkflow = async () => {
   try{
    const res = await axios.get(`/template/candidate/${jid}`);
    setWorkflowStages(res.data);
   }catch(err){
    console.log("Error in Fetching WorkFlow", err);
   }
  };

  useEffect(() => {
    fetchData();
    fetchWorkflow();
  }, [id]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);

    try {
      await axios.patch(`/application/status/${applicant.user.id}/${jobId}`, {
        status: newStatus,
      });
      toast.success("Status updated successfully");
      fetchData(); // Refresh to reflect updated status
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Failed to update status");
    }
  };

  if (!applicant) return <p>Loading...</p>;

  const { user, job, application } = applicant;
  const from = location.state?.from;
  const jobId = location.state?.jobId;
  const backLink =
    from === "job" && jobId ? `/applicants/job/${jobId}` : "/applicants";

  return (
    <div className="container">
      <Navbar />
      <div className="admin-container h100">
        <div className="h8 df al ml10">
          <IoMdArrowRoundBack onClick={() => navigate(backLink)} size={18} className="cursor-pointer"/>
          <div className="h8 df al jcsb w20 ml20">
            <p>
              <strong>Applied for:</strong> {job.jobTitle}
            </p>
            <p>
              <strong>Job ID:</strong> 2X0{job.id}
            </p>
          </div>
        </div>

        <div className="df jcsa">
          <div className="applicant-detail-container">
            <div className="applicant-card">
              <div className="df jcsb al  h5  ">
                <h3>Applicant Details</h3>
                 <p>
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
              </p>
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
              {/* <p><strong>Applied for:</strong> {job.jobTitle}</p> */}
              <p>
                <strong>Location:</strong> {user.city}, {user.country}
              </p>
              <p>
                {/* <strong>Experience:</strong> {job.jobExperience} years */}
              </p>
              {/* <p><strong>Company:</strong> {job.companyName || "N/A"}</p> */}
             
            </div>

            <div className="applicant-card">
              <h3>Update Status</h3>
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
                    <option key={idx} value={stage.StageName}>
                      {stage.StageName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="b-card"></div>
            <div className="b-card"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicantDetail;
