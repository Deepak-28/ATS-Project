import React, { useEffect, useRef, useState } from "react";
import { FaRegUserCircle, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

function TopNav({ setAuthMode }) {
  const { slug } = useParams();
  const [showPopup, setShowPopup] = useState(false);
  const [popup, setPopup] = useState(false);
  const email = localStorage.getItem("email");
  const candidateId = localStorage.getItem("candidateId");
  const name = localStorage.getItem("name");
  const userId = localStorage.getItem("candidateUserId");
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleCandidateLogout = () => {
    localStorage.removeItem("candidate_token");
    localStorage.removeItem("candidateId");
    localStorage.removeItem("cid");
    localStorage.removeItem("name");
    setShowPopup(false);
    navigate(`/careers/${slug}`);
  };
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
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    }

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  return (
    <div className="top-nav">
      <div className="df fdr al ">
        <img
          src="/logo.png"
          alt="logo"
          className="logo cursor-pointer"
          onClick={() => navigate(`/careers/${slug}`)}
        />
        {name && <p>Welcome! {name}</p>}
      </div>
      {candidateId ? (
        <div className="df al fdr g10 f13">
          <a href={`/profile/${slug}/${candidateId}`}>Applied Jobs</a>

          <div className="nav-icon df al mr10 ">
            <FaRegUserCircle
              className="cursor-pointer"
              onClick={() => setShowPopup(!showPopup)}
            />
          </div>
        </div>
      ) : (
        <div className="w13 df jcsb mr10">
          <button className="s-btn b" onClick={() => setAuthMode("signin")}>
            Sign In
          </button>
          <button className="s-btn b" onClick={() => setAuthMode("signup")}>
            Sign Up
          </button>
        </div>
      )}
      {showPopup && (
        <div className="popup df fdc jcsb" ref={popupRef}>
          <div className="">
            <div className="popuo-head">
              <div className="h10 w5 df al jc ">
                 <label htmlFor="profile">
                  {" "}
                  <Link to={`/profile/${slug}/${candidateId}`}>
                    <FaRegUserCircle size={30} className="cursor-pointer" color="white" />
                  </Link>
                </label>
              </div>
              <div style={{ color: "white" }}>
                <span>{name}</span>
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
          <div className="popup-button" onClick={handleCandidateLogout}>
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
                  {showNew ?  <FaRegEye /> :<FaRegEyeSlash />}
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
    </div>
  );
}

export default TopNav;
