// pages/api/submit.js
import fetch from "node-fetch";

const SCRIPT_URL = process.env.APPS_SCRIPT_URL;
if (!SCRIPT_URL) {
  throw new Error("APPS_SCRIPT_URL must be set in your env");
}

// Grade descriptions
const gradeDescriptions = {
  A:
    "Excellent - You maintain outstanding health habits across all " +
    "areas. Keep up the great work!",
  B:
    "Good - You have solid health foundations with room for minor " +
    "improvements.",
  C:
    "Fair - Your health is adequate, but there are several areas where " +
    "improvements could significantly benefit you.",
  D:
    "Poor - Your health habits need attention. Consider focusing on key " +
    "areas for improvement.",
  E:
    "Critical - Your health requires immediate attention. Consider " +
    "consulting healthcare professionals.",
};

function validatePersonalDetails(personalDetails) {
  const errors = [];
  const requiredFields = ["name", "email", "phone", "age", "gender"];

  // Check for missing fields
  requiredFields.forEach((field) => {
    if (!personalDetails[field] || !personalDetails[field].toString().trim()) {
      errors.push(`${field} is required`);
    }
  });

  // Validate email format
  if (personalDetails.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personalDetails.email)) {
      errors.push("Invalid email format");
    }
  }

  // Validate age
  if (personalDetails.age) {
    const age = parseInt(personalDetails.age);
    if (isNaN(age) || age < 1 || age > 120) {
      errors.push("Age must be between 1 and 120");
    }
  }

  // Validate phone (basic validation)
  if (personalDetails.phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = personalDetails.phone.replace(/[\s\-\(\)]/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      errors.push("Invalid phone number format");
    }
  }

  // Validate gender
  if (personalDetails.gender) {
    const validGenders = ["male", "female", "non-binary", "prefer-not-to-say"];
    if (!validGenders.includes(personalDetails.gender.toLowerCase())) {
      errors.push("Invalid gender selection");
    }
  }

  return errors;
}

function calculateScoreAndGrade(responses) {
  let score = 0;
  for (let i = 1; i <= 16; i++) {
    const ans = responses[`q${i}`];
    if (i === 8) {
      if (ans === "no") score += 1; // reverse scored
    } else if (ans === "yes") {
      score += 1;
    }
  }

  let grade;
  if (score >= 14) grade = "A";
  else if (score >= 11) grade = "B";
  else if (score >= 8) grade = "C";
  else if (score >= 5) grade = "D";
  else grade = "E";

  return { score, grade, description: gradeDescriptions[grade] };
}

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { personalDetails, responses, timestamp } = req.body;

    if (!personalDetails || typeof personalDetails !== "object") {
      return res.status(400).json({ error: "Personal details are required" });
    }

    if (!responses || typeof responses !== "object") {
      return res.status(400).json({ error: "Invalid responses data" });
    }
    console.log(responses)

    // Validate personal details
    const personalValidationErrors = validatePersonalDetails(personalDetails);
    if (personalValidationErrors.length > 0) {
      return res.status(400).json({
        error: "Personal details validation failed",
        validationErrors: personalValidationErrors,
      });
    }

    // Ensure all q1…q16 answered
    const required = Array.from({ length: 16 }, (_, i) => `q${i + 1}`);
    const missing = required.filter((q) => {
      const a = responses[q];
      return !a || !["yes", "no", "sometimes"].includes(a);
    });
    if (missing.length) {
      const nums = missing.map((q) => q.slice(1)).sort((a, b) => +a - +b);
      return res.status(400).json({
        error: "All questions must be answered",
        missingQuestions: nums,
        message:
          `Please answer question${nums.length > 1 ? "s" : ""}: ` +
          nums.join(", "),
      });
    }

    const result = calculateScoreAndGrade(responses);
    const payload = {
      timestamp: timestamp || new Date().toISOString(),
      personalDetails: {
        name: personalDetails.name.trim(),
        email: personalDetails.email.trim().toLowerCase(),
        phone: personalDetails.phone.trim(),
        age: parseInt(personalDetails.age),
        gender: personalDetails.gender.toLowerCase(),
      },
      responses,
      result,
    };

    // Send to Apps Script
    let savedToSheets = false;
    try {
      const r = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      savedToSheets = j.success === true;
    } catch (err) {
      console.warn("Apps Script write failed:", err);
    }

    return res.status(200).json({
      success: true,
      score: result.score,
      grade: result.grade,
      description: result.description,
      savedToSheets,
    });
  } catch (err) {
    console.error("Error processing submission:", err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
}
