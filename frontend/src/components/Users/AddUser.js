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
  const [companyId, setCompanyId] = useState(cid || "");
  const [isEditMode, setIsEditMode] = useState(false);

  const currentRole = localStorage.getItem("role");
  console.log(cid, userId);
  

  const getCompanies = async () => {
    try {
      const res = await axios.get("/company/companies");
      setCompanies(res.data);
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
      setCompanyId(user.companyId);
      setIsEditMode(true);
    } catch (err) {
      console.error("Error fetching user for edit", err);
      toast.error("Failed to load user data");
    }
  };

  const handleBack = () => {
    // navigate(`/Users/${cid}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { username, email, role, companyId };
      console.log(username, email, role, companyId);
      
      if (!isEditMode) payload.password = password;

      if (isEditMode) {
        await axios.put(`/login/admin/user/${userId}`, payload);
        toast.success("User updated successfully!");
      } else {
        await axios.post("/login/admin/users", payload);
        toast.success("User created successfully!");
      }
      // navigate(`/Users/${companyId}`);
      navigate(-1)
    } catch (err) {
      console.log("Failed to submit form:", err);
      toast.error("Failed to submit user");
    }
  };

  useEffect(() => {
    getCompanies();
    if (userId) fetchUserForEdit();
  }, []);

  return (
    <div className="container">
      <Navbar />
      <div className="admin-container">
        <div className="ml10">
          <h3>{isEditMode ? "Edit User" : "Create New User"}</h3>
          <form onSubmit={handleSubmit} className="h80 mt10 df fdc jcsb">
           <div>
             {(currentRole === "SuperAdmin" || currentRole === "admin") ? (
              <div className="input mt10">
                <label>Company</label>
                <select
                  id="companyId"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="h5"
                  required
                >
                  <option value="">Select Company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="input mt10">
                <label>Company</label>
                <input
                  type="text"
                  value={companies.find((c) => c.id == companyId)?.name || ""}
                  disabled
                  className="form-control"
                />
              </div>
            )}

            <div className="input mt10">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-control"
                required
              />
            </div>
            <div className="input mt10">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                required
              />
            </div>
            {!isEditMode && (
              <div className="input mt10">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
            )}
            <div className="input mt10">
              <label htmlFor="role">Role:</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className=""
                required
              >
                <option value="">Select</option>
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
              </select>
            </div>
           </div>
            <div className=" h8  df al jce mr10">
              <button type="button" className="gray btn mr10" onClick={()=>navigate(-1)}>
                Cancel
              </button>
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
