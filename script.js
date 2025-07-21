// Add change listeners to all radio buttons to clear errors when answered
document.querySelectorAll('input[type="radio"]').forEach((radio) => {
  radio.addEventListener("change", function () {
    clearQuestionError(this.name);
    updateProgress();
  });
});

// Add input listeners for personal details
document
  .querySelectorAll(".personal-field input, .personal-field select")
  .forEach((input) => {
    input.addEventListener("input", function () {
      clearPersonalFieldError(this.name);
      updateProgress();
    });

    input.addEventListener("change", function () {
      clearPersonalFieldError(this.name);
      updateProgress();
    });
  });

// Function to validate personal details
function validatePersonalDetails() {
  const personalFields = [
    "name",
    "email",
    "phone",
    "age",
    "gender",
    "relationship",
    "rotarianName",
  ];
  const missingFields = [];
  const invalidFields = [];

  personalFields.forEach((fieldName) => {
    if (
      fieldName === "rotarianName" &&
      document.querySelector('[name="relationship"]').value === "rotarian"
    ) {
      return; // Skip validation for 'rotarianName' if 'relationship' is 'rotarian'
    }

    const field = document.querySelector(`[name="${fieldName}"]`);
    const value = field.value.trim();
    console.log(field, value);

    if (!value) {
      missingFields.push(fieldName);
      return;
    }

    // Specific validations
    switch (fieldName) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          invalidFields.push({
            field: fieldName,
            message: "Please enter a valid email address",
          });
        }
        break;
      case "phone":
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ""))) {
          invalidFields.push({
            field: fieldName,
            message: "Please enter a valid phone number",
          });
        }
        break;
      case "age":
        const age = parseInt(value);
        if (isNaN(age) || age < 1 || age > 120) {
          invalidFields.push({
            field: fieldName,
            message: "Please enter a valid age (1-120)",
          });
        }
        break;
    }
  });

  return { missingFields, invalidFields };
}

// Function to highlight missing personal fields
function highlightMissingPersonalFields(missingFields, invalidFields) {
  // Clear all previous error styling
  document.querySelectorAll(".personal-field.error").forEach((field) => {
    field.classList.remove("error");
  });

  // Add error styling to missing fields
  [...missingFields, ...invalidFields.map((f) => f.field)].forEach(
    (fieldName) => {
      const fieldElement = document
        .querySelector(`[name="${fieldName}"]`)
        .closest(".personal-field");
      if (fieldElement) {
        fieldElement.classList.add("error");
      }
    }
  );
}

// Function to clear error styling for personal fields
function clearPersonalFieldError(fieldName) {
  const fieldElement = document
    .querySelector(`[name="${fieldName}"]`)
    .closest(".personal-field");
  if (fieldElement) {
    fieldElement.classList.remove("error");
  }
}

// Function to highlight unanswered questions
function highlightMissingQuestions(missingQuestions) {
  // Clear all previous error styling
  document.querySelectorAll(".question.error").forEach((question) => {
    question.classList.remove("error");
  });

  // Add error styling to missing questions
  missingQuestions.forEach((questionName) => {
    const questionElement = document
      .querySelector(`input[name="${questionName}"]`)
      .closest(".question");
    if (questionElement) {
      questionElement.classList.add("error");
    }
  });
}

// Function to clear error styling for a specific question
function clearQuestionError(questionName) {
  const questionElement = document
    .querySelector(`input[name="${questionName}"]`)
    .closest(".question");
  if (questionElement) {
    questionElement.classList.remove("error");
  }
}

// Function to scroll to first missing field
function scrollToFirstMissingField(missingFields, missingQuestions) {
  let firstMissing = null;

  if (missingFields.length > 0) {
    firstMissing = document.querySelector(`[name="${missingFields[0]}"]`);
  } else if (missingQuestions.length > 0) {
    firstMissing = document.querySelector(
      `input[name="${missingQuestions[0]}"]`
    );
  }

  if (firstMissing) {
    firstMissing.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    firstMissing.focus();
  }
}

