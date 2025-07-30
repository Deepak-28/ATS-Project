import React, { useEffect, useState } from "react";
import { FaEdit , FaUsers} from "react-icons/fa";
import { MdDeleteForever, MdOutlineLibraryAdd } from "react-icons/md";
import { toast } from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import "../Job/JobList.css";
import Navbar from "../admin/Navbar";

function CreateUser() {
  const { cid } = useParams();
  const [Users, setUsers] = useState([]);
  const loggedInUserId = localStorage.getItem("userId");

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
      <Navbar />
      {/* Content */}
      <div className="admin-container">
        <div className="df jcsb al w100 h10">
          <div className="df fdr al h100 jcsa w8">
            <FaUsers size={18}/>
          <h3 >All Users</h3>
          </div>
          <div className="c-btn">
            <Link to={`/addUser`}>
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
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Users.length > 0 ? (
                Users.map((user, index) => {
                  const isSelfAdmin =
                    user.role === "admin" &&
                    String(user.id) === String(loggedInUserId);
                  if (isSelfAdmin) return null; 

                  return (
                    <tr key={user.id}>
                      <td>{index }</td>
                      <td>{user.username}</td>
                      <td>{user.role}</td>
                      <td>{user.email}</td>
                      <td>
                        <div className="job-actions">
                          <Link
                            to={`/addUser/${user.id}`}
                            className="applied-link blue"
                          >
                            <FaEdit />
                          </Link>
                          <MdDeleteForever
                            color="red"
                            className="cursor-pointer"
                            onClick={() => deleteUser(user.id)}
                            size={18}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
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
