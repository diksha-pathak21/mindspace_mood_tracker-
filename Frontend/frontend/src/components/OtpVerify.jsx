import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../service/api";

const OtpVerify = () => {
  const [otp, setOtp] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // this contains {name, email, password}
  const form = location.state;

  if (!form) return <p>Error: No registration data found</p>;

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      // 1. Verify OTP
      await api.post("/verify-otp", {
        email: form.email,
        otp,
      });

      // 2. Register user
      await api.post("/register", form);

      alert("Registered Successfully!");
      navigate("/login");
    } catch (err) {
      alert("Invalid OTP");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Verify OTP</h2>

      <p>OTP sent to: <b>{form.email}</b></p>

      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <br /><br />
        <button type="submit">Verify OTP</button>
      </form>
    </div>
  );
};

export default OtpVerify;
