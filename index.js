const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const SECRET_KEY = "mysecretkey123";

// CORS setup
app.use(cors({
  origin: "http://localhost:3001",  // React frontend
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Connect MongoDB
mongoose.connect("mongodb+srv://vismayar:mongo123@cluster0.9dsijo1.mongodb.net/?appName=Cluster0")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Schema
const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const Student = mongoose.model("Student", StudentSchema);

// JWT Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).send("No token provided");

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).send("Invalid token format");
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send("Invalid or expired token");
  }
};

// Routes
app.get("/", (req, res) => {
  res.send("Backend running");
});

// Register
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).send("All fields required");

    const existing = await Student.findOne({ email });
    if (existing) return res.status(400).send("Email already registered");

    const hashedPassword = await bcrypt.hash(password, 10);
    await Student.create({ name, email, password: hashedPassword });
    res.send("Registered successfully");
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send("Email and password required");

  const student = await Student.findOne({ email });
  if (!student) return res.status(400).send("User not registered");

  const isMatch = await bcrypt.compare(password, student.password);
  if (!isMatch) return res.status(400).send("Invalid password");

  const token = jwt.sign({ id: student._id, email: student.email }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token });
});

// Protected route
app.get("/students", authMiddleware, async (req, res) => {
  const students = await Student.find({}, "-password"); // exclude password
  res.json(students);
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});



