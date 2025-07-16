import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaUser, FaEdit, FaHome } from "react-icons/fa";
import { GoWorkflow } from "react-icons/go";
import { BiLogOutCircle } from "react-icons/bi";
import { MdDeleteForever, MdOutlineLibraryAdd } from "react-icons/md";
import { TbListSearch } from "react-icons/tb";
import { IoCreate } from "react-icons/io5";

import "../Job/JobList.css";
import Navbar from "../admin/Navbar";

function CompanyUser() {
  {
    const { uid, cid } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState({});
    const [jobs, setJobs] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    const getCompany = async () => {
      try {
        const res = await axios.get(`/company/${cid}`);
        setCompany(res.data);
      } catch (error) {
        console.error("Error fetching company:", error);
      }
    };

    const getJobsByCompany = async () => {
      try {
        const res = await axios.get(`/job/company/${cid}`);
        // console.log(res.data);

        setJobs(res.data);
        // console.log(jobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
    const deleteCompany = async (id) => {
      if (window.confirm("Are you sure you want to delete this company?")) {
        try {
          await axios.delete(`/job/company/${id}`);
          toast.success("Job deleted successfully");
          getJobsByCompany();
        } catch (err) {
          console.error("Error deleting Job:", err);
          toast.error("Failed to delete Job");
        }
      }
    };

    useEffect(() => {
      getCompany();
      getJobsByCompany();
    }, []);

    return (
      <div className="container">
        <Navbar/>
        {/* Sidebar */}
      

        {/* Content Area */}
        <div className="admin-container">
          <nav className="navbar">
            {!sidebarOpen && (
              <button className="menu-btn">
                <GiHamburgerMenu
                  onClick={toggleSidebar}
                  className="menu_icon"
                />
              </button>
            )}
            <div className="df jcsb al  w100">
              <h2 className="job-heading mt15">{company.name}</h2>
              <div className="c-btn">
                <Link to={`/addJob/${cid}`}>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length > 0 ? (
                jobs.map((job, index) => (
                  <tr key={job.id}>
                    <td>{index + 1}</td>
                    <td>{job.id}</td>
                    <td>{job.jobTitle}</td>
                    <td>{job.jobExperience || "-"} years</td>
                    <td>{job.jobLocation}</td>
                    <td>
                      <div className="job-actions">
                        {/* <Link to={`/jobs/${job.id}`} className="applied-link"><TbListSearch /></Link> */}
                        <Link
                          to={`/editJob/${job.id}/${cid}`}
                          className="applied-link blue"
                        >
                          <FaEdit />
                        </Link>
                        <MdDeleteForever
                          className="applied-link "
                          color="red"
                          onClick={() => deleteCompany(job.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No jobs found for this company.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default CompanyUser;
