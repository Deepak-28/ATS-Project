import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Country, State, City } from "country-state-city";
import axios from "axios";
import "./login.css";

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
  const [data, setData] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isRegister, setIsRegister] = useState(true);
  const [activeTab, setActiveTab] = useState("login");
  const [backgroundImage, setBackgroundImage] = useState(null);

  // console.log(slug);

  const fetchPortal = async () => {
    try {
      const res = await axios.get(`/portal/${slug}`);
      // console.log(res.data);
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
    axios
      .post("/login/check", formData)
      .then((res) => {
        const { role, candidateId, cid } = res.data;
        // Store data in localstorage
        // localStorage.setItem("role", role);
        if (cid) localStorage.setItem("cid", cid);
        if (candidateId) localStorage.setItem("cadidateId", candidateId);

        if (role === "candidate") {
          navigate(`/application/${jid}/${candidateId}`);
        }
      })
      .catch((err) => {
        console.log("Login failed:", err);
        setError("Invalid email or password."); // ❗ Set error message
      });
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
  const baseUrl = process.env.REACT_APP_BASE_URL 
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
  }, []);
  return (
    <div style={pageStyle}>
      {isRegister ? (
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

            {/* Error message */}
            {error && <p className="error-text">{error}</p>}

            <div className="remember-forget">
              <div className="rem-box">
                <input type="checkbox" id="remember" className="remember" />
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
                <span className="link" onClick={() => setIsRegister(false)}>
                  Register
                </span>
              </p>
            </div>
          </div>
        </form>
      ) : (
        <div className="register-header">
          <div className=" df fdc jcsb al">
            <h3>Register Here</h3>
            <div className="">
              <div className="input-box">
                {/* <label>First Name</label> */}
                <input
                  type="text"
                  id="firstname"
                  placeholder="First Name"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-box">
                {/* <label>Last Name</label> */}
                <input
                  type="text"
                  id="lastname"
                  placeholder="Last Name"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-box">
                {/* <label>Email</label> */}
                <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-box">
                {/* <label>Ph. No</label> */}
                <input
                  type="number"
                  id="ph_no"
                  placeholder="Phone Number"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="address-box">
                {/* <label>Address</label> */}
                <textarea
                  id="address"
                  placeholder="Address"
                  onChange={handleInputChange}
                  required
                />
              </div>
              {/* Country Dropdown */}
              <div className="input-box">
                {/* <label>Country</label> */}
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
              {/* State Dropdown */}
              <div className="input-box">
                {/* <label>State</label> */}
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
              {/* City Dropdown */}
              <div className="input-box">
                {/* <label>City</label> */}
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
                {/* <label>Password</label> */}
                <input
                  type="password"
                  id="password"
                  placeholder="Password"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-box">
                {/* <label>Confirm Password</label> */}
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
      )}
    </div>
    //  <div className="auth-container">
    //     <div className="auth-card">
    //       <h2>{isRegister ? 'Register Form' : 'Login Form'}</h2>

    //       <div className="tab-switcher">
    //         <button
    //           className={!isRegister ? 'active' : ''}
    //           onClick={() => setIsRegister(false)}
    //         >
    //           Login
    //         </button>
    //         <button
    //           className={isRegister ? 'active' : ''}
    //           onClick={() => setIsRegister(true)}
    //         >
    //           Signup
    //         </button>
    //       </div>

    //       {isRegister ? (
    //         <form className="auth-form">
    //           <input type="text" placeholder="Full Name" />
    //           <input type="email" placeholder="Email Address" />
    //           <input type="password" placeholder="Password" />
    //           <button type="submit">Signup</button>
    //           <p>
    //             Already have an account?{' '}
    //             <span className="link" onClick={() => setIsRegister(false)}>
    //               Login here
    //             </span>
    //           </p>
    //         </form>
    //       ) : (
    //         <form className="auth-form">
    //           <input type="email" placeholder="Email Address" />
    //           <input type="password" placeholder="Password" />
    //           <a className="forgot" href="/forgot-password">
    //             Forgot password?
    //           </a>
    //           <button type="submit">Login</button>
    //           <p>
    //             Not a member?{' '}
    //             <span className="link" onClick={() => setIsRegister(true)}>
    //               Signup now
    //             </span>
    //           </p>
    //         </form>
    //       )}
    //     </div>
    //   </div>

    // {/* <div className="candidate-login-container">
    //   {/* Tab Switcher */}
    //   <div className="tab-switcher">
    //     {/* <button
    //       className={`tab-btn ${activeTab === "login" ? "tab-active" : ""}`}
    //       onClick={() => setActiveTab("login")}
    //     >
    //       Login
    //     </button>
    //     <button
    //       className={`tab-btn ${activeTab === "register" ? "tab-active" : ""}`}
    //       onClick={() => setActiveTab("register")}
    //     >
    //       Register
    //     </button> */}
    //   </div>

    //   {/* Login Form */}
    //   {activeTab === "login" && (
    //     <form onSubmit={submit}>
    //       <div className="login-header">
    //         <div className="logo-container">
    //           <img src="/logo.png" alt="logo" className="logo" />
    //         </div>
    //         <div className="input-box">
    //           <input
    //             type="email"
    //             id="email"
    //             placeholder="Email"
    //             onChange={handleChange}
    //             required
    //           />
    //         </div>
    //         <div className="input-box">
    //           <input
    //             type="password"
    //             id="password"
    //             placeholder="Password"
    //             onChange={handleChange}
    //             required
    //           />
    //         </div>

    //         {error && <p className="error-text">{error}</p>}

    //         <div className="remember-forget">
    //           <div className="rem-box">
    //             <input type="checkbox" id="remember" className="remember" />
    //             <label>Remember me</label>
    //           </div>
    //           <div className="forgot-link">
    //             <Link to={"/forgetPassword"}>Forgot Password?</Link>
    //           </div>
    //         </div>

    //         <button className="b btn mt20" type="submit">Login</button>

    //         <div className="register-link mt10">
    //           <p>
    //             Don’t have an account?{" "}
    //             <span className="link" onClick={() => setActiveTab("register")}>
    //               Register
    //             </span>
    //           </p>
    //         </div>
    //       </div>
    //     </form>
    //   )}

    //   {/* Register Form */}
    //   {activeTab === "register" && (
    //     <div className="register-header">
    //       <div className="df fdc jcsb al">
    //         <h3>Register Here</h3>
    //         <div>
    //           {/* Your input fields here... same as before */}
    //           <div className="input-box">
    //             <input type="text" id="firstname" placeholder="First Name" onChange={handleInputChange} required />
    //           </div>
    //           <div className="input-box">
    //             <input type="text" id="lastname" placeholder="Last Name" onChange={handleInputChange} required />
    //           </div>
    //           <div className="input-box">
    //             <input type="email" id="email" placeholder="Email" onChange={handleInputChange} required />
    //           </div>
    //           <div className="input-box">
    //             <input type="number" id="ph_no" placeholder="Phone Number" onChange={handleInputChange} required />
    //           </div>
    //           <div className="address-box">
    //             <textarea id="address" placeholder="Address" onChange={handleInputChange} required />
    //           </div>
    //           <div className="job-type">
    //             <select id="country" value={selectedCountry || ""} onChange={handleCountryChange} required>
    //               <option value="">Select Country</option>
    //               {countries.map((c) => (
    //                 <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
    //               ))}
    //             </select>
    //           </div>
    //           <div className="input-box">
    //             <select id="state" value={selectedState || ""} onChange={handleStateChange} disabled={!selectedCountry} required>
    //               <option value="">Select State</option>
    //               {states.map((s) => (
    //                 <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
    //               ))}
    //             </select>
    //           </div>
    //           <div className="input-box">
    //             <select id="city" value={selectedCity || ""} onChange={handleCityChange} disabled={!selectedState} required>
    //               <option value="">Select City</option>
    //               {cities.map((c) => (
    //                 <option key={c.name} value={c.name}>{c.name}</option>
    //               ))}
    //             </select>
    //           </div>
    //           <div className="input-box">
    //             <input type="password" id="password" placeholder="Password" onChange={handleInputChange} required />
    //           </div>
    //           <div className="input-box">
    //             <input type="password" id="confirmPassword" placeholder="Confirm Password" onChange={handleInputChange} required />
    //           </div>
    //         </div>
    //         <div className="df al fdc">
    //           <button className="b btn mt20" type="button" onClick={handleRegister}>
    //             Submit
    //           </button>
    //           <p className="toggle-form">
    //             Already have an account?{" "}
    //             <span className="link" onClick={() => setActiveTab("login")}>
    //               Login
    //             </span>
    //           </p>
    //         </div>
    //       </div>
    //     </div>
    //   )}
    // </div> */}
  );
}

export default CandidateLogin;
