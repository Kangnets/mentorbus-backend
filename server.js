const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let userData = {}; // Store user data by insta (Instagram handle) as key
let totalClicks = 0;
let totalCardClicks = 0;
let totalPayClicks = 0;
let totalReservClicks = 0;

// Save the user data to the server using insta as the key
app.post("/onboarding/mentor", (req, res) => {
  const { nickname, position, job, major } = req.body;

  if (!nickname) {
    return res.status(400).json({ message: "Insta handle is required" });
  }

  // Save the data associated with the insta handle
  userData[nickname] = {
    nickname,
    position,
    job,
    major,
  };

  res.status(200).json({ message: "Data saved successfully" });
});

// Save the user data to the server using insta as the key
app.post("/onboarding/menti", (req, res) => {
  const { nickname, position, school, interest, want } = req.body;

  if (!nickname) {
    return res.status(400).json({ message: "Insta handle is required" });
  }

  // Save the data associated with the insta handle
  userData[nickname] = {
    nickname,
    position,
    school,
    interest,
    want,
  };

  res.status(200).json({ message: "Data saved successfully" });
});

app.listen(5002, () => {
  console.log("Server running on port 5002");
});
