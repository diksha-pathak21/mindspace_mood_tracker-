// components/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../service/api';
import '../styles/register.css'

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '' ,password:''});
  const navigate = useNavigate();

const handleRegister = async (e) => {
  e.preventDefault();
  try {
    const response = await api.post('/register', form);
    alert('Registered! Now login.');
    navigate('/login');
  } catch (err) {
    console.error('Registration error:', err.response || err);
    alert('Registration failed');
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
      <button type="submit">Register</button>
      <p className="quote">"This is your journey. Begin it beautifully 💖"</p>
    </form>
    </div>
  );
};

export default Register;


