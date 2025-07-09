import React, { useRef, useState } from "react";
import { FaRegUserCircle } from "react-icons/fa";

function Profile() {
  const [showPopup, setShowPopup] = useState(false);
  const email = localStorage.getItem("email");
  const popupRef = useRef(null);
  const handleCandidateLogout = () => {
    localStorage.removeItem("candidate_token");
    localStorage.removeItem("candidateId");
    localStorage.removeItem("cid");
    setShowPopup(false);
    // navigate(`/careers/${slug}`);
  };
  return (
    <div className="public-page-container">
      <div className="top-nav">
        <img src="/logo.png" alt="logo" className="logo" />
        <div className="nav-icon df al mr10 ">
          <FaRegUserCircle
            className="cursor-pointer"
            onClick={() => setShowPopup(!showPopup)}
          />
        </div>
      </div>
      {showPopup && (
        <div className="popup df fdc jcsb f13" ref={popupRef}>
          <div className="">
            <div className="w100 df al ">
              <div className="h10 w5 df al jc ">
                <label htmlFor="profile">
                  {" "}
                  <FaRegUserCircle size={30} className="cursor-pointer" />
                </label>
                {/* <input
                  type="file"
                  id="profile"
                  accept="image/*"
                  style={{ display: "none" }}
                /> */}
                {/* onChange={handleImageUpload} */}
              </div>
              <div className=" ">
                <p>{email || "Email not found"}</p>
              </div>
            </div>
          </div>
          <div>
            {/* <p>View Status</p> */}
            {/* <p>Update Profile</p> */}
          </div>

          <div className="df al w100   jc">
            <button className="s-btn r" onClick={handleCandidateLogout}>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
