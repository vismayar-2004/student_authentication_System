import { useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");

  // Register
  const handleRegister = async () => {
    if (!name || !email || !password) return setMessage("Fill all fields");

    const res = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const text = await res.text();
    setMessage(text);
  };

  // Login
  const handleLogin = async () => {
    if (!email || !password) return setMessage("Enter email & password");

    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const text = await res.text();
      setMessage(text);
      return;
    }

    const data = await res.json();
    localStorage.setItem("token", data.token);
    setMessage("Login successful");
  };

  // Get Students
  const getStudents = async () => {
    const token = localStorage.getItem("token");
    if (!token) return setMessage("Please login first");

    const res = await fetch("http://localhost:3000/students", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const text = await res.text();
      setMessage("Unauthorized: " + text);
      return;
    }

    const data = await res.json();
    setStudents(data);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setStudents([]);
    setMessage("Logged out");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Register</h2>
      <input placeholder="Name" onChange={e => setName(e.target.value)} />
      <br />
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <br />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <br />
      <button onClick={handleRegister}>Register</button>

      <h2>Login</h2>
      <button onClick={handleLogin}>Login</button>
      <button onClick={logout}>Logout</button>

      <h2>Students</h2>
      <button onClick={getStudents}>Get Students</button>

      <p>{message}</p>
      <ul>
        {students.map(s => (
          <li key={s._id}>{s.name} ({s.email})</li>
        ))}
      </ul>
    </div>
  );
}

export default App;






