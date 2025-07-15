import React, { useEffect, useState } from "react";
import { FaBriefcase } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineAvTimer } from "react-icons/md";
import TopNav from "../admin/TopNav";
import { useParams } from "react-router-dom";
import axios from "axios";

function Profile() {
  const { id } = useParams();
  const [jobs, setJobs] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const getDynamicField = (fieldsArray, keywords) => {
    return (
      (fieldsArray || []).find(({ label }) => {
        const normalizedLabel = label.toLowerCase().replace(/[^a-z]/g, "");
        return keywords.some((keyword) =>
          normalizedLabel.includes(keyword.toLowerCase().replace(/[^a-z]/g, ""))
        );
      })?.value || "Not provided"
    );
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(`/application/applicant/${id}`);
      const { jobs } = res.data;
      // console.log(res.data);

      setJobs(jobs);
      setFilteredJobs(jobs);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching job data", err);
    }
  };

  const filterJobs = () => {
    const lowerSearch = searchText.toLowerCase();
    const results = jobs.filter((job) => {
      const title = getDynamicField(job.fields, [
        "title",
        "job title",
        "position",
      ]);
      return !lowerSearch || title.toLowerCase().includes(lowerSearch);
    });
    setFilteredJobs(results);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchText, jobs]);

  return (
    <div className="public-page-container ">
      <TopNav />
      <div className="df fdc jc">
        <div className="public-header">
          <h2>My Job Applications</h2>
          <p>Track the status of your job applications</p>
        </div>

        <div className="w100 df al jc">
          <div className="search-bar">
            <div className="search-input">
              <span className="icon">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                placeholder="Search jobs or companies..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="job-listings">
          {loading ? (
            <p>Loading jobs...</p>
          ) : filteredJobs.length === 0 ? (
            <p>No jobs found matching your criteria.</p>
          ) : (
            filteredJobs.map((job, index) => {
              const formValues = job.fields || [];
              console.log("formValues:", formValues);
              const companyName = job.companyName || "No Company";
              const experience = getDynamicField(formValues, [
                "experience",
                "years",
              ]);
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
              const workMode = getDynamicField(formValues, [
                "mode",
                "work mode",
                "remote",
                "onsite",
                "hybrid",
                "job Type",
              ]);
              const salary = getDynamicField(formValues, [
                "salary",
                "pay",
                "income",
                "stipend",
              ]);
             
              return (
                <div className="job-card" key={index}>
                  <div className="job-info">
                    <h4>{jobTitle}</h4>
                    <p>
                      <strong>{companyName}</strong>
                    </p>
                    <p className="details">
                      <FaBriefcase /> {experience} &nbsp;|&nbsp;
                      <MdOutlineAvTimer /> {workMode} &nbsp;|&nbsp;
                      <IoLocationOutline /> {location}
                    </p>
                  </div>
                  <div>
                    <p className="status">
                      Status: <strong>{job.status}</strong>
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
