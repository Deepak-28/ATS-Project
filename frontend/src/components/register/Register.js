import React, { useState } from "react";
import axios from "axios";
import { Country, State, City } from "country-state-city";
import { useNavigate, Link } from "react-router-dom";
import '../login/components.css'

function Register() {
  const navigate = useNavigate();
  const countries = Country.getAllCountries();
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [data, setData] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  // Handle input change
  const handleInputChange = (e) => {
    setData(() => {
      const newData = { ...data, [e.target.id]: e.target.value };
      return newData;
    });
  };
  // Handle Country Selection
  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    setSelectedCountry(countryCode);
    setData({ ...data, country: countryCode });
    setStates(State.getStatesOfCountry(countryCode));
    setCities([]);
    setSelectedState(null);
    setSelectedCity(null);
  };
  // Handle State Selection
  const handleStateChange = (e) => {
    const stateCode = e.target.value;
    setSelectedState(stateCode);
    setData({ ...data, state: stateCode });
    setCities(City.getCitiesOfState(selectedCountry, stateCode));
    setSelectedCity(null);
  };
  // Handle City Selection
  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
    setData({ ...data, city: e.target.value });
  };
  // Handle Registration
  const handleRegister = async () => {
    console.log(data);
    try {
      const res = await axios.post("/user", data);
      console.log(res.data);
      navigate("/");
    } catch (err) {
      console.log(err.response?.data || "Registration failed");
    }
  };

  return (
   <div className="reg-container">
     <div className="register-container">
      <div className="h100 df fdc jcsb">
        <h3>Register Here</h3>
        <div className="">
          <div className="input-box">
          <label>First Name</label>
          <input
            type="text"
            id="firstname"
            placeholder="First Name"
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="input-box">
          <label>Last Name</label>
          <input
            type="text"
            id="lastname"
            placeholder="Last Name"
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="input-box">
          <label>Email</label>
          <input
            type="email"
            id="email"
            placeholder="Email"
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="input-box">
          <label>Ph. No</label>
          <input
            type="number"
            id="ph_no"
            placeholder="Phone Number"
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="address-box">
          <label>Address</label>
          <textarea
            id="address"
            placeholder="Address"
            onChange={handleInputChange}
            required
          />
        </div>
        {/* Country Dropdown */}
        <div className="input-box">
          <label>Country</label>
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
          <label>State</label>
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
          <label>City</label>
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
          <label>Password</label>
          <input
            type="password"
            id="password"
            placeholder="Password"
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="input-box">
          <label>Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleInputChange}
            required
          />
        </div>
        </div>
       <div>
         <button className="b btn mt20" type="button" onClick={handleRegister}>
          Submit
        </button>
        <p className="toggle-form mt10">
          Already Registered? <Link to="/">Login</Link> here
        </p>
       </div>
      </div>
    </div>
   </div>
  );
}

export default Register;
