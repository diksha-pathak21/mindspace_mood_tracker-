import React, { useEffect, useState } from 'react';
import api from '../service/api';
import '../styles/dashboard.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [form, setForm] = useState({ mood: '', entry_text: '' });
  const [entries, setEntries] = useState([]);
  const [filterDays, setFilterDays] = useState('7');
  const navigate = useNavigate();

  const moodMap = {
    '😄': 4,
    '😐': 3,
    '😢': 2,
    '😠': 1
  };

  const moodWords = {
    1: { text: 'Angry', quote: "Breathe. You're stronger than your storm 💪" },
    2: { text: 'Sad', quote: "It’s okay to feel down. Brighter days are coming 🌈" },
    3: { text: 'Neutral', quote: "Stillness is power. Stay grounded 🧘‍♀️" },
    4: { text: 'Happy', quote: "Celebrate joy, no matter how small 💜" }
  };

  const handleLogout = () => {
    api.post('/logout').then(() => {
      localStorage.removeItem('auth');
      navigate('/login');
    });
  };

  const fetchEntries = async () => {
    const res = await api.get('/journal');
    const filtered = res.data.filter(entry => {
      const days = parseInt(filterDays);
      const entryDate = new Date(entry.entry_date);
      const today = new Date();
      const timeDiff = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
      return filterDays === 'all' || timeDiff <= days;
    });
    setEntries(filtered);
  };

  useEffect(() => {
    fetchEntries();
  }, [filterDays]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.mood || !form.entry_text) return alert("Please fill mood and entry");
    await api.post('/journal', form);
    setForm({ mood: '', entry_text: '' });
    fetchEntries();
  };

  const handleDelete = async (id) => {
    await api.delete(`/journal/${id}`);
    fetchEntries();
  };

  const handleEdit = async (entry) => {
    const newText = prompt('Edit entry:', entry.entry_text);
    if (newText !== null) {
      await api.put(`/journal/${entry.id}`, { ...entry, entry_text: newText });
      fetchEntries();
    }
  };

  // Group entries by date and calculate average mood per date
  const groupedData = entries.reduce((acc, entry) => {//loops over all journal entries and then group them by date
    const date = new Date(entry.entry_date).toLocaleDateString();
    const moodValue = moodMap[entry.mood];

    if (!acc[date]) {
      acc[date] = { total: 0, count: 0 };
    }
    acc[date].total += moodValue;
    acc[date].count += 1;

    return acc;
  }, {});

  const chartData = Object.entries(groupedData).map(([date, data]) => ({
    date,
    mood: parseFloat((data.total / data.count).toFixed(2)) // mood average
  }));
  <div style={{ paddingTop: '2rem' }}></div>

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <h2>Welcome back, beautiful soul 💜</h2>
        <button onClick={handleLogout}>Logout</button>
      </nav>

      <form className="mood-form" onSubmit={handleSubmit}>
        <label>🙃 How are you feeling today?</label>
        <div className="mood-options">
          {Object.keys(moodMap).map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={form.mood === emoji ? 'selected' : ''}
              onClick={() => setForm({ ...form, mood: emoji })}
            >
              {emoji}
            </button>
          ))}
        </div>

        <label>📝 Write a short note:</label>
        <textarea
          placeholder="I felt peaceful after journaling today..."
          value={form.entry_text}
          onChange={(e) => setForm({ ...form, entry_text: e.target.value })}
          maxLength="300"
        ></textarea>

        <button type="submit" className="submit-btn">Submit</button>
      </form>

      <section className="journal-history">
        <h3>📜 Journal History</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Mood</th>
              <th>Entry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>{new Date(entry.entry_date).toLocaleDateString()}</td>
                <td>{entry.mood}</td>
                <td>{entry.entry_text}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(entry)}>✏️</button>
                  <button className="delete-btn" onClick={() => handleDelete(entry.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="chart-section">
        <h3>📈 Mood Trend</h3>
        <label>Filter: </label>
        <select value={filterDays} onChange={(e) => setFilterDays(e.target.value)}>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="all">All time</option>
        </select>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis type="number" domain={[1, 4]} />
            <Tooltip />
            <Bar dataKey="mood" fill="#d891f5" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="mood-legend">
          {Object.entries(moodWords).map(([num, data]) => (
            <div key={num} className="mood-label">
              <strong>{data.text} ({num}):</strong> {data.quote}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;






