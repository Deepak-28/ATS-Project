import { useParams, useNavigate } from "react-router-dom";
import "./JobDetails.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineAvTimer } from "react-icons/md";
import { FaBriefcase } from "react-icons/fa";

const JobDetails = () => {
  const { slug, jid } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchJobDetails = async () => {
    try {
      const res = await axios.get(`/job/${jid}`);
      setJob(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching job details:", err);
      setLoading(false);
    }
  };
  const getDynamicField = (formValues, keywords) => {
    return (
      Object.entries(formValues || {}).find(([label]) =>
        keywords.some((keyword) => new RegExp(keyword, "i").test(label))
      )?.[1] || "Not provided"
    );
  };
  const handleApply = () => {
    navigate(`/login/${jid}`);
  };
  const handleCancel = () => {
    navigate(-1);
  };
  useEffect(() => {
    fetchJobDetails();
  }, []);
  if (loading) {
    return <div className="job-details-container">Loading...</div>;
  }
  if (!job) {
    return <div className="job-details-container">Job not found.</div>;
  }

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

  return (
    <div className="job-details-container">
      <div className="top-nav">
        <img src="/logo.png" alt="logo" className="logo" />
        {/* <div className="w13 df jcsb mr10">
          <button className="s-btn b">Sign In</button>
          <button className="s-btn b">Sign Up</button>
        </div> */}
      </div>
  
        <div className="job-details ">
        <div className="job-details-header df jc fdc">
          <h2>{jobTitle}</h2>
          <p>
            <span className="highlight">{companyName}</span>
          </p>
          <p className="details">
            <FaBriefcase /> {experience} | <MdOutlineAvTimer /> {workMode} |{" "}
            <IoLocationOutline /> {location}
          </p>
        </div>
        <div className="job-details-body ">
          {Object.keys(formValues).length > 0 && (
            <div className="admin-job-section ">
              <div className="">
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
          <div className="df h10 al jce g10">
            <button className="s-btn gray" onClick={handleCancel}>
              Cancel
            </button>

            {!applied ? (
              <button className="s-btn b" onClick={handleApply}>
                Apply
              </button>
            ) : (
              <button className="s-btn b" disabled>
                Applied
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
