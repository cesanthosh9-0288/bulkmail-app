require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();

// CORS — allow frontend origin dynamically
app.use(cors({
  origin: process.env.FRONTEND_URL || "*" 
}));

app.use(express.json());

// ----------------------
// MongoDB Connection
// ----------------------
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.log("❌ DB Connection failed", err));

// ----------------------
// Collections
// ----------------------
const Credential = mongoose.model("credential", {}, "bulkmail");

const EmailHistory = mongoose.model(
  "emailhistory",
  {
    subject: String,
    message: String,
    recipients: [String],
    status: String,
    date: { type: Date, default: Date.now },
  },
  "emailhistory"
);

// ----------------------
// Admin Login
// ----------------------
const adminUsername = "san";
const adminPassword = "Qart76p2$";

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === adminUsername && password === adminPassword) {
    res.send(true);
  } else {
    res.send(false);
  }
});

// ----------------------
// Send Emails Endpoint
// ----------------------
app.post("/sendemail", async (req, res) => {
  const { subject, msg, emailList } = req.body;

  if (!emailList?.length || !msg) {
    return res.send({ success: false, error: "Missing message or recipient list" });
  }

  try {
    const data = await Credential.find();
    if (!data.length) return res.send({ success: false, error: "No email credentials found" });

    const user = data[0].toJSON().name || data[0].toJSON().user;
    const pass = data[0].toJSON().pass;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    console.log("Sending emails to:", emailList);

    for (const recipient of emailList) {
      try {
        await transporter.sendMail({
          from: user,
          to: recipient,
          subject,
          text: msg,
        });

        console.log("Email sent to:", recipient);
      } catch (mailError) {
        console.log("Mail error:", mailError);
        await EmailHistory.create({
          subject,
          message: msg,
          recipients: [recipient],
          status: "Failed",
        });
        return res.send({ success: false, error: `Failed to send to ${recipient}` });
      }
    }

    await EmailHistory.create({
      subject,
      message: msg,
      recipients: emailList,
      status: "Success",
    });

    res.send({ success: true });
  } catch (err) {
    console.log("Backend error:", err);
    res.send({ success: false, error: "Server error" });
  }
});

// ----------------------
// Fetch Email History
// ----------------------
app.get("/emailhistory", async (req, res) => {
  try {
    const history = await EmailHistory.find().sort({ date: -1 });
    res.send(history);
  } catch (err) {
    console.log("History fetch error:", err);
    res.send([]);
  }
});

// ----------------------
// Start Server (dynamic port for Vercel)
// ----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