// Function to validate all questions are answered
function validateForm() {
  const missingQuestions = [];

  // Check each question from 1 to 16
  for (let i = 1; i <= 16; i++) {
    const questionName = `q${i}`;
    const selectedOption = document.querySelector(
      `input[name="${questionName}"]:checked`
    );

    if (!selectedOption) {
      missingQuestions.push(questionName);
    }
  }

  return missingQuestions;
}

// Function to display validation error message
function showValidationError(personalValidation, missingQuestions) {
  // Remove any existing error message
  const existingError = document.getElementById("validation-error");
  if (existingError) {
    existingError.remove();
  }

  // Create error message
  const errorDiv = document.createElement("div");
  errorDiv.id = "validation-error";
  errorDiv.style.cssText = `
        background: #f8d7da;
        color: #721c24;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #f5c6cb;
        margin: 20px 0;
        font-weight: 600;
        text-align: left;
        animation: fadeIn 0.3s ease-in-out;
    `;

  let message = "<strong>Please complete the following:</strong><br>";

  if (personalValidation.missingFields.length > 0) {
    const fieldNames = personalValidation.missingFields
      .map(
        (f) => f.charAt(0).toUpperCase() + f.slice(1).replace(/([A-Z])/g, " $1")
      )
      .join(", ");
    message += `• Missing personal details: ${fieldNames}<br>`;
  }

  if (personalValidation.invalidFields.length > 0) {
    personalValidation.invalidFields.forEach((invalid) => {
      const fieldName =
        invalid.field.charAt(0).toUpperCase() + invalid.field.slice(1);
      message += `• ${fieldName}: ${invalid.message}<br>`;
    });
  }

  if (missingQuestions.length > 0) {
    const questionNumbers = missingQuestions
      .map((q) => q.replace("q", ""))
      .sort((a, b) => parseInt(a) - parseInt(b));
    message += `• Missing health questions: ${questionNumbers.join(", ")}<br>`;
  }

  errorDiv.innerHTML = message;

  // Insert error message before the submit button
  const submitBtn = document.querySelector(".submit-btn");
  submitBtn.parentNode.insertBefore(errorDiv, submitBtn);

  // Auto-remove error message after 15 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 15000);
}

// Progress tracking
function updateProgress() {
  const totalFields = 21; // 5 personal details + 16 health questions
  let completedFields = 0;

  // Check personal details
  [
    "name",
    "email",
    "phone",
    "age",
    "gender",
    "relationship",
    "rotarianName",
  ].forEach((fieldName) => {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (field && field.value.trim()) {
      completedFields++;
    }
  });

  // Check health questions
  for (let i = 1; i <= 16; i++) {
    const questionName = `q${i}`;
    const selectedOption = document.querySelector(
      `input[name="${questionName}"]:checked`
    );
    if (selectedOption) {
      completedFields++;
    }
  }

  const progressIndicator = document.getElementById("progressIndicator");
  progressIndicator.textContent = `${completedFields}/${totalFields}`;

  if (completedFields === totalFields) {
    progressIndicator.classList.add("complete");
    progressIndicator.textContent = "✓ Ready to Submit";
  } else {
    progressIndicator.classList.remove("complete");
  }
}

