const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------
// MongoDB Connection
// ----------------------
mongoose.connect("mongodb+srv://san:123@cluster0.lnyu3vm.mongodb.net/passkey?appName=Cluster0")
  .then(() => console.log("✅ Connected to DB"))
  .catch(() => console.log("❌ DB Connection failed"));

// ----------------------
// MongoDB Collections
// ----------------------

// Credentials for sending email
const Credential = mongoose.model("credential", {}, "bulkmail");

// Email history collection
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
// Hardcoded Admin Login
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

  if (!emailList || emailList.length === 0 || !msg) {
    return res.send({ success: false, error: "Missing message or recipient list" });
  }

  try {
    const data = await Credential.find();
    if (!data || data.length === 0) {
      return res.send({ success: false, error: "No email credentials found" });
    }

    const user = data[0].toJSON().name || data[0].toJSON().user;
    const pass = data[0].toJSON().pass;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    console.log("Sending emails to:", emailList);

    // Send emails sequentially
    for (let i = 0; i < emailList.length; i++) {
      try {
        await transporter.sendMail({
          from: user,
          to: emailList[i],
          subject: subject,
          text: msg,
        });
        console.log("Email sent to:", emailList[i]);
      } catch (mailError) {
        console.log("Mail error:", mailError);

        // Log failed email
        await EmailHistory.create({
          subject,
          message: msg,
          recipients: [emailList[i]],
          status: "Failed",
        });

        return res.send({ success: false, error: `Failed to send to ${emailList[i]}` });
      }
    }

    // Log successful email batch
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
// Fetch Email History Endpoint
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
// Start Server
// ----------------------
app.listen(5000, () => {
  console.log("✅ Server running on port 5000");
});
