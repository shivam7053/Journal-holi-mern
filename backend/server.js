const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config()
const cors = require("cors")

const app = express();
const PORT = process.env.PORT || 5000;
const JWT = process.env.JWT_SECRET;



// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// MongoDB schemas
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const EntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  content: { type: String, required: true },
  pdf: { type: String, required: true },
  reviewStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
});

const User = mongoose.model("User", UserSchema);
const Entry = mongoose.model("Entry", EntrySchema);

// Middleware
app.use(cors())
app.use(express.json());
// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  jwt.verify(token, JWT, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Middleware for error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Routes
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user._id }, JWT);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.post("/submit-entry",authenticateToken, upload.single("pdf"), async (req, res) => {
  try {
    const { title, content } = req.body;
    const pdfPath = req.file.path;
    const entry = new Entry({ title, content, pdf: pdfPath });
    await entry.save();
    res.status(201).json({ message: "Entry submitted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Route for retrieving entries awaiting review
app.get('/entries', authenticateToken, async (req, res) => {
  try {
    const entries = await Entry.find({ reviewStatus: 'pending' }).populate('user', 'email');
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route for reviewing entries
app.put('/entries/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewStatus } = req.body;
    const entry = await Entry.findByIdAndUpdate(id, { reviewStatus }, { new: true });
    res.json({ message: 'Entry reviewed successfully', entry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route for displaying approved entries
app.get('/journal', async (req, res) => {
  try {
    const entries = await Entry.find({ reviewStatus: 'approved' }).populate('user', 'email');
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve PDF files from the "uploads" directory
app.use('/pdf/uploads', express.static(path.join(__dirname, 'uploads')))

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
