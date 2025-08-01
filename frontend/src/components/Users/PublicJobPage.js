import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Country, State, City } from "country-state-city";
import { FaBriefcase, FaRegUserCircle } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineAvTimer } from "react-icons/md";
import TopNav from "../admin/TopNav";
import axios from "axios";
import "./PublicJobPage.css";
import toast from "react-hot-toast";

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
  const [data, setData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    ph_no: "",
    address: "",
    password: "",
    confirmPassword: "",
    country: "",
    state: "",
    city: "",
  });
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
  const modalRef = useRef();
  const [mail, setMail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);

  const getJobs = async () => {
    try {
      const res = await axios.get(`/job/slug/${slug}`);
      setJobs(res.data);
      setFilteredJobs(res.data);
      // console.log(res.data);
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

      const company = job.companyName || "";
      const matchSearch =
        !lowerSearch ||
        title.toLowerCase().includes(lowerSearch) ||
        company.toLowerCase().includes(lowerSearch);

      const matchLocation =
        !lowerLocation ||
        (typeof location === "string" &&
          location.toLowerCase().includes(lowerLocation)) ||
        (typeof location === "object" &&
          location.display?.toLowerCase().includes(lowerLocation));

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
      const { candidateId, cid, email, name, userId } = decoded;

      if (cid) localStorage.setItem("cid", cid);
      if (candidateId) localStorage.setItem("candidateId", candidateId);
      if (email) localStorage.setItem("email", email);
      if (name) localStorage.setItem("name", name);
      if (userId) localStorage.setItem("candidateUserId", userId);
      else {
        // Not a candidate (fallback)
        navigate("/unauthorized");
      }
      setAuthMode(null);
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password.");
    }
  };
  const handleRegister = async () => {
    const { firstname, lastname, email, password, confirmPassword } = data;
    if (
      !firstname?.trim() ||
      !lastname?.trim() ||
      !email?.trim() ||
      !password?.trim()
    ) {
      toast.error("Fill the requied Fileds");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const payload = Object.fromEntries(
      Object.entries(data).filter(([_, val]) => val !== "")
    );

    try {
      await axios.post("/user", payload);
      setAuthMode(null);
      setData("");
      toast.success("SignIn with Your Email and Password");
      toast.success("Registration Successful");
    } catch (err) {
      console.error(err.response?.data || "Registration failed");
      toast.error(err.response?.data || "Registration failed");
    }
  };
  const getOtp = async () => {
    try {
      const data = await toast.promise(
        axios.post("/login/auth/send-otp", { email: mail }),
        {
          loading: "Sending OTP...",
          success: "OTP sent successfully!",
          error: "Failed to send OTP.",
        }
      );
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed");
    }
  };
  const resetPassword = async () => {
    try {
      await axios.post("/login/auth/verify-otp", {
        email: mail,
        otp,
        password: newPassword,
      });
      toast.success("Password reset successful");
      setStep(1);
    } catch (err) {
      toast.error(err.response?.data?.error || "Verification failed");
    }
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
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setAuthMode(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
                const workMode = getDynamicField(formValues, [
                  "mode",
                  "work mode",
                  "remote",
                  "onsite",
                  "hybrid",
                  "job type",
                ]);
                return (
                  <div className="job-card " key={index}>
                    <div className="job-info ">
                      <h4>{jobTitle}</h4>
                      <p>
                        <strong>{companyName}</strong>
                      </p>
                      <p className="details">
                        <FaBriefcase /> {experience} &nbsp;|&nbsp;
                        <MdOutlineAvTimer /> {workMode} &nbsp;|&nbsp;
                        <IoLocationOutline />{" "}
                        {typeof location === "object" && location !== null
                          ? location.display || "N/A"
                          : location || "N/A"}
                      </p>
                    </div>
                    <div className="df al">
                      <Link to={`/job/${slug}/${job.id}`}>
                        <button className="s-btn b">Apply</button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {authMode && (
          <div className="auth-card " ref={modalRef}>
            {authMode === "signin" && !isRegister ? (
              <form onSubmit={submit}>
                <div className="login-header">
                  <div className="logo-container">
                    <img src="/logo.png" alt="logo" className="logo" />
                  </div>
                  {step === 1 && (
                    <div className="w100 df al fdc">
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
                          <span onClick={() => setStep(2)} className="link">
                            Forgot Password?
                          </span>
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
                  )}
                  {step === 2 && (
                    <div className="w100 ">
                      <div className="df al fdc ">
                        <h3>Reset Password</h3>
                        <p>Enter your email to receive OTP</p>
                      </div>
                      <div className="df fdc al w100 ">
                        <div className="input-box">
                          <input
                            type="email"
                            value={mail}
                            placeholder="Enter your Email"
                            onChange={(e) => setMail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="df g10">
                          <button type="button"
                            className="gray s-btn"
                            onClick={() => setStep(1)}
                          >
                            Back
                          </button>
                          <button type="button" className="b s-btn" onClick={getOtp}>
                            Send OTP
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {step === 3 && (
                    <div className="df al fdc w100">
                      <div className="input-box">
                        <input
                          type="text"
                          placeholder="Enter OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                        />
                      </div>
                      <div className="input-box">
                        <input
                          type="password"
                          placeholder="New Password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <div className="df g10">
                        <button type="button"
                          className="gray s-btn"
                          onClick={() => setStep(2)}
                        >
                          Back
                        </button>
                        <button type="button" className="b s-btn" onClick={resetPassword}>
                          Submit
                        </button>
                      </div>
                    </div>
                  )}
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
                        value={data.firstname || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <span className="required">*</span>
                    </div>

                    <div className="input-box">
                      <input
                        type="text"
                        id="lastname"
                        placeholder="Last Name"
                        value={data.lastname || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <span className="required">*</span>
                    </div>

                    <div className="input-box">
                      <input
                        type="email"
                        id="email"
                        placeholder="Email"
                        value={data.email || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <span className="required">*</span>
                    </div>

                    <div className="input-box">
                      <input
                        type="number"
                        id="ph_no"
                        placeholder="Phone Number"
                        value={data.ph_no || ""}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="address-box">
                      <textarea
                        id="address"
                        placeholder="Address"
                        value={data.address || ""}
                        onChange={handleInputChange}
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
                        value={data.password || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <span className="required">*</span>
                    </div>

                    <div className="input-box">
                      <input
                        type="password"
                        id="confirmPassword"
                        placeholder="Confirm Password"
                        value={data.confirmPassword || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <span className="required">*</span>
                    </div>
                  </div>
                  <div className="df al fdc mt10">
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
