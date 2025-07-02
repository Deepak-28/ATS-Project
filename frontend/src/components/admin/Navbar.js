import React, { useEffect, useRef, useState } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdCreate } from "react-icons/io";
import SidebarMenu from "./SidebarMenu";
import { Link } from "react-router-dom";
import axios from "axios";

function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [data, setData] = useState([]);
  const popupRef = useRef(null);
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };
  const getDetails = async () => {
    try {
      const res = await axios.get("/login/user");
      setData(res.data);
      // console.log(res.data);
    } catch (err) {
      console.error("failed to fetch data", err);
    }
  };
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!imageFile) return;

    const userId = localStorage.getItem("userId");
    const formData = new FormData();
    formData.append("profileImage", imageFile);
    formData.append("userId", userId);

    try {
      const res = await axios.post("login/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadedImageUrl(res.data.imageUrl);
      alert("Upload successful!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed");
    }
  };
  // Close popup if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const role = localStorage.getItem("role");
  const cid = localStorage.getItem("cid");
  const candidateId = localStorage.getItem("candidateId");

  let currentUser;

  if (!cid && !candidateId) {
    currentUser = data.find((user) => user.role === "SuperAdmin");
  } else {
    currentUser = null;
  }
  useEffect(() => {
    getDetails();
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
            <div className="w100 df al ">
              <div className="h10 w5 df al jc ">
                <label htmlFor="profile">
                  {" "}
                  <FaRegUserCircle size={30} className="cursor-pointer" />
                </label>
                <input
                  type="file"
                  id="profile"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
              </div>
              <div className=" ">
                {role}
                <p>{currentUser?.email || "Email not found"}</p>
              </div>
            </div>
          </div>

          <div className="df al w100   jc">
            <Link to="/">
              <button className="s-btn r" onClick={() => localStorage.clear()}>
                Logout
              </button>
            </Link>
          </div>
        </div>
      )}
      {/* Sidebar rendered conditionally */}
      <SidebarMenu isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
    </>
  );
}

export default Navbar;
