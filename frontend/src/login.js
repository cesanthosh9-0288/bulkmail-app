import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleUser = (evt) => setUser(evt.target.value);
  const handlePass = (evt) => setPass(evt.target.value);

  const check = () => {
    if (user.trim() === "" || pass.trim() === "") {
      setError("Please fill in both fields");
      return;
    }

    axios
      .post(`${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/login`, { username: user, password: pass })
      .then((res) => {
        if (res.data === true) {
          // Store login state
          localStorage.setItem("isLoggedIn", "true");
          navigate("/bulkmail"); // redirect to bulk mail page
        } else {
          setError("Invalid username or password");
        }
      })
      .catch(() => {
        setError("Server error. Please try again.");
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>

        <input
          type="text"
          placeholder="Username"
          value={user}
          onChange={handleUser}
          className="w-full mb-4 p-2 border border-gray-300 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={pass}
          onChange={handlePass}
          className="w-full mb-4 p-2 border border-gray-300 rounded"
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          onClick={check}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;