import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Country, State, City } from "country-state-city";
import axios from "axios";
import toast from "react-hot-toast";

function CandidateLogin() {
  const navigate = useNavigate();
  const { slug, jid } = useParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
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
  const [isRegister, setIsRegister] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [mail, setMail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);

  const fetchPortal = async () => {
    try {
      const res = await axios.get(`/portal/${slug}`);
      setBackgroundImage(res.data.backgroundImage);
    } catch (err) {
      console.error("Error in Fetching the Portal Details", err);
    }
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
      const { role, candidateId, cid, email, name, userId } = decoded;

      if (cid) localStorage.setItem("cid", cid);
      if (candidateId) localStorage.setItem("candidateId", candidateId);
      if (email) localStorage.setItem("email", email);
      if (name) localStorage.setItem("name", name);
      if (userId) localStorage.setItem("candidateUserId", userId);
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
      setData("");
      toast.success("Registration Successful");
      navigate(-1);
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
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const fullImageUrl = `${baseUrl}${backgroundImage}`;
  const pageStyle = {
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#f2fafe",
    backgroundImage: backgroundImage ? `url(${fullImageUrl})` : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };
  useEffect(() => {
    fetchPortal();
  }, [slug]);
  return (
    <div style={pageStyle}>
      {isRegister ? (
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
                    <input type="checkbox" id="remember" className="remember" />
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
                    <span className="link" onClick={() => setIsRegister(true)}>
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
                    <button
                      type="button"
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
                  <button
                    type="button"
                    className="gray s-btn"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="b s-btn"
                    onClick={resetPassword}
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      ) : (
        <div className={`register-container ${!isRegister ? "open" : ""}`}>
          <div className="register-header">
            <div className=" df fdc jcsb al">
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
              <div className="df al fdc">
                <button
                  className="b btn mt20"
                  type="button"
                  onClick={handleRegister}
                >
                  Submit
                </button>
                <p className="toggle-form">
                  Already have an account?{" "}
                  <span className="link" onClick={() => setIsRegister(true)}>
                    Login
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CandidateLogin;
