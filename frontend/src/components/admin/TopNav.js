import React, { useRef, useState } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

function TopNav({ setAuthMode }) {
  const [showPopup, setShowPopup] = useState(false);
  const email = localStorage.getItem("email");
  const candidateId = localStorage.getItem("candidateId");
  const [popup, setPopup] = useState(false);
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const handleCandidateLogout = () => {
    localStorage.removeItem("candidate_token");
    localStorage.removeItem("candidateId");
    localStorage.removeItem("cid");
    setShowPopup(false);
    navigate(-1);
  };
  const submit = () => {};
  const handleSignin = () => {
    // setPopup(true)
  };
  const handleSignUp = () => {
    // setPopup(false)
  };
  return (
    <div className="top-nav">
      <img src="/logo.png" alt="logo" className="logo" />
      {candidateId ? (
        <div className="df al fdr g10">
          <button
            className="b s-btn"
            onClick={() => navigate(`/profile/${candidateId}`)}
          >
            Applied Jobs
          </button>
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
                  <Link to={`/profile/${candidateId}`}>
                    <FaRegUserCircle size={30} className="cursor-pointer" />
                  </Link>
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
          <div className="df al w100   jc">
            <button className="s-btn r" onClick={handleCandidateLogout}>
              Logout
            </button>
          </div>
        </div>
      )}
      {popup && (
        <div>
          <form onSubmit={submit}>
            <div className="login-header">
              <div className="logo-container">
                <img src="/logo.png" alt="logo" className="logo" />
              </div>
              <div className="input-box">
                <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  // onChange={handleChange}
                  required
                />
              </div>
              <div className="input-box">
                <input
                  type="password"
                  id="password"
                  placeholder="Password"
                  // onChange={handleChange}
                  required
                />
              </div>

              {/* Error message */}
              {/* {error && <p className="error-text">{error}</p>} */}

              <div className="remember-forget">
                <div className="rem-box">
                  <input type="checkbox" id="remember" className="remember" />
                  <label>Remember me</label>
                </div>
                <div className="forgot-link">
                  <Link to={"/forgetPassword"}>Forgot Password?</Link>
                </div>
              </div>

              <button className="b btn mt20" type="submit">
                Login
              </button>
              <div className="register-link mt10">
                <p className="switch-form">
                  Don’t have an account?{" "}
                  {/* <span className="link" onClick={() => setIsRegister(false)}>
                          Register
                        </span> */}
                </p>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default TopNav;
