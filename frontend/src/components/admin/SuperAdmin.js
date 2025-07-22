import { useEffect, useState } from "react";
import "./AdminPage.css";
import "../login/companyform.css"
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever, MdOutlineLibraryAdd } from "react-icons/md";
import axios from "axios";
import { RiOrganizationChart } from "react-icons/ri";
import { Country, State, City } from "country-state-city";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import Navbar from "./Navbar";

const industryTypes = [
  "Information Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "Telecommunications",
  "Transportation",
  "Energy",
  "Real Estate",
  "Construction",
  "Hospitality",
  "Media & Entertainment",
  "Legal",
  "Agriculture",
];

const SuperAdmin = () => {
  const [companies, setCompanies] = useState([]);
  const [data, setData] = useState(false);
  const countries = Country.getAllCountries();
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [company, setCompany] = useState({});
  const [editId, setEditId] = useState(null);
  const [edited, setEdited] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCompanies = companies.filter((company, index) => {
    const searchString = `${company.code || `C${100 + index}`} ${
      company.name
    } ${company.country} ${company.state} ${company.industry}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });
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
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("/company/add", company)
      .then(() => {
        toast.success("Company added successfully");
        getCompany();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to add company");
      });
    clearFunction();
  };
  const handleEdit = (id) => {
    const data = companies.filter((item) => item.id === id);
    setCompany(data[0]);
    setData(true);

    const { country, state, city } = data[0];
    setSelectedCountry(country);
    setStates(State.getStatesOfCountry(country));
    setSelectedState(state);
    setCities(City.getCitiesOfState(country, state));
    setSelectedCity(city);
    setEdited(true);
    setEditId(id);
  };
  const handleUpdate = () => {
    axios
      .put(`/company/update/${editId}`, company)
      .then(() => {
        getCompany();
        toast.success("Company updated successfully");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to update company");
      });
    clearFunction();
  };
  const clearFunction = () => {
    setData(false);
    setCompany({});
    setEdited(false);
    setEditId(null);
    setSelectedCity("");
    setSelectedCountry("");
    setSelectedState("");
    getCompany();
  };
  const getCompany = async () => {
    try {
      const res = await axios.get("/company/companies");
      setCompanies(res.data);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    }
  };
  const deleteCompany = async (id) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        await axios.delete(`/company/${id}`);
        toast.success("Company deleted successfully");
        getCompany();
      } catch (err) {
        console.error("Error deleting Company:", err);
        toast.error("Failed to delete Company");
      }
    }
  };
  const handleData = () => {
    setData(true);
  };
  useEffect(() => {
    getCompany();
  }, []);

  return (
    <div className="container">
      <Navbar />
      <div className="admin-container">
        <nav className="navbar">
          <div className="c-btn df w100 jcsb al ml10">
            <h3>Companies</h3>
           <div>
             <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              className="mr20"
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: "6px", width: "250px" }}
            />
            <Link onClick={handleData}>
              <MdOutlineLibraryAdd size={24} className="g mr10" />
            </Link>
           </div>
          </div>
        </nav>
        {/* Jobs Section */}
        <div className="data-table">
          <table className="job-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Company Code</th>
                <th>Name</th>
                <th>Location</th>
                <th>Industry</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((company, index) => (
                  <tr key={company.id || index}>
                    <td>{index + 1}</td>
                    <td>{company.code || `C${100 + index}`}</td>
                    <td>{company.name}</td>
                    <td>
                      {company.country}, {company.state}
                    </td>
                    <td>{company.industry}</td>
                    <td>
                      <div className="job-actions df jcsb w100">
                        <Link
                          to={`/company/${company.id}/jobs`}
                          className="applied-link"
                        >
                          <RiOrganizationChart />
                        </Link>
                        <FaEdit
                          className="blue"
                          onClick={() => handleEdit(company.id)}
                        />
                        <Link to="#" className="applied-link">
                          <MdDeleteForever
                            color="red"
                            onClick={() => deleteCompany(company.id)}
                          />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No companies found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {data && (
        <div className="test df jc al">
          <div className="box df al jcse fdc">
            <div className="box-head df al jc">
              <h3>{edited ? "Edit" : "Create"} Company</h3>
            </div>
            <>
              <div className="form-grid  ">
                <div className="input">
                  <label>Company Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Company Name"
                    value={company.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input">
                  <label>Code</label>
                  <input
                    type="text"
                    name="code"
                    placeholder="Company Code"
                    value={company.code}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input">
                  <label>Industry</label>
                  <select
                    name="industry"
                    value={company.industry}
                    onChange={handleChange}
                    className="h5"
                    required
                  >
                    <option value="">Select Industry</option>
                    {industryTypes.map((type, idx) => (
                      <option key={idx} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input">
                  <label>Email ID</label>
                  <input
                    type="email"
                    name="e_id"
                    placeholder="Email ID"
                    value={company.e_id}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={company.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input">
                  <label>Country</label>
                  <select
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    className="h5"
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map((c) => (
                      <option key={c.isoCode} value={c.isoCode}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input">
                  <label>State</label>
                  <select
                    value={selectedState}
                    onChange={handleStateChange}
                    className="h5"
                    disabled={!selectedCountry}
                    required
                  >
                    <option value="">Select State</option>
                    {states.map((s) => (
                      <option key={s.isoCode} value={s.isoCode}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input">
                  <label>City</label>
                  <select
                    value={selectedCity}
                    onChange={handleCityChange}
                    className="h5"
                    disabled={!selectedState}
                    required
                  >
                    <option value="">Select City</option>
                    {cities.map((c, i) => (
                      <option key={i} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
            <div className="box-border w100 df jce ae g10 ">
              <button
                type="button"
                className="gray s-btn mr10"
                onClick={clearFunction}
              >
                Cancel
              </button>
              {edited ? (
                <button
                  type="submit"
                  onClick={handleUpdate}
                  className="b s-btn mr30"
                >
                  Update
                </button>
              ) : (
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="b s-btn mr30"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;
