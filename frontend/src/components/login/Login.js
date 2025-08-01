import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "../login/components.css";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [popup, setPopup] = useState(false);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError("");
  };
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);

  const submit = async (e) => {
    e.preventDefault();
    axios
      .post("/login/check", formData)
      .then((res) => {
        const token = res.data.token;
        localStorage.setItem("admin_token", token);

        const decoded = JSON.parse(atob(token.split(".")[1])); // Decode payload
        const { userId, role, cid, email, username } = decoded;
        localStorage.setItem("userId", userId);
        localStorage.setItem("username", username);
        localStorage.setItem("email", email);
        localStorage.setItem("role", role);
        if (cid) localStorage.setItem("cid", cid);
        if (role === "SuperAdmin") {
          navigate("/dashboard");
        } else if (role === "admin") {
          navigate(`/admin/${cid}`);
        } else if (role === "recruiter") {
          navigate(`/admin/${cid}`);
        }
      })
      .catch((err) => {
        console.error("Login failed:", err);
        setError("Invalid email or password.");
      });
  };
  const getOtp = async () => {
    try {
      await axios.post("/login/auth/send-otp", { email });
      toast.success("OTP sent");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed");
    }
  };
  const resetPassword = async ()=>{
     try {
          await axios.post("/login/auth/verify-otp", {
            email,
            otp,
            password: newPassword,
          });
          toast.success("Password reset successful");
         navigate(0)
          // redirect or show login
        } catch (err) {
          toast.error(err.response?.data?.error || "Verification failed");
        }
      }
  
  return (
    <div>
      <form onSubmit={submit}>
        <div className="login-container">
          <div className="login-header">
            <div className="logo-container">
              <img src="/logo.png" alt="logo" className="logo" />
            </div>
            <div className="login-box">
              <input
                type="email"
                id="email"
                placeholder="Email"
                onChange={handleChange}
                required
              />
            </div>
            <div className="login-box">
              <input
                type="password"
                id="password"
                placeholder="Password"
                onChange={handleChange}
                required
              />
            </div>

            {/*  Error message */}
            {error && <p className="error-text">{error}</p>}

            <div className="remember-forget">
              <div className="rem-box">
                <input type="checkbox" id="remember" className="remember" />
                <label>Remember me</label>
              </div>
              <div className="forgot-link">
                {/* <Link to={"/forgetPassword"}>Forgot Password?</Link> */}
                <span onClick={() => setPopup(true)} className="link">
                  Forgot Password?
                </span>
              </div>
            </div>

            <button className="b btn mt20" type="submit">
              Login
            </button>
          </div>
        </div>
      </form>
      {popup && (
        <div className="background">
          <div className="login-header">
            <div className="logo-container">
              <img src="/logo.png" alt="logo" className="logo" />
            </div>

            <div className="w100 ">
              {step === 1 && (
                <div className="f13 df al fdc  jcsa h30 ">
                  <div className="df al fdc ">
                    <h3>Reset Password</h3>
                    <p>Enter your email to receive OTP</p>
                  </div>
                  <div className="df fdc al w100 ">
                    <div className="login-box">
                      <input
                        type="email"
                        value={email}
                        placeholder="Enter your Email"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <button className="b s-btn" onClick={getOtp}>
                      Send OTP
                    </button>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="df al fdc">
                  
                  <div className="login-box">
                   
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                  <div className="login-box">
                    <input
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <button className="b s-btn" onClick={resetPassword}>
                      Submit
                    </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

}
export default Login;
