import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Login from "./login";
import EmailHistory from "./emailhistory";
import axios from "axios";
import * as XLSX from "xlsx";

// Use environment variable for backend URL
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

function App() {
  const [msg, Setmsg] = useState("");
  const [status, Setstatus] = useState(false);
  const [emailList, SetemailList] = useState([]);
  const [subject, SetSubject] = useState("");
  const navigate = useNavigate();

  // Check if admin is logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) navigate("/login");
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  function handlemsg(event) {
    Setmsg(event.target.value);
  }

  function handlefile(evt) {
    const file = evt.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const emailRows = XLSX.utils.sheet_to_json(worksheet, { header: "A" });
      const totalemail = emailRows.map((item) => item.A);
      SetemailList(totalemail);
    };

    reader.readAsBinaryString(file);
  }

  async function send() {
    if (emailList.length === 0) {
      alert("❌ Please upload a file with recipient emails.");
      return;
    }

    if (!msg.trim()) {
      alert("❌ Please write a message.");
      return;
    }

    Setstatus(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/sendemail`, { subject, msg, emailList });

      if (res.data.success) {
        alert("✅ All emails sent successfully!");

        // Reset all fields after success
        SetSubject("");
        Setmsg("");
        SetemailList([]);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";

      } else {
        alert(`❌ Error: ${res.data.error}`);
      }

    } catch (err) {
      alert("❌ Could not connect to server.");
    } finally {
      Setstatus(false);
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/bulkmail"
        element={
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-start pt-10">
            <div className="w-full max-w-4xl flex justify-between mb-4 px-4">
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Logout
              </button>
              <button
                onClick={() => navigate("/emailhistory")}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                View Email History
              </button>
            </div>

            <div className="max-w-lg w-full bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200">
              <h1 className="text-3xl font-semibold text-center text-blue-700 mb-2">📧 BULK EMAIL App</h1>
              <p className="text-center text-gray-700 mb-6">
                Send multiple emails effortlessly.<br />
                Upload an Excel file with recipients and send bulk messages.<br />
              </p>

              <div className="mb-5">
                <label className="block text-gray-800 font-medium mb-1">Subject:</label>
                <input
                  type="text"
                  onChange={(e) => SetSubject(e.target.value)}
                  value={subject}
                  placeholder="Enter email subject"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
              </div>

              <div className="mb-5">
                <label className="block text-gray-800 font-medium mb-1">Message:</label>
                <textarea
                  onChange={handlemsg}
                  value={msg}
                  rows="6"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  placeholder="Write your email message here..."
                />
              </div>

              <div className="mb-5">
                <label className="block text-gray-800 font-medium mb-1">Upload Recipients (Excel):</label>
                <input
                  type="file"
                  onChange={handlefile}
                  className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                />
              </div>

              <p>Total emails in file: {emailList.length}</p>

              <button
                onClick={send}
                disabled={status}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        }
      />
      <Route path="/emailhistory" element={<EmailHistory />} />
    </Routes>
  );
}

export default App;
