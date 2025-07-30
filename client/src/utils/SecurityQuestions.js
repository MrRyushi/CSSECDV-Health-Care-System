/**
 * Security Questions System
 * Implements secure password reset questions with sufficiently random answers
 * Avoids common answers like "The Bible" for "favorite book"
 */

// Secure security questions that require random answers
export const SECURITY_QUESTIONS = [
  {
    id: "first_pet_name",
    question: "What was the name of your first pet?",
    category: "personal",
    requiresRandomAnswer: true,
    commonAnswers: [
      "Buddy",
      "Max",
      "Fluffy",
      "Spot",
      "Rover",
      "Whiskers",
    ],
  },
  {
    id: "mother_maiden_name",
    question: "What is your mother's maiden name?",
    category: "family",
    requiresRandomAnswer: true,
    commonAnswers: [
      "Smith",
      "Johnson",
      "Williams",
      "Brown",
      "Jones",
      "Garcia",
    ],
  },
  {
    id: "childhood_street",
    question:
      "What was the name of the street you grew up on?",
    category: "personal",
    requiresRandomAnswer: true,
    commonAnswers: [
      "Main",
      "Oak",
      "Pine",
      "Elm",
      "Maple",
      "Cedar",
    ],
  },
  {
    id: "first_car_model",
    question: "What was the model of your first car?",
    category: "personal",
    requiresRandomAnswer: true,
    commonAnswers: [
      "Honda Civic",
      "Toyota Camry",
      "Ford Focus",
      "Chevrolet Impala",
    ],
  },
  {
    id: "elementary_school",
    question:
      "What was the name of your elementary school?",
    category: "education",
    requiresRandomAnswer: true,
    commonAnswers: [
      "Lincoln",
      "Washington",
      "Jefferson",
      "Roosevelt",
      "Kennedy",
    ],
  },
  {
    id: "favorite_color",
    question: "What is your favorite color?",
    category: "preference",
    requiresRandomAnswer: true,
    commonAnswers: [
      "Blue",
      "Red",
      "Green",
      "Black",
      "White",
      "Purple",
    ],
  },
  {
    id: "birth_city",
    question: "In which city were you born?",
    category: "personal",
    requiresRandomAnswer: true,
    commonAnswers: [
      "New York",
      "Los Angeles",
      "Chicago",
      "Houston",
      "Phoenix",
    ],
  },
  {
    id: "first_job_title",
    question: "What was your first job title?",
    category: "professional",
    requiresRandomAnswer: true,
    commonAnswers: [
      "Cashier",
      "Server",
      "Receptionist",
      "Assistant",
      "Intern",
    ],
  },
];

/**
 * Validate security question answer
 * Ensures answers are sufficiently random and not common
 * @param {string} questionId - ID of the security question
 * @param {string} answer - User's answer
 * @returns {Object} - Validation result
 */
export const validateSecurityAnswer = (
  questionId,
  answer
) => {
  const question = SECURITY_QUESTIONS.find(
    (q) => q.id === questionId
  );

  if (!question) {
    return {
      success: false,
      message: "Invalid security question",
    };
  }

  const normalizedAnswer = answer.trim().toLowerCase();

  // Check if answer is too short
  if (normalizedAnswer.length < 3) {
    return {
      success: false,
      message: "Answer must be at least 3 characters long",
    };
  }

  // Check if answer is too long
  if (normalizedAnswer.length > 50) {
    return {
      success: false,
      message: "Answer must be no more than 50 characters",
    };
  }

  // Check if answer contains only common words
  const commonAnswers = question.commonAnswers.map((a) =>
    a.toLowerCase()
  );
  if (commonAnswers.includes(normalizedAnswer)) {
    return {
      success: false,
      message:
        "Please provide a more specific answer. Common answers are not allowed for security reasons.",
    };
  }

  // Check if answer is too generic
  const genericWords = [
    "yes",
    "no",
    "maybe",
    "ok",
    "fine",
    "good",
    "bad",
    "nice",
    "cool",
  ];
  if (genericWords.includes(normalizedAnswer)) {
    return {
      success: false,
      message: "Please provide a more specific answer",
    };
  }

  // Check for minimum complexity (at least 3 characters and not too generic)
  if (normalizedAnswer.length < 3) {
    return {
      success: false,
      message: "Answer must be at least 3 characters long",
    };
  }

  // Check if answer is too short or too generic
  const genericAnswers = [
    "yes",
    "no",
    "maybe",
    "ok",
    "fine",
    "good",
    "bad",
    "nice",
    "cool",
    "car",
    "job",
    "street",
    "house",
    "home",
    "work",
    "school",
  ];

  if (genericAnswers.includes(normalizedAnswer)) {
    return {
      success: false,
      message: "Please provide a more specific answer",
    };
  }

  return {
    success: true,
    message: "Answer is valid",
  };
};

/**
 * Get random security questions for user setup
 * @param {number} count - Number of questions to return (default: 3)
 * @returns {Array} - Array of security questions
 */
export const getRandomSecurityQuestions = (count = 3) => {
  const shuffled = [...SECURITY_QUESTIONS].sort(
    () => 0.5 - Math.random()
  );
  return shuffled.slice(0, count);
};

/**
 * Hash security answer for secure storage
 * @param {string} answer - User's answer
 * @returns {Promise<string>} - Hashed answer
 */
export const hashSecurityAnswer = async (answer) => {
  // In a real implementation, you would use a proper hashing library
  // For now, we'll use a simple hash function
  const encoder = new TextEncoder();
  const data = encoder.encode(
    answer + process.env.REACT_APP_SECURITY_SALT ||
      "healthcare-salt"
  );
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    data
  );
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

/**
 * Verify security answer
 * @param {string} providedAnswer - Answer provided by user
 * @param {string} storedHash - Stored hash of the correct answer
 * @returns {Promise<boolean>} - Whether answer is correct
 */
export const verifySecurityAnswer = async (
  providedAnswer,
  storedHash
) => {
  const providedHash = await hashSecurityAnswer(
    providedAnswer
  );
  return providedHash === storedHash;
};

/**
 * Generate security questions setup for new users
 * @returns {Object} - Security questions setup data
 */
export const generateSecurityQuestionsSetup = () => {
  const questions = getRandomSecurityQuestions(3);

  return {
    questions: questions.map((q) => ({
      id: q.id,
      question: q.question,
      category: q.category,
    })),
    instructions:
      "Please provide specific, unique answers to these security questions. Avoid common answers like 'The Bible' for book questions or generic responses.",
  };
};
