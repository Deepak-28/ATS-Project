import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Country, State, City } from "country-state-city";
import { FaBriefcase, FaRegUserCircle } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineAvTimer } from "react-icons/md";
import TopNav from "../admin/TopNav";
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
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const candidateId = localStorage.getItem("candidateId");
  const [authMode, setAuthMode] = useState(null);
  const countries = Country.getAllCountries();
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [data, setData] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const email = localStorage.getItem("email");
  const token = localStorage.getItem("candidate_token");

  const getJobs = async () => {
    try {
      const res = await axios.get(`/job/slug/${slug}`);
      setJobs(res.data);
      setFilteredJobs(res.data); 
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
  const handleInputChange = (e) => {
    setData(() => {
      const newData = { ...data, [e.target.id]: e.target.value };
      return newData;
    });
  };
  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    setSelectedCountry(countryCode);
    setData({ ...data, country: countryCode });
    setStates(State.getStatesOfCountry(countryCode));
    setCities([]);
    setSelectedState(null);
    setSelectedCity(null);
  };
  const handleStateChange = (e) => {
    const stateCode = e.target.value;
    setSelectedState(stateCode);
    setData({ ...data, state: stateCode });
    setCities(City.getCitiesOfState(selectedCountry, stateCode));
    setSelectedCity(null);
  };
  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
    setData({ ...data, city: e.target.value });
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
      const { candidateId, cid, email } = decoded;

      if (cid) localStorage.setItem("cid", cid);
      if (candidateId) localStorage.setItem("candidateId", candidateId);
      if (email) localStorage.setItem("email", email);
      else {
        // Not a candidate (fallback)
        navigate("/unauthorized");
      }
      setAuthMode(null)
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password.");
    }
  };
  const handleRegister = async () => {
    console.log(data);
    try {
      const res = await axios.post("/user", data);
      // console.log(res.data);
      navigate(-1);
    } catch (err) {
      console.log(err.response?.data || "Registration failed");
    }
  };

  const handleCancel = () => {
    navigate(-1);
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
      <TopNav setAuthMode={setAuthMode} />
      <div className="job-details-wrapper">
        <div className="job-details">
          <header className="public-header">
            <h2>Find Your Dream Job</h2>
            <p>
              Discover opportunities from top companies and take the next step
              in your career journey.
            </p>
          </header>
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
                      <p>
                        <strong>{companyName}</strong>
                      </p>
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

        {authMode && (
          <div className="auth-card slide-in">
            <button onClick={() => setAuthMode(null)} className="jd-close-btn">
              ✖
            </button>

            {authMode === "signin" && !isRegister ? (
              <form onSubmit={submit}>
                <div className="login-header">
                  <div className="logo-container">
                    <img src="/logo.png" alt="logo" className="logo" />
                  </div>
                  <div className="input-box">
                    <input
                      type="email"
                      id="email"
                      placeholder="Email"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="input-box">
                    <input
                      type="password"
                      id="password"
                      placeholder="Password"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {error && <p className="error-text">{error}</p>}
                  <div className="remember-forget">
                    <div className="rem-box">
                      <input
                        type="checkbox"
                        id="remember"
                        className="remember"
                      />
                      <label>Remember me</label>
                    </div>
                    <div className="forgot-link">
                      <Link to={"/forgetPassword"}>Forgot Password?</Link>
                    </div>
                  </div>
                  <button className="b btn mt20" type="submit">
                    Login
                  </button>
                  <div className="register-link mt10">
                    <p className="switch-form">
                      Don’t have an account?{" "}
                      <span
                        className="link"
                        onClick={() => setIsRegister(true)}
                      >
                        Register
                      </span>
                    </p>
                  </div>
                </div>
              </form>
            ) : (
              <div className="register-header">
                <div className="df fdc al">
                  <h3>Register Here</h3>
                  <div>
                    <div className="input-box">
                      <input
                        type="text"
                        id="firstname"
                        placeholder="First Name"
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="input-box">
                      <input
                        type="text"
                        id="lastname"
                        placeholder="Last Name"
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="input-box">
                      <input
                        type="email"
                        id="email"
                        placeholder="Email"
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="input-box">
                      <input
                        type="number"
                        id="ph_no"
                        placeholder="Phone Number"
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="address-box">
                      <textarea
                        id="address"
                        placeholder="Address"
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="input-box">
                      <select
                        value={selectedCountry || ""}
                        onChange={handleCountryChange}
                        className="job-type"
                        id="country"
                      >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country.isoCode} value={country.isoCode}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="input-box">
                      <select
                        value={selectedState || ""}
                        onChange={handleStateChange}
                        disabled={!selectedCountry}
                        className="job-type"
                        id="state"
                      >
                        <option value="">Select State</option>
                        {states.map((state) => (
                          <option key={state.isoCode} value={state.isoCode}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="input-box">
                      <select
                        value={selectedCity || ""}
                        onChange={handleCityChange}
                        disabled={!selectedState}
                        className="job-type"
                        id="city"
                      >
                        <option value="">Select City</option>
                        {cities.map((city) => (
                          <option key={city.name} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="input-box">
                      <input
                        type="password"
                        id="password"
                        placeholder="Password"
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="input-box">
                      <input
                        type="password"
                        id="confirmPassword"
                        placeholder="Confirm Password"
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="df al fdc">
                    <button
                      className="b btn "
                      type="button"
                      onClick={handleRegister}
                    >
                      Submit
                    </button>
                    <p className="toggle-form">
                      Already have an account?{" "}
                      <span
                        className="link"
                        onClick={() => setIsRegister(false)}
                      >
                        Login
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
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
