import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import "../Job/JobList.css";
import "./AdminPage.css";
import Navbar from "../admin/Navbar";

function Applicants() {
  // const {slug} = useParams();
  const [applicants, setApplicants] = useState([]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const path = window.location.pathname;
  const segments = path.split('/'); 
  const postSegment = segments[1];
  
  const filteredApplicants = applicants.filter((applicant) =>
    `${applicant.firstname} ${applicant.lastname} ${applicant.email} ${applicant.ph_no} ${applicant.skills}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );
  const fetchApplicants = async () => {
    try {
      const res = await axios.get(`/user/${postSegment}`);
      setApplicants(res.data);
    } catch (err) {
      console.error("Failed to fetch applicants:", err);
      toast.error("Error fetching applicants");
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
  }, [postSegment]);

  return (
    <div className="container">
      <Navbar />
      <div className="admin-container">
        <div className="df h10 al jcsb ">
          <h3 className="job-heading mt15 ml10">All {postSegment}</h3>
          <input
            type="text"
            placeholder="Search applicants..."
            value={searchTerm}
            className="mr10"
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "6px", width: "250px" }}
          />
        </div>
          <table className="job-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Applicant ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.length > 0 ? (
                filteredApplicants.map((applicant, index) => (
                  <tr
                    key={applicant.id}
                    onClick={(e) => handleRowClick(e, applicant.id)}
                    className="cursor-pointer hover"
                  >
                    <td>{index + 1}</td>
                    <td>{applicant.user_id}</td>
                    <td>
                      {applicant.firstname} {applicant.lastname}
                    </td>
                    <td>{applicant.email}</td>
                    <td>{applicant.ph_no}</td>
                    <td data-no-nav>
                      <Link
                        to={`/applicants/${applicant.id}`}
                        state={{ from: "all" }}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No applicants found</td>
                </tr>
              )}
            </tbody>
          </table>
      </div>
    </div>
  );
}

export default Applicants;
