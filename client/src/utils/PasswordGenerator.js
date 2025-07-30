/**
 * Password Generator Utility
 * Generates secure random temporary passwords for new accounts
 */

/**
 * Generate a secure random temporary password
 * @param {number} length - Length of password (default: 12)
 * @returns {string} - Generated password
 */
export const generateTemporaryPassword = (length = 12) => {
  const charset = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  };

  let password = "";

  // Ensure at least one character from each category
  password +=
    charset.uppercase[
      Math.floor(Math.random() * charset.uppercase.length)
    ];
  password +=
    charset.lowercase[
      Math.floor(Math.random() * charset.lowercase.length)
    ];
  password +=
    charset.numbers[
      Math.floor(Math.random() * charset.numbers.length)
    ];
  password +=
    charset.symbols[
      Math.floor(Math.random() * charset.symbols.length)
    ];

  // Fill the rest with random characters from all categories
  const allChars =
    charset.uppercase +
    charset.lowercase +
    charset.numbers +
    charset.symbols;
  for (let i = 4; i < length; i++) {
    password +=
      allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password to make it more random
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

/**
 * Generate a more readable temporary password (for email communication)
 * @param {number} length - Length of password (default: 10)
 * @returns {string} - Generated readable password
 */
export const generateReadableTemporaryPassword = (
  length = 10
) => {
  const consonants = "bcdfghjklmnpqrstvwxz";
  const vowels = "aeiouy";
  const numbers = "0123456789";

  let password = "";

  // Generate readable pattern: consonant-vowel-consonant-number
  for (let i = 0; i < length; i += 4) {
    if (i < length)
      password +=
        consonants[
          Math.floor(Math.random() * consonants.length)
        ];
    if (i + 1 < length)
      password +=
        vowels[Math.floor(Math.random() * vowels.length)];
    if (i + 2 < length)
      password +=
        consonants[
          Math.floor(Math.random() * consonants.length)
        ];
    if (i + 3 < length)
      password +=
        numbers[Math.floor(Math.random() * numbers.length)];
  }

  // Capitalize first letter
  return (
    password.charAt(0).toUpperCase() + password.slice(1)
  );
};

/**
 * Validate that a generated password meets complexity requirements
 * @param {string} password - Password to validate
 * @returns {boolean} - Whether password meets requirements
 */
export const validateGeneratedPassword = (password) => {
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial =
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isLongEnough = password.length >= 8;

  return (
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecial &&
    isLongEnough
  );
};
