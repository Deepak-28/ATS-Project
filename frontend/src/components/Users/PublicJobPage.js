import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./PublicJobPage.css"; // Make sure to create this CSS

const PublicJobPage = () => {
  const { slug } = useParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const getJobs = async () => {
    try {
      const res = await axios.get(`/job/slug/${slug}`);
      console.log(res.data)
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getJobs();
  }, [slug]);

  return (
    <div className="public-page-container">
      <header className="public-header">
        <h2>Careers at {slug.replace(/-/g, " ").toUpperCase()}</h2>
        <p>Explore the latest opportunities and apply today.</p>
      </header>

      {loading ? (
        <p className="loading-text">Loading jobs...</p>
      ) : jobs.length > 0 ? (
        <div className="job-list-container">
          {jobs.map((job) => (
            <div className="job-card" key={job.id}>
              <h3>{job.jobTitle}</h3>
              <p><strong>Experience:</strong> {job.jobExperience} years</p>
              <p><strong>Location:</strong> {job.jobLocation}</p>
              <p><strong>Company:</strong> {job.companyName}</p>
              <a href={`/job/${slug}/${job.id}`} className="view-btn">
                view{/* <button className="s-btn">View Details</button> */}
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-jobs-text">No jobs available at the moment.</p>
      )}
    </div>
  );
};

export default PublicJobPage;
