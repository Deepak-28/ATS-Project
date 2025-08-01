import React, { useEffect, useRef, useState } from "react";
import { FaRegUserCircle, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import SidebarMenu from "./SidebarMenu";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popup, setPopup] = useState(false);
  const [data, setData] = useState([]);
  const popupRef = useRef(null);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  // const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };
  // const getDetails = async () => {
  //   try {
  //     const res = await axios.get("/login/user");
  //     setData(res.data);
  //   } catch (err) {
  //     console.error("failed to fetch data", err);
  //   }
  // };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  // const handleSave = async () => {
  //   if (!imageFile) return;

  //   const userId = localStorage.getItem("userId");
  //   const formData = new FormData();
  //   formData.append("profileImage", imageFile);
  //   formData.append("userId", userId);

  //   try {
  //     const res = await axios.post("login/upload", formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });

  //     setUploadedImageUrl(res.data.imageUrl);
  //     alert("Upload successful!");
  //   } catch (error) {
  //     console.error("Upload failed:", error);
  //     alert("Upload failed");
  //   }
  // };

  const handlePasswordUpdate = async () => {
    if (!oldPassword.trim() || !newPassword.trim()) {
      toast("Both fields are required.", {
        icon: "⚠️",
      });
      return;
    }

    if (oldPassword === newPassword) {
      toast("New password must be different from the old password.", {
        icon: "⚠️",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast("New password must be at least 6 characters.", {
        icon: "⚠️",
      });
      return;
    }

    const hasNumber = /\d/.test(newPassword);
    if (!hasNumber) {
      toast("Password must contain at least one number.", {
        icon: "⚠️",
      });
      return;
    }
    try {
      await axios.put("/login/updatePassword", {
        userId,
        oldPassword,
        newPassword,
      });
      toast.success("Password updated successfully!");
      setPopup(false);
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("Password update failed:", error);
      toast.error("Failed to update password. Please check your old password.");
    }
  };
  const handleLogout = ()=>{
    localStorage.clear();
    navigate("/");
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <>
      {/* Top Navbar */}
      <div className="nav-header df al jcsb">
        <div className="w10 h100 df al  jcse">
          <GiHamburgerMenu
            className="df al jc cursor-pointer "
            onClick={toggleSidebar}
          />
          <img src="/logo.png" alt="logo" className="logo" />
        </div>
        <div className="w10  df al jcse">
          {role}
          <div className="nav-icon df al ">
            <FaRegUserCircle
              className="cursor-pointer"
              onClick={() => setShowPopup(!showPopup)}
            />
          </div>
        </div>
      </div>
      {showPopup && (
        <div className="popup df fdc jcsb" ref={popupRef}>
          <div className="">
            <div className="popuo-head">
              <div className="h10 w5 df al jc ">
                <label htmlFor="profile">
                  {" "}
                  <FaRegUserCircle size={28} color="white" className="cursor-pointer" />
                </label>
                <input
                  type="file"
                  id="profile"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
              </div>
              <div style={{color : "white"}}>
                <span>{(username && username !== 'null') ? username : role}</span>

                <p>{email}</p>
              </div>
            </div>
          </div>
          <div
            className=" popup-button"
            onClick={() => {
              setPopup(true);
              setShowPopup(false);
            }}
          >
            <p style={{ color: "black" }}>Update Password</p>
          </div>
          <div className="popup-button" onClick={handleLogout}>
                 <p style={{ color: "black" }}>Logout</p>
          </div>
        </div>
      )}
      {popup && (
        <div className="test df jc al">
          <div className="pop-box3 df jcsb fdc">
            <div className="h7 w100  df al jcsb ">
              <div className="w100 df al jc">
                <h3>Update Password</h3>
              </div>
              <button onClick={() => setPopup(false)} className="close-btn w3">
                {" "}
                ✖
              </button>
            </div>
            <div className="h90  df fdc jc al  g20">
              <div className="input-container">
                <input
                  type={showOld ? "text" : "password"}
                  placeholder="Enter Old Password"
                  className="input-field"
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <span onClick={() => setShowOld(!showOld)} className="icon">
                  {showOld ? <FaRegEye /> : <FaRegEyeSlash />}
                </span>
              </div>

              <div className="input-container">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="Enter New Password"
                  className="input-field"
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <span onClick={() => setShowNew(!showNew)} className="icon">
                  {showNew ? <FaRegEyeSlash /> : <FaRegEye />}
                </span>
              </div>
            </div>
            <div className="h10 df al jc">
              <button className="s-btn b" onClick={handlePasswordUpdate}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Sidebar rendered conditionally */}
      <SidebarMenu isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
    </>
  );
}

export default Navbar;
