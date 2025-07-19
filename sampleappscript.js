// Google Apps Script (script.google.com)
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Open the spreadsheet by ID (from your URL)
    const SPREADSHEET_ID = "15Ui8ZynPke9NzLs2rMmjMlEONN7RjkuXzpQS99PSuM0";
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // Get the first sheet (or you can use getSheetByName('YourSheetName'))
    const sheet = ss.getSheets()[0];

    // If no headers yet, write them in row 1
    if (sheet.getLastRow() === 0) {
      const headers = [
        "Timestamp",
        "Name",
        "Email",
        "Phone",
        "Age",
        "Gender",
        "Q1_Exercise",
        "Q2_Sleep",
        "Q3_Diet",
        "Q4_Water",
        "Q5_Pain_Free",
        "Q6_Mental_Sharp",
        "Q7_Happy",
        "Q8_Anxiety",
        "Q9_Stress_Management",
        "Q10_Avoid_Smoking_Alcohol",
        "Q11_Work_Life_Balance",
        "Q12_Hobbies",
        "Q13_Screen_Time",
        "Q14_Relationships",
        "Q15_Purpose",
        "Q16_Life_Satisfaction",
        "Score",
        "Grade",
        "Description",
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }

    // Build the row to append
    const row = [
      data.timestamp,
      data.personalDetails.name,
      data.personalDetails.email,
      data.personalDetails.phone,
      data.personalDetails.age,
      data.personalDetails.gender,
      data.responses.q1 || "",
      data.responses.q2 || "",
      data.responses.q3 || "",
      data.responses.q4 || "",
      data.responses.q5 || "",
      data.responses.q6 || "",
      data.responses.q7 || "",
      data.responses.q8 || "",
      data.responses.q9 || "",
      data.responses.q10 || "",
      data.responses.q11 || "",
      data.responses.q12 || "",
      data.responses.q13 || "",
      data.responses.q14 || "",
      data.responses.q15 || "",
      data.responses.q16 || "",
      data.result.score,
      data.result.grade,
      data.result.description,
    ];

    // Append the row
    sheet.appendRow(row);

    // Return success
    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error("Error in doPost:", error);
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
