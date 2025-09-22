// Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">MindSpace 🌙</div>
          <div className="app-tagline">MindSpace – A Micro-Journaling & Mood Tracker App</div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-left">
            <h1 className="hero-title">
              Welcome to <span>MindSpace</span>
            </h1>
            <p className="tagline">
              Your cozy digital journal to track moods, write your heart, and grow 🌸
            </p>
            <p className="description">
              MindSpace is not just a journal — it's your emotional home. Track your mood daily, write tiny or big
              moments of your life, reflect on your thoughts, and let your mind breathe in a calm lavender world.
              Perfect for students, creators, or anyone who needs a quiet space online.
            </p>
          </div>

          <div className="hero-right">
            <div className="get-started-text">Get Started</div>
            <p className="quote">"You are enough just as you are 🌷"</p>
            <div className="nav-buttons">
              <button onClick={() => navigate('/login')}>Login</button>
              <button onClick={() => navigate('/register')}>Register</button>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature-box">
          <h3>📝 <span>Beautiful Journaling</span></h3>
          <p>Write private notes and log your daily thoughts in an aesthetic, minimalist editor.</p>
        </div>
        <div className="feature-box">
          <h3>🎭 <span>Mood Tracker</span></h3>
          <p>Track how you feel every day and notice patterns over time using mood tags.</p>
        </div>
        <div className="feature-box">
          <h3>📊 <span>Insights & Growth</span></h3>
          <p>Visualize your emotional trends and bloom in your calm digital space.</p>
        </div>
      </section>

      <footer className="footer">
        <p>💜 Made with love by Diksha • @MindSpace 2025</p>
      </footer>
    </div>
  );
};

export default Home;


