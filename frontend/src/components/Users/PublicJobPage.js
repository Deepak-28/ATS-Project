import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { FaBriefcase, FaRegUserCircle } from "react-icons/fa";
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
  const [showPopup, setShowPopup] = useState(false);
  const [data, setData] = useState(false);
  const [isRegister, setIsRegister] = useState(true);
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const candidateId = localStorage.getItem("candidateId");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const email = localStorage.getItem("email");
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
  const filterJobs = () => {
    const lowerSearch = searchText.toLowerCase();
    const lowerLocation = locationFilter.toLowerCase();
    const lowerType = typeFilter.toLowerCase();

    const results = jobs.filter((job) => {
      const form = job.formValues || {};
      const title = getDynamicField(form, ["title", "job title", "position"]);
      const location = getDynamicField(form, [
        "location",
        "place",
        "job location",
      ]);
      const type = getDynamicField(form, [
        "work type",
        "job type",
        "employment type",
      ]);

      const matchSearch =
        !lowerSearch || title.toLowerCase().includes(lowerSearch);
      const matchLocation =
        !lowerLocation || location.toLowerCase().includes(lowerLocation);
      const matchType = !lowerType || type.toLowerCase().includes(lowerType);

      return matchSearch && matchLocation && matchType;
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
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError("");
  };
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("/login/check", formData);
      const token = res.data.token;
      // Store token
      localStorage.setItem("candidate_token", token);
      // Decode token
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const { role, candidateId, cid, email } = decoded;

      if (cid) localStorage.setItem("cid", cid);
      if (candidateId) localStorage.setItem("candidateId", candidateId);
      if (email) localStorage.setItem("email", email);

      //   if (role === "candidate") {
      //     if (jid) {

      //     navigate(`/application/${slug}/${jid}/${candidateId}`);
      //   } else {
      //     navigate(`/careers/${slug}`);
      //   }
      // } else {
      //   // Not a candidate (fallback)
      //   navigate("/unauthorized");
      // }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password.");
    }
  };
  const handleSignin = () => {
    navigate(`/login/${slug}?mode=login`);
  };
  const handleSignUp = () => {
    navigate(`/login/${slug}?mode=register`);
  };
  const handleCandidateLogout = () => {
    localStorage.removeItem("candidate_token");
    localStorage.removeItem("candidateId");
    localStorage.removeItem("cid");
    setShowPopup(false);
    navigate(`/careers/${slug}`);
  };
  useEffect(() => {
    getJobs();
  }, [slug]);
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    filterJobs();
  }, [searchText, locationFilter, typeFilter, jobs]);

  return (
    <div className="public-page-container">
      {/* Top Nav */}
      <div className="top-nav">
        <img src="/logo.png" alt="logo" className="logo" />
        {candidateId ? (
          <div className="df al fdr g10">
            <button className="b s-btn">Applied Jobs</button>
            <div className="nav-icon df al mr10 ">
              <FaRegUserCircle
                className="cursor-pointer"
                onClick={() => setShowPopup(!showPopup)}
              />
            </div>
          </div>
        ) : (
          <div className="w13 df jcsb mr10">
            <button className="s-btn b" onClick={handleSignin}>
              Sign In
            </button>
            <button className="s-btn b" onClick={handleSignUp}>
              Sign Up
            </button>
          </div>
        )}
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
      <div className="job-listings ">
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
            const salary = getDynamicField(job.formValues, [
              "salary",
              "pay",
              "income",
              "stipend",
            ]);

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
      {showPopup && (
        <div className="popup df fdc jcsb f13" ref={popupRef}>
          <div className="">
            <div className="w100 df al ">
              <div className="h10 w5 df al jc ">
                <label htmlFor="profile">
                  {" "}
                  <Link to={`/profile/${candidateId}`}>
                    <FaRegUserCircle size={30} className="cursor-pointer" />
                  </Link>
                </label>
                {/* <input
                  type="file"
                  id="profile"
                  accept="image/*"
                  style={{ display: "none" }}
                /> */}
                {/* onChange={handleImageUpload} */}
              </div>
              <div className=" ">
                {/* {role} */}
                <p>{email || "Email not found"}</p>
              </div>
            </div>
          </div>
          <div>
            {/* <p>View Status</p> */}
            {/* <p>Update Profile</p> */}
          </div>

          <div className="df al w100   jc">
            <button className="s-btn r" onClick={handleCandidateLogout}>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicJobPage;
