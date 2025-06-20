import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaBriefcase } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineAvTimer } from "react-icons/md";
import axios from "axios";
import "./PublicJobPage.css";

const PublicJobPage = () => {
  const { slug } = useParams();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const navigate = useNavigate();

  const getJobs = async () => {
    try {
      const res = await axios.get(`/job/slug/${slug}`);
      setJobs(res.data);
      setFilteredJobs(res.data); // initialize filteredJobs
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getJobs();
  }, [slug]);

  useEffect(() => {
    filterJobs();
  }, [searchText, locationFilter, typeFilter, jobs]);

  const filterJobs = () => {
    const lowerSearch = searchText.toLowerCase();
    const lowerLocation = locationFilter.toLowerCase();
    const lowerType = typeFilter.toLowerCase();

    const results = jobs.filter((job) => {
      const form = job.formValues || {};
      const title = form["Job-Title"] || job.jobTitle || "";
      const location = job.jobLocation || "";
      const type = job.jobType || "";

      return (
        title.toLowerCase().includes(lowerSearch) &&
        location.toLowerCase().includes(lowerLocation) &&
        type.toLowerCase().includes(lowerType)
      );
    });

    setFilteredJobs(results);
  };
  const getDynamicField = (formValues, keywords) => {
    return (
      Object.entries(formValues || {}).find(([label]) =>
        keywords.some((keyword) => new RegExp(keyword, "i").test(label))
      )?.[1] || "Not provided"
    );
  };
  const handleSignin = () =>{
    navigate('/login')
  }
  const handleSignUp = ()=>{
    navigate('/register')
  }
  return (
    <div className="public-page-container">
      {/* Top Nav */}
      <div className="top-nav">
        <img src="/logo.png" alt="logo" className="logo" />
        <div className="w13 df jcsb mr10">
          <button className="s-btn b" onClick={handleSignin} >Sign In</button>
          <button className="s-btn b" onClick={handleSignUp} >Sign Up</button>
        </div>
      </div>

      {/* Header */}
      <header className="public-header">
        <h2>Find Your Dream Job</h2>
        <p>
          Discover opportunities from top companies and take the next step in
          your career journey.
        </p>
      </header>

      {/* Search Bar */}
      <div className="w100 df jc">
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

          <div className="search-input">
            <span className="icon">
              <i className="fas fa-map-marker-alt"></i>
            </span>
            <input
              type="text"
              placeholder="Location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>

          <div className="search-input">
            <span className="icon">
              <i className="fas fa-briefcase"></i>
            </span>
            <input
              type="text"
              placeholder="All Types"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="job-listings">
        {loading ? (
          <p>Loading jobs...</p>
        ) : filteredJobs.length === 0 ? (
          <p>No jobs found matching your criteria.</p>
        ) : (
          filteredJobs.map((job, index) => {
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
            const salary = getDynamicField(job.formValues, ["salary", "pay", "income", "stipend"]);

            return (
              <div className="job-card" key={index}>
                <div className="job-info">
                  <h4>{jobTitle}</h4>
                  <p>{companyName}</p>
                  <p className="details">
                    <FaBriefcase /> {experience} &nbsp;|&nbsp;
                    <MdOutlineAvTimer /> {workMode} &nbsp;|&nbsp;
                    <IoLocationOutline /> {location}
                  </p>
                </div>
                <div className="df al">
                  <Link to={`/job/${slug}/${job.id}`}>
                  <button className="s-btn b">Apply</button>
                  </Link>
                  {/* onClick={navigate()} */}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PublicJobPage;
