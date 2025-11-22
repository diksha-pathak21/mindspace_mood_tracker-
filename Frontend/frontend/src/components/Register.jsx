// components/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../service/api';
import '../styles/register.css';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '' ,password:''});
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // 1. Send OTP to backend
      await api.post('/send-otp', { email: form.email });

      // 2. Navigate to OTP page & pass form data
      navigate('/verify-otp', { state: form });

    } catch (err) {
      alert('Failed to send OTP');
    }
  };

  return (
    <div className="register-body">
      <form onSubmit={handleRegister}>
        <h2>Register</h2>

        <input
          type="text"
          placeholder="UserName"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <button type="submit">Send OTP</button>

        <p className="quote">"This is your journey. Begin it beautifully 💖"</p>
      </form>
    </div>
  );
};

export default Register;



