import React, { useRef, useState } from "react";
import axios from "axios";
import { Country, State, City } from "country-state-city";
import { Link, useNavigate } from "react-router-dom";
import { FaUsers, FaEdit, FaHome, FaUserTie } from "react-icons/fa";
import { GoWorkflow } from "react-icons/go";
import { GiHamburgerMenu } from "react-icons/gi";
import { BiLogOutCircle } from "react-icons/bi";
import { TbLayoutGridAdd } from "react-icons/tb";
 import {MdDashboard}from "react-icons/md";
import "./companyform.css";

const industryTypes = [
  "Information Technology", "Finance", "Healthcare", "Education", "Manufacturing",
  "Retail", "Telecommunications", "Transportation", "Energy", "Real Estate",
  "Construction", "Hospitality", "Media & Entertainment", "Legal", "Agriculture"
];

function CompanyForm() {
  const navigate = useNavigate();
  const countries = Country.getAllCountries();
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [company, setCompany] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleChange = (e) => {
    setCompany({ ...company, [e.target.name]: e.target.value });
  };

  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    setSelectedCountry(countryCode);
    setCompany({ ...company, country: countryCode });
    setStates(State.getStatesOfCountry(countryCode));
    setCities([]);
    setSelectedState("");
    setSelectedCity("");
  };

  const handleStateChange = (e) => {
    const stateCode = e.target.value;
    setSelectedState(stateCode);
    setCompany({ ...company, state: stateCode });
    setCities(City.getCitiesOfState(selectedCountry, stateCode));
    setSelectedCity("");
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
    setCompany({ ...company, city: e.target.value });
  };

  const handleBack = () => {
    navigate("/superAdmin");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("/company/add", company)
      .then(() => {
        alert("Company added successfully");
        navigate("/superAdmin");
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to add company");
      });
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
       <div
              className={`sidebar ${sidebarOpen ? "active" : ""}`}
              ref={sidebarRef}
            >
              <ul>
                <li className=" df al jcsb  ">
                  <Link to="#">
                    <GiHamburgerMenu onClick={toggleSidebar} />  
                  </Link><span className="w100 ">Super Admin</span>
                </li>
                <li>
                  <Link to="/superAdmin">
                    <FaHome /> Home
                  </Link>
                </li>
                <li>
                  <Link to='/dashboard'><MdDashboard/>Dashboard
                  </Link>
                </li>
                <li>
                  <Link to='/applicants'><FaUserTie/>Applicants
                  </Link>
                </li>
                <li>
                  <Link to="/allUsers">
                    <FaUsers /> Users
                  </Link>
                </li>
                <li>
                  <Link to="/alljobs">
                    <FaEdit /> Jobs
                  </Link>
                </li>
                <li>
                  <Link to="/workFlow">
                    <GoWorkflow /> Workflow
                  </Link>
                </li>
                <li>
                  <Link to='/fieldCreation'><TbLayoutGridAdd/>Fields
                  </Link>
                </li>
                <li>
                  <Link to="/">
                    <BiLogOutCircle />
                    Logout
                  </Link>
                </li>
              </ul>
            </div>

      {/* Top Navbar */}
      <div className={`main-content ${sidebarOpen ? "shifted" : ""}`}>
      <nav className="w100  df h10 al ">
        {!sidebarOpen && (
          <button className="menu-btn">
            <GiHamburgerMenu onClick={toggleSidebar} className="menu_icon" />
          </button>
        )}
        <h3>Add Company</h3>
      </nav>

      {/* Form Section */}
      <form onSubmit={handleSubmit}>
        <div className="form-grid ml10">
          <div className="form-column">
            <div className="input mt5">
              <label>Company Name</label>
              <input type="text" name="name" placeholder="Company Name" value={company.name} onChange={handleChange} required />
            </div>
            <div className="input mt5">
              <label>Code</label>
              <input type="text" name="code" placeholder="Company Code" value={company.code} onChange={handleChange} required />
            </div>
            <div className="input mt5">
              <label>Country</label>
              <select value={selectedCountry} onChange={handleCountryChange} className="h5" required>
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="input mt5">
              <label>State</label>
              <select value={selectedState} onChange={handleStateChange} className="h5" disabled={!selectedCountry} required>
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="input mt5">
              <label>City</label>
              <select value={selectedCity} onChange={handleCityChange} className="h5" disabled={!selectedState} required>
                <option value="">Select City</option>
                {cities.map((c, i) => (
                  <option key={i} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-column">
            <div className="input mt5">
              <label>Industry</label>
              <select name="industry" value={company.industry} onChange={handleChange} className="h5" required>
                <option value="">Select Industry</option>
                {industryTypes.map((type, idx) => (
                  <option key={idx} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="input mt5">
              <label>Email ID</label>
              <input type="email" name="e_id" placeholder="Email ID" value={company.e_id} onChange={handleChange} required />
            </div>
            <div className="input mt5">
              <label>Password</label>
              <input type="password" name="password" placeholder="Password" value={company.password} onChange={handleChange} required />
            </div>
          </div>
        </div>

        <div className=" ml20 mr40 mt180">
          {/* <button type="button" className="gray btn" onClick={handleBack}>Cancel</button> */}
          <button type="submit" className="b s-btn ">Submit</button>
        </div>
      </form>
    </div>
    </div>
  );
}

export default CompanyForm;
