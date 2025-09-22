// components/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../service/api';
import '../styles/login.css'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await api.post('/login', form); // backend sets cookie
      localStorage.setItem('auth', true); // frontend login check
      navigate('/Dashboard');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="login-body">
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
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
      <button type="submit">Login</button>
      <p className="quote">"You deserve a safe space for your thoughts 💫"</p>
    </form>
    </div>
  );
};

export default Login;