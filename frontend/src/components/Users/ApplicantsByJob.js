import React, { useEffect, useRef, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ApplicantsByJob.css";
import Navbar from "../admin/Navbar";

function ApplicantsByJob() {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from || "admin"; // default to admin

  const fetchApplicants = async () => {
    try {
      const res = await axios.get(`/application/job/${jobId}`);
      setApplicants(res.data);
    } catch (err) {
      console.error("Failed to fetch applicants:", err);
    }
  };
  const handleBack = () => {
    if (from === "superadmin") {
      navigate("/superadmin");
    } else {
      navigate(-1); // or navigate(`/admin/${cid}`) if you need more control
    }
  };
 const handleRowClick = (e, id) => {
  // If the clicked element (or its parent) has data-no-nav, don't navigate
  const isActionClick = e.target.closest("[data-no-nav]");
  if (isActionClick) return;

  navigate(`/applicants/${id}`);
};
  useEffect(() => {
    fetchApplicants();
  });

  if (applicants.length === 0) return <p>No applicants found for this job.</p>;

  return (
    <div className="container">
      <Navbar/>
      <div className="admin-container">
        <nav className="df h10 al">
          <h2 className="ml10 w100">Job Applicants</h2>
        </nav>
        <table className="job-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Applicant ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Applied On</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((app, index) => (
              <tr key={app.id} onClick={(e) => handleRowClick(e, app.candidateId)}
               className="cursor-pointer hover">
                <td>{index + 1}</td>
                <td>{app.user.user_id}</td>
                <td>
                  {app.user.firstname} {app.user.lastname}
                </td>
                <td>{app.user.email}</td>
                <td>{app.status}</td>
                <td>
                  {app.createdAt
                    ? new Date(app.createdAt).toLocaleDateString()
                    : "N/A"}
                </td>
                <td data-no-nav>
                  <Link
                    to={`/applicants/${app.candidateId}`}
                    state={{ from: "job", jobId }}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ApplicantsByJob;
