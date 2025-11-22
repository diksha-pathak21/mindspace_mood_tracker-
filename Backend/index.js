const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const nodemailer = require("nodemailer");


const PORT = 3000;
const app = express();

app.use(cookieParser());//its required so that we can read tokens stored in cookies

app.use(cors({
    origin:'http://localhost:5173',//only allows requests from react app running on this port
    credentials:true//allows sending cookies and headers
}));

app.use(express.json()); // To parse JSON bodies and convert to usable javascript bodies and data is available in req.body

const authMiddleware = (req, res, next) => {//its a middleware which allows requests to continue only if a valid jwt token exists in the cookies
  const token = req.cookies.token;//grabs the token from users browser cookies

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);//verifies the token
    req.user = decoded.id;//adds the decoded token to the request object
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};
const pool = new Pool({
    user: 'postgres',      // Your postgres username
    host: 'localhost',
    database: 'mindspace_db',
    password: 'root',  // Replace with your actual password
    port: 5432,
});

const transporter = nodemailer.createTransport({//created a connection to gmail
  service: "gmail",//use gmail server
  auth: {//login credentials for gmail
    user: process.env.EMAIL_USER, //my gmail id
    pass: process.env.EMAIL_PASS, //my app password
  },
});

//test code for checking
// transporter.verify((error, success) => {
//   if (error) {
//     console.log("Error connecting to Gmail:", error);
//   } else {
//     console.log("Google Mail Server is ready to take messages!");
//   }
// });

app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Verification Code",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      "INSERT INTO email_otps (email, otp, expires_at) VALUES ($1, $2, $3)",
      [email, String(otp), expiresAt]
    );

    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error sending OTP" });
  }
});

app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    // Find OTP in DB
    const result = await pool.query(
      "SELECT * FROM email_otps WHERE email = $1 AND otp = $2 ORDER BY id DESC LIMIT 1",
      [email,String(otp)]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const record = result.rows[0];

    // Check expiry
    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // OTP verified
    return res.json({ message: "OTP verified successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error verifying OTP" });
  }
});


app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if already exists
    const existing = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Check OTP record
    const otpRecord = await pool.query(
      "SELECT * FROM email_otps WHERE email = $1 ORDER BY id DESC LIMIT 1",
      [email]
    );

    if (otpRecord.rows.length === 0) {
      return res.status(400).json({ message: "OTP not verified" });
    }

    // hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Save user
    await pool.query(
      "INSERT INTO users (name, email, password_hashed) VALUES ($1, $2, $3)",
      [name, email, hashedPassword]
    );

    res.json({ message: "Registered successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Registration failed" });
  }
});




//IN OUR API CALLS, THE FIRST ARGUMENT IS THE API ENDPOINT URL PATH
//This is for login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) return res.status(400).send('User not found');

    const user = result.rows[0];//it holds the user data that we fetched

    const isMatch = await bcrypt.compare(password, user.password_hashed);
    if (!isMatch) return res.status(401).send('Invalid credentials');

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });//here we are creating a jwt token for the user after he/she logins
    console.log('Generated token:', token);

res.cookie('token', token, {
  httpOnly: true,
  sameSite: 'Lax',  // ✅ Browser won't block this on localhost
  secure: false,    // ✅ OK for HTTP (not HTTPS)
});

    res.json({ message: 'Logged in successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'Lax'
  });
  res.json({ message: 'Logged out successfully' });
});

//This is for selecting users
app.get('/journal',authMiddleware, async (req, res) => {
    try {
        const userId = req.user;
        const result = await pool.query('SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY entry_date DESC', [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});//we send the get request at http://localhost:3000/users

//This is for creating
app.post('/journal',authMiddleware, async (req, res) => {
    const userId=req.user;
    const { mood, entry_text } = req.body;//we get our data after parsing

    try {
        const result = await pool.query(
      'INSERT INTO journal_entries (user_id, mood, entry_text) VALUES ($1, $2, $3) RETURNING *',
      [userId, mood, entry_text]
    );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

//this is for updating
app.put('/journal/:id',authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { mood, entry_text } = req.body;

    try {
        const result = await pool.query(
            'UPDATE journal_entries SET mood = $1, entry_text = $2 WHERE id = $3 AND user_id=$4 RETURNING *',
            [mood, entry_text, id,req.user]
        );

        if (result.rowCount === 0) {
            return res.status(404).send('User not found');
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

//this is for deleting
app.delete('/journal/:id',authMiddleware,async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
        'DELETE FROM journal_entries WHERE id = $1 AND user_id = $2',
        [id, req.user]
        );


        if (result.rowCount === 0) {
            return res.status(404).send('User not found');
        }

        res.send('User deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});




app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
