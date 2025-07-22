import { Link, useNavigate, useParams } from "react-router-dom";
import "./AdminPage.css";
import axios from "axios";
import { useState, useEffect } from "react";

const UserPage = () => {
  const { candidateId } = useParams();
  const [candidate, setCandidate] = useState({});
  const [jobs, setJobs] = useState([]);
  const [fieldValues, setFieldValues] = useState([]);
  const [fields, setFields] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const jobsPerPage = 7;

  const getJobs = async () => {
    try {
      const res = await axios.get("/job/data");
      setJobs(res.data.getjobs);
      // setFieldValues(res.data.getjobs.formValues);
      // setFields(res.data.fields);

    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };
  const getUser = async () => {
    try {
      const res = await axios.get(`/user/${candidateId}`);
      setCandidate(res.data);
    } catch (err) {
      console.error("Error in Fetching the user", err);
    }
  };
  useEffect(() => {
    getJobs();
    getUser();
  }, []);

  const handleLogout = () => {
    navigate("/");
  };

  // Pagination logic
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  return (
    <div className="ud-container">
      <div className="user-dashboard-container">
        <nav className="ud-navbar">
          <h3 className="ud-logo">
            {" "}
            Welcome ! {candidate.firstname} {candidate.lastname}
          </h3>
          <button className="ud-logout-button" onClick={handleLogout}>
            Logout
          </button>
        </nav>

        <div className="ud-section">
          <div className="ud-section-header">
            <h3>All Jobs</h3>
          </div>

          <div className="ud-job-header">
            <p>Title</p>
            <p>Experience</p>
            <p>Company</p>
            <p>Action</p>
          </div>

          <div className="ud-job-list">
            {currentJobs.map((job, i) => (
              <div className="ud-job-card" key={i}>
                <span className="ud-job-title">{job.jobTitle}</span>
                <span className="ud-job-experience">
                  {fields.Experience}
                </span>
                <span className="ud-job-company">
                  {job.companyName} {job.jobLocation}
                </span>
                <div className="ud-job-actions">
                  <Link
                    to={`/job/${job.id}/${candidateId}`}
                    className="ud-applied-link"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="ud-pagination">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
