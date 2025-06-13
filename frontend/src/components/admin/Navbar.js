import React, { useEffect, useRef, useState } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import SidebarMenu from "./SidebarMenu"; // ⬅️ Import your reusable sidebar
import { Link } from "react-router-dom";

function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };
  // const handleLogout = () => {
  //   // Perform logout logic here
  //   console.log("Logged out");
  //   localStorage.clear(); // or remove token
  //   window.location.href = "/login"; // redirect
  // };

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

  return (
    <>
      {/* Top Navbar */}
      <div className="nav-header df al jcsb">
        <div className="w10 h100 df al  jcse">
          <GiHamburgerMenu
            className="df al jc cursor-pointer"
            onClick={toggleSidebar}
          />
          <img src="/logo.png" alt="logo" className="logo" />
        </div>
        <div className="w10  df al jcse">
          {role}
          <div className="nav-icon df al ">
            <FaRegUserCircle
              className="profile-icon"
              onClick={() => setShowPopup(!showPopup)}
            />
          </div>
        </div>
      </div>
      {showPopup && (
        <div className="popup df fdc jcsa" ref={popupRef}>
          <div className=" h5 w10 df al jcsa user-info ">
            <FaRegUserCircle size={30}/>{role}
          </div>
          <div className="df al w100   jc">
            <Link to='/'>
            <button className="s-btn r" onClick={() => localStorage.clear()}>
            Logout
          </button></Link>
          </div>
        </div>
      )}
      {/* Sidebar rendered conditionally */}
      <SidebarMenu isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
    </>
  );
}

export default Navbar;
