import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import "./UserCreation.css";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../admin/Navbar";

const UserCreation = () => {
  const { cid, userId } = useParams(); // cid is companyId, userId is for edit mode
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const comId = localStorage.getItem("cid");
  const currentRole = localStorage.getItem("role");
  const [companyId, setCompanyId] = useState("");

  const getCompanies = async () => {
    try {
      if (comId) {
        const res = await axios.get(`/company/${comId}`);
        console.log(res.data);
        
        setCompanies([res.data]);
      } else {
        const res = await axios.get("/company/companies");
        setCompanies(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    }
  };
  const fetchUserForEdit = async () => {
    try {
      const res = await axios.get(`/login/admin/user/${userId}`);
      const user = res.data;
      setUsername(user.username);
      setEmail(user.email);
      setRole(user.role);
      setCompanyId(user.cid);
      setIsEditMode(true);
    } catch (err) {
      console.error("Error fetching user for edit", err);
      toast.error("Failed to load user data");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { username, email, role, companyId };
      // console.log(username, email, role, companyId);

      if (!isEditMode) payload.password = password;

      if (isEditMode) {
        await axios.put(`/login/admin/user/${userId}`, payload);
        toast.success("User updated successfully!");
      } else {
        await axios.post("/login/admin/users", payload);
        toast.success("User created successfully!");
      }
      // navigate(`/Users/${companyId}`);
      navigate(-1);
    } catch (err) {
      console.error("Failed to submit form:", err);
      toast.error("Failed to submit user");
    }
  };
useEffect(() => {

  if (currentRole === "admin") {
    setCompanyId(comId); 
  } else if (currentRole === "SuperAdmin" && cid) {
    setCompanyId(cid);
  }
  getCompanies();
  if (userId) fetchUserForEdit();
}, []);


  return (
    <div className="container">
      <Navbar />
      <div className="admin-container">
        <div className=" df fdc jcsa h100 al w20">
          <h3>{isEditMode ? "Edit User" : "Create New User"}</h3>
          <form onSubmit={handleSubmit} className="h90  df fdc jcsb">
            <div className=" df fdc g10">
              {currentRole === "SuperAdmin" || currentRole === "admin" ? (
                <div className="input ">
                  <label>Company</label>
                  <select
                    id="companyId"
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    className="h5"
                    required
                    disabled={
                      // Disable if user is Admin
                      currentRole === "admin"
                    }
                  >
                    <option value="">Please Select</option>
                    {companies.map((company) => (
                      <option
                        key={company.id}
                        value={company.id}
                        disabled={
                          // Prevent selecting disabled companies (except current one)
                          company.status === "disabled" &&
                          company.id != companyId
                        }
                      >
                        {company.name}
                        {company.status === "disabled" ? " (Disabled)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="input">
                  <label>Company</label>
                  <input
                    type="text"
                    value={companies.find((c) => c.id == companyId)?.name || ""}
                    disabled
                    className="input"
                  />
                </div>
              )}
              <div className="input">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div className="input">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  required
                />
              </div>
              {!isEditMode && (
                <div className="input">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    required
                  />
                </div>
              )}
              <div className="input">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Please Select</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className=" h8  df al jc mr10">
              <button type="submit" className="b btn">
                {isEditMode ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserCreation;