// Handle form submission with validation
document
  .getElementById("healthForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // Validate personal details
    const personalValidation = validatePersonalDetails();

    // Validate health questions
    const missingQuestions = validateForm();

    if (
      personalValidation.missingFields.length > 0 ||
      personalValidation.invalidFields.length > 0 ||
      missingQuestions.length > 0
    ) {
      // Show validation error
      showValidationError(personalValidation, missingQuestions);
      highlightMissingPersonalFields(
        personalValidation.missingFields,
        personalValidation.invalidFields
      );
      highlightMissingQuestions(missingQuestions);
      scrollToFirstMissingField(
        personalValidation.missingFields,
        missingQuestions
      );
      return; // Stop submission
    }

    // Remove any existing validation error message
    const existingError = document.getElementById("validation-error");
    if (existingError) {
      existingError.remove();
    }

    // Show loading
    document.getElementById("loading").style.display = "block";
    this.style.display = "none";

    // Collect form data
    const formData = new FormData(this);
    const responses = {};
    const personalDetails = {};

    // Get personal details
    [
      "name",
      "email",
      "phone",
      "age",
      "gender",
      "relationship",
      "rotarianName",
    ].forEach((field) => {
      personalDetails[field] = formData.get(field);
    });

    // Include 'rotarianName' if it is visible
    if (rotarianNameField?.value?.trim()) {
      personalDetails["rotarianName"] = rotarianNameField.value.trim();
    }

    console.log("Rotarian Name:", personalDetails["rotarianName"]);

    // Get all health question responses
    for (let i = 1; i <= 16; i++) {
      const questionName = `q${i}`;
      const value = formData.get(questionName);
      if (value) {
        responses[questionName] = value;
      }
    }

    // Get follow-up response for Q8 if applicable
    const q8Frequency = formData.get("q8_frequency");
    if (q8Frequency) {
      responses["q8_frequency"] = q8Frequency;
    }

    try {
      // Submit to backend

      console.log(
        JSON.stringify({
          personalDetails: personalDetails,
          responses: responses,
          timestamp: new Date().toISOString(),
        })
      );
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalDetails: personalDetails,
          responses: responses,
          timestamp: new Date().toISOString(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        displayResults(result);
      } else {
        throw new Error(result.error || "Submission failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("There was an error submitting your assessment. Please try again.");
      // Show form again
      document.getElementById("loading").style.display = "none";
      this.style.display = "block";
    }
  });

function displayResults(result) {
  // Hide loading
  document.getElementById("loading").style.display = "none";

  // Show results
  const resultsDiv = document.getElementById("results");
  const scoreDisplay = document.getElementById("scoreDisplay");
  const gradeDisplay = document.getElementById("gradeDisplay");
  const descriptionDisplay = document.getElementById("descriptionDisplay");

  scoreDisplay.textContent = `${result.score} / 16`;
  gradeDisplay.textContent = `Grade: ${result.grade}`;
  gradeDisplay.className = `grade grade-${result.grade}`;
  descriptionDisplay.textContent = result.description;

  resultsDiv.style.display = "block";
  resultsDiv.scrollIntoView({ behavior: "smooth" });
}

// Add visual feedback for required questions on page load
document.addEventListener("DOMContentLoaded", function () {
  // Add required indicators to question text
  document.querySelectorAll(".question-text").forEach((questionText) => {
    const requiredSpan = document.createElement("span");
    requiredSpan.textContent = " *";
    requiredSpan.style.color = "#dc3545";
    requiredSpan.style.fontWeight = "bold";
    questionText.appendChild(requiredSpan);
  });

  // Add required notice at the top of the form
  const requiredNotice = document.createElement("div");
  requiredNotice.style.cssText = `
        background: #d1ecf1;
        color: #0c5460;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #bee5eb;
        margin-bottom: 30px;
        font-weight: 600;
        text-align: center;
    `;
  requiredNotice.innerHTML =
    '📋 All fields marked with <span style="color: #dc3545;">*</span> are required';

  const firstSection = document.querySelector(".section");
  firstSection.parentNode.insertBefore(requiredNotice, firstSection);

  // Initialize progress
  updateProgress();
});

// Add event listener for 'Connection to Rotary' dropdown
const relationshipDropdown = document.getElementById("relationship");
const rotarianNameField = document.getElementById("rotarianNameField");
const rotarianNameInput = document.getElementById("rotarianName");

relationshipDropdown.addEventListener("change", function () {
  const selectedValue = this.value;

  if (
    selectedValue === "spouse" ||
    selectedValue === "ann" ||
    selectedValue === "rotal"
  ) {
    rotarianNameField.style.display = "block";
    rotarianNameInput.setAttribute("required", "required");
  } else if (selectedValue === "rotarian") {
    rotarianNameField.style.display = "none";
    rotarianNameInput.removeAttribute("required");
    rotarianNameInput.value = ""; // Clear the field when switching to Rotarian
  } else {
    rotarianNameField.style.display = "none";
    rotarianNameInput.removeAttribute("required");
    rotarianNameInput.value = ""; // Clear the field when hidden
  }
});
