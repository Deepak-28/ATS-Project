import { useParams, Link,useNavigate } from "react-router-dom";
import TopNav from "../admin/TopNav";
import "./JobDetails.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineAvTimer } from "react-icons/md";
import { FaBriefcase } from "react-icons/fa";
import { Country, State, City } from "country-state-city";

const JobDetails = () => {
  const { slug, jid } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState(null);
  const countries = Country.getAllCountries();
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [data, setData] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const token = localStorage.getItem("candidate_token");
  const candidateId = localStorage.getItem("candidateId");

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
  const fetchApplicantStatus = async () => {
    try {
      const res = await axios.get(`/application/status/${candidateId}/${jid}`);
      setApplied(res.data);
    } catch (err) {
      console.error("Error getting Status", err);
    }
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
      const { role, candidateId, cid, email, name } = decoded;

      if (cid) localStorage.setItem("cid", cid);
      if (candidateId) localStorage.setItem("candidateId", candidateId);
      if (email) localStorage.setItem("email", email);
      if (name) localStorage.setItem("name", name);
      if (role === "candidate") {
        if (jid) {
          navigate(`/application/${slug}/${jid}/${candidateId}`);
        } else {
          navigate(`/careers/${slug}`);
        }
      } else {
        // Not a candidate (fallback)
        navigate("/unauthorized");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password.");
    }
  };
  const handleRegister = async () => {
    console.log(data);
    try {
      const res = await axios.post("/user", data);
      console.log(res.data);
      navigate(-1);
    } catch (err) {
      console.log(err.response?.data || "Registration failed");
    }
  };
  const handleApply = () => {
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        const candidateId = decoded.candidateId;

        if (candidateId) {
          navigate(`/application/${slug}/${jid}/${candidateId}`);
          return;
        }
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
    navigate(`/login/${slug}/${jid}?mode=login`);
  };
  const handleCancel = () => {
    navigate(-1);
  };
  useEffect(() => {
    fetchJobDetails();
    fetchApplicantStatus();
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
      <TopNav setAuthMode={setAuthMode} />
      <div className="job-details-wrapper" >
       <div className="job-details">
         <div className="job-details-header ">
          {/* <span className="df f13 ">
            {" "}
            Job ID: <h4>2X0{job.id}</h4>
          </span> */}
          <h2>{jobTitle}</h2>
          <p>
            <span className="highlight">{companyName}</span>
          </p>
          <p className="details">
            <FaBriefcase /> {experience} | <MdOutlineAvTimer /> {workMode} |{" "}
            <IoLocationOutline /> {location}
          </p>
        </div>
        <div className="job-details-body df fdc jcsb ">
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
                      <pre className="form-value">
                        {value || <em>Not provided</em>}
                      </pre>
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
        {authMode && (
          <div className="auth-card slide-in">
            <button onClick={() => setAuthMode(null)} className="jd-close-btn">✖</button>

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
    </div>
  );
};

export default JobDetails;
