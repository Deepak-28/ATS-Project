import React, { useEffect, useRef, useState } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";

function TopNav({ setAuthMode }) {
  const {slug} = useParams();
  const [showPopup, setShowPopup] = useState(false);
  const email = localStorage.getItem("email");
  const candidateId = localStorage.getItem("candidateId");
  const name = localStorage.getItem("name");
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const handleCandidateLogout = () => {
    localStorage.removeItem("candidate_token");
    localStorage.removeItem("candidateId");
    localStorage.removeItem("cid");
    localStorage.removeItem("name")
    setShowPopup(false);
    navigate(`/careers/${slug}`)
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
        <img src="/logo.png" alt="logo" className="logo cursor-pointer" onClick={()=>navigate(`/careers/${slug}`)} />
        {name && (<p>Welcome! {name}</p>)}
      </div>
      {candidateId ? (
        <div className="df al fdr g10">
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
        <div className="popup df fdc jcsb f13" ref={popupRef}>
          <div className="">
            <div className="w100 df al ">
              <div className="h10 w5 df al jc ">
                <label htmlFor="profile">
                  {" "}
                  <Link to={`/profile/${slug}/${candidateId}`}>
                    <FaRegUserCircle size={30} className="cursor-pointer" />
                  </Link>
                </label>
              </div>
              <div className=" ">
                <p>{email || "Email not found"}</p>
              </div>
            </div>
          </div>
          <div className="df al w100 jc">
            <button className="s-btn r" onClick={handleCandidateLogout}>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TopNav;
