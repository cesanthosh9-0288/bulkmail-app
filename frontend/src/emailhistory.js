import { useEffect, useState } from "react";
import axios from "axios";

function EmailHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await axios.get("http://localhost:5000/emailhistory");
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch email history:", err);
      }
    }

    fetchHistory();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-semibold mb-4 text-blue-700">📜 Email History</h2>
      {history.length === 0 ? (
        <p className="text-gray-600">No emails have been sent yet.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border px-3 py-2 text-left">Date</th>
              <th className="border px-3 py-2 text-left">Subject</th>
              <th className="border px-3 py-2 text-left">Recipients</th>
              <th className="border px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item._id}>
                <td className="border px-3 py-2">{new Date(item.date).toLocaleString()}</td>
                <td className="border px-3 py-2">{item.subject}</td>
                <td className="border px-3 py-2">{item.recipients.join(", ")}</td>
                <td className={`border px-3 py-2 font-semibold ${item.status === "Success" ? "text-green-600" : "text-red-600"}`}>
                  {item.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default EmailHistory;
