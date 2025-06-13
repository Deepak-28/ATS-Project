import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaUsers, FaUser, FaEdit, FaHome, FaUserTie } from "react-icons/fa";
import { GoWorkflow } from "react-icons/go";
import { BiLogOutCircle } from "react-icons/bi";
import {
  MdDeleteForever,
  MdOutlineLibraryAdd,
  MdDashboard,
} from "react-icons/md";
import { TbLayoutGridAdd } from "react-icons/tb";

import "./JobList.css";
const JobList = () => {
  const { id } = useParams();
  const [company, setCompany] = useState({});
  const [jobs, setJobs] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [jobWorkflow, setJobWorkflow] = useState([]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const getcompany = async () => {
    const res = await axios.get(`/company/${id}`);
    setCompany(res.data);
  };
  const getJobs = async () => {
    try {
      const res = await axios.get(`/job/company/${id}`);
      setJobs(res.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };
  const deleteJob = async (id) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        await axios.delete(`/job/company/${id}`);
        alert("Company deleted successfully");
        getcompany(); // Optional: Only needed if you want to refresh the view after delete
      } catch (err) {
        console.error("Error deleting Company:", err);
        alert("Failed to delete Company");
      }
    }
  };
  const fetchJobWorkflow = async () => {
    try {
      const res = await axios.get("/workFlow/job");
      setJobWorkflow(res.data);
    } catch (err) {
      console.error("Failed to fetch workflow:", err);
    }
  };
  const handleStatusChange = async (jobId, newStatus) => {
  try {
    await axios.patch(`/job/status/${jobId}`, { status: newStatus });
    alert("Status updated.");
    getJobs(); // refresh updated job list
  } catch (err) {
    console.error("Failed to update status:", err);
    alert("Error updating status.");
  }
};


  useEffect(() => {
    getcompany();
    getJobs();
    fetchJobWorkflow();
  }, []);

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div
        className={`sidebar ${sidebarOpen ? "active" : ""}`}
        ref={sidebarRef}
      >
        <ul>
          <li className=" df al jcsb  ">
            <Link to="#">
              <GiHamburgerMenu onClick={toggleSidebar} />
            </Link>
            <span className="w100 ">Super Admin</span>
          </li>
          <li>
            <Link to="/superAdmin">
              <FaHome /> Home
            </Link>
          </li>
          <li>
            <Link to="/dashboard">
              <MdDashboard />
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/applicants">
              <FaUserTie />
              Applicants
            </Link>
          </li>
          <li>
            <Link to="/allUsers">
              <FaUsers /> Users
            </Link>
          </li>
          <li>
            <Link to="/alljobs">
              <FaEdit /> Jobs
            </Link>
          </li>
          <li>
            <Link to="/workFlow">
              <GoWorkflow /> Workflow
            </Link>
          </li>
          <li>
            <Link to="/fieldCreation">
              <TbLayoutGridAdd />
              Fields
            </Link>
          </li>
          <li>
            <Link to="/">
              <BiLogOutCircle />
              Logout
            </Link>
          </li>
        </ul>
      </div>

      {/* Content Area */}
      <div className="admin-container">
       <nav className="df h10 al">
          {!sidebarOpen && (
            <button className="menu-btn ">
              <GiHamburgerMenu onClick={toggleSidebar} className="menu_icon" />
            </button>
          )}
          <div className="df jcsb  al w100">
            <h2 className="logo w100">{company.name}</h2>
            <div className="c-btn">
              <Link to={`/addJob/${id}`}>
                <MdOutlineLibraryAdd size={24} className="g mr10" />
              </Link>
            </div>
          </div>
        </nav>

        <table className="job-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Job ID</th>
              <th>Title</th>
              <th>Experience</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, index) => (
              <tr key={job.id}>
                <td>{index + 1}</td>
                <td>{job.id}</td>
                <td>{job.jobTitle}</td>
                <td>{job.jobExperience} years</td>
                <td>{job.jobLocation}</td>
                <td>{job.status || 'NA'}</td>
                  {/* {" "}
                  <select className="dropdown"
                    value={job.status || ""}
                    onChange={(e) => handleStatusChange(job.id, e.target.value)}
                  >
                    <option value="" disabled>
                      Select status
                    </option>
                    {jobWorkflow.map((stage) => (
                      <option key={stage.id} value={stage.stageName}>
                        {stage.stageName}
                      </option>
                    ))}
                  </select> */}
                <td>
                  <div className="job-actions">
                    <Link to={`/applicants/job/${job.id}`}>
                      <FaUser />
                    </Link>
                    <Link
                      to={`/editJob/${job.id}/${id}`}
                      className="applied-link blue"
                    >
                      <FaEdit />
                    </Link>
                    <MdDeleteForever
                      className="applied-link"
                      color="red"
                      onClick={() => deleteJob(job.id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobList;
