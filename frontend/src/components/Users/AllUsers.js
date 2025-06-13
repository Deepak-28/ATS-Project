import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MdOutlineLibraryAdd, MdDeleteForever } from "react-icons/md";
import { toast } from 'react-hot-toast';
import { FaEdit } from "react-icons/fa";
import axios from "axios";
import "./AdminPage.css";
import "../Job/JobList.css";
import Navbar from "../admin/Navbar";

const AllUsers = () => {
  const { CompanyId } = useParams();
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/login/all");
      let allUsers = res.data;
      if (CompanyId) {
        allUsers = allUsers.filter(
          (user) => String(user.cid) === String(CompanyId)
        );
      }
      setUsers(allUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const getCompany = async () => {
    try {
      const res = await axios.get("/company/companies");
      setCompanies(res.data);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`/login/user/${id}`);
        toast.success("User Deleted");
        fetchUsers();
      } catch (err) {
        console.error("Error deleting User:", err);
        toast.error("Failed to delete User");
      }
    }
  };

  useEffect(() => {
    fetchUsers();
    getCompany();
  }, [CompanyId]);

  // 🔍 Filter users by search term
  const filteredUsers = users.filter((user) => {
    const company = companies.find(c => Number(c.id) === Number(user.cid));
    const companyName = company?.name || "";
    return (
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="container">
      <Navbar />
      <div className="admin-container">
        <nav className="df h10 al jcsb">
          <h3 className="logo ml10">All Users</h3>
          <div className="c-btn df aic gap10 mr10">
            <input
              type="text"
              placeholder="Search by email, role, or company"
              value={searchTerm}
              className="mr20"
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: "6px", width: "250px" }}
            />
            <Link to="/AddUser">
              <MdOutlineLibraryAdd size={24} className="g" />
            </Link>
          </div>
        </nav>

        <div className="data-table">
          <table className="job-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>User ID</th>
                <th>Role</th>
                <th>Email</th>
                <th>Company</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, idx) => {
                  const company = companies.find(
                    (c) => Number(c.id) === Number(user.cid)
                  );
                  return (
                    <tr key={user.id}>
                      <td>{idx + 1}</td>
                      <td>{user.id}</td>
                      <td>{user.role}</td>
                      <td>{user.email}</td>
                      <td>{company?.name || "-"}</td>
                      <td className="df jcsa f14 w100">
                        <Link to={`/addUser/${user.id}`}>
                          <FaEdit size={16} />
                        </Link>
                        <MdDeleteForever
                          size={16}
                          className="applied-link"
                          color="red"
                          onClick={() => deleteUser(user.id)}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllUsers;
