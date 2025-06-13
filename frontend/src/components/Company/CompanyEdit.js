import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Country, State, City } from "country-state-city";
import { useNavigate, useParams } from "react-router-dom";


const industryTypes = [
  "Information Technology", "Finance", "Healthcare", "Education", "Manufacturing",
  "Retail", "Telecommunications", "Transportation", "Energy", "Real Estate",
  "Construction", "Hospitality", "Media & Entertainment", "Legal", "Agriculture"
];

function EditCompanyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const countries = Country.getAllCountries();
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [company, setCompany] = useState({});

  useEffect(() => {
    const getCompany = async () => {
      try {
        const res = await axios.get(`/company/${id}`);
        setCompany(res.data);
        setSelectedCountry(res.data.country);
        setSelectedState(res.data.state);
        setSelectedCity(res.data.city);
        setStates(State.getStatesOfCountry(res.data.country));
        setCities(City.getCitiesOfState(res.data.country, res.data.state));
      } catch (err) {
        console.error(err);
        alert("Failed to fetch company");
      }
    };

    getCompany();
  }, [id]);

  const handleChange = (e) => {
    setCompany({ ...company, [e.target.name]: e.target.value });
  };

  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    setSelectedCountry(countryCode);
    setCompany({ ...company, country: countryCode, state: "", city: "" });
    setStates(State.getStatesOfCountry(countryCode));
    setCities([]);
    setSelectedState("");
    setSelectedCity("");
  };

  const handleStateChange = (e) => {
    const stateCode = e.target.value;
    setSelectedState(stateCode);
    setCompany({ ...company, state: stateCode, city: "" });
    setCities(City.getCitiesOfState(selectedCountry, stateCode));
    setSelectedCity("");
  };

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setSelectedCity(cityName);
    setCompany({ ...company, city: cityName });
  };

  const handleBack = () => {
    navigate("/superAdmin");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`/company/update/${id}`, company)
      .then(() => {
        alert("Company updated successfully");
        navigate("/superAdmin");
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to update company");
      });
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
     

      {/* Top Navbar */}
      <div>
      <nav className="w100 df h10 al">
       
        <h2 className="logo">Edit Company</h2>
      </nav>

      {/* Form Section */}
      <form onSubmit={handleSubmit}>
        <div className="form-grid ml10">
          <div className="form-column">
            <div className="input mt5">
              <label>Company Name</label>
              <input
                type="text"
                name="name"
                placeholder="Company Name"
                value={company.name || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input mt5">
              <label>Code</label>
              <input
                type="text"
                name="code"
                placeholder="Company Code"
                value={company.code || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input mt5">
              <label>Country</label>
              <select value={selectedCountry || ""} onChange={handleCountryChange} className="h5" required>
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="input mt5">
              <label>State</label>
              <select value={selectedState || ""} onChange={handleStateChange} className="h5" disabled={!selectedCountry} required>
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="input mt5">
              <label>City</label>
              <select value={selectedCity || ""} onChange={handleCityChange} className="h5" disabled={!selectedState} required>
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
              <select name="industry" value={company.industry || ""} onChange={handleChange} className="h5" required>
                <option value="">Select Industry</option>
                {industryTypes.map((type, idx) => (
                  <option key={idx} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="input mt5">
              <label>Email ID</label>
              <input
                type="email"
                name="e_id"
                placeholder="Email ID"
                value={company.e_id || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input mt5">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={company.password || ""}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="mt160 ml370">
          {/* <button type="button" className="gray btn" onClick={handleBack}>Cancel</button> */}
          <button type="submit" className="b btn">Update</button>
        </div>
      </form>
    </div>
    </div>
  );
}

export default EditCompanyForm;
