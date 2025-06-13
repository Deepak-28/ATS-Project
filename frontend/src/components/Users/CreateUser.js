import React, { useEffect, useRef, useState } from "react";
import {  FaEdit } from "react-icons/fa";
import { MdDeleteForever, MdOutlineLibraryAdd} from "react-icons/md";
import { toast } from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import "../Job/JobList.css"; // reuse your existing styling
import Navbar from "../admin/Navbar";

function CreateUser() {
  const { cid } = useParams();
  const [Users, setUsers] = useState([]);
  const getUser = async () => {
    try {
      const res = await axios.get(`/login/user/company/${cid}`);
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`/login/user/${id}`);
        toast.success("User deleted successfully");
        getUser(); // refresh user list
      } catch (err) {
        console.error("Error deleting user:", err);
        toast.error("Failed to delete user");
      }
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <div className="container"> 
    <Navbar/>{/* Content */}
      <div className="admin-container">
          <div className="df jcsb al w100">
            <h2 className="job-heading ml10 mt15">All Users</h2>
            <div className="c-btn">
              <Link to={`/addUser/${cid}`}>
                <MdOutlineLibraryAdd size={24} className="g mr10" />
              </Link>
          </div>
        </div>

        {/* Table View */}
       <div className="data-table">
         <table className="job-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Users.length > 0 ? (
              Users.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  <td>
                    <div className="job-actions">
                      {/* <Link to="#" className="applied-link">
                        <FaUser />
                      </Link> */}
                      <Link
                        to={`/editUser/${user.id}/${cid}`}
                        className="applied-link blue"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        className="applied-link"
                        onClick={() => deleteUser(user.id)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                        }}
                      >
                        <MdDeleteForever color="red" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
       </div>
      </div>
    </div>
  );
}

export default CreateUser;
