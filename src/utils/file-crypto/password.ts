/**
 * Password validation and strength checking utilities
 */

export interface PasswordStrength {
  score: number; // 0-4
  label: string; // 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'
  color: string; // Tailwind color class
  feedback: string[];
}

/**
 * Validate password matches confirmation
 */
export function validatePasswordMatch(password: string, confirmation: string): boolean {
  return password === confirmation;
}

/**
 * Calculate password strength
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const feedback: string[] = [];

  if (!password) {
    return {
      score: 0,
      label: 'No Password',
      color: 'text-gray-400',
      feedback: ['Please enter a password'],
    };
  }

  // Length scoring
  if (password.length >= 8){
    score += 1;
  }
  if (password.length >= 12) {
    score += 1;
  }
  if (password.length >= 16) {
    score += 1;
  }

  // Character variety scoring
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z\d]/.test(password);

  const varietyCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  
  if (varietyCount >= 2) {
    score += 1;
  } 
  if (varietyCount >= 3) {
    score += 1;
  }
  if (varietyCount === 4) {
    score += 1;
  }

  // Common patterns (reduce score)
  const commonPatterns = [
    // Sequential numbers
    /^123+/,
    /234|345|456|567|678|789/,
    // Sequential letters
    /^abc+/i,
    /bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i,
    // Keyboard patterns
    /qwerty|asdfgh|zxcvbn|qazwsx|zaq1xsw2/i,
    // Common words
    /password|admin|letmein|welcome|monkey|dragon|master|football|baseball|soccer/i,
    // Date patterns
    /19[0-9]{2}|20[0-9]{2}|0[1-9]|1[0-2]/,
    // Repeated characters
    /^(.)\1+$/, // All same character
    /(.)\1{2,}/, // Three or more of same character
  ];

  if (commonPatterns.some((pattern) => pattern.test(password))) {
    score = Math.max(0, score - 2);
    feedback.push('Avoid common patterns and words');
  }

  // Generate feedback
  if (password.length < 12) {
    feedback.push('Use at least 12 characters for better security');
  }

  if (!hasUpper || !hasLower) {
    feedback.push('Include both uppercase and lowercase letters');
  }

  if (!hasNumber) {
    feedback.push('Include at least one number');
  }

  if (!hasSpecial) {
    feedback.push('Include special characters (!@#$%^&*)');
  }

  // Cap score at 4
  score = Math.min(4, score);

  // Determine label and color
  let label: string;
  let color: string;

  switch (score) {
    case 0:
    case 1:
      label = 'Very Weak';
      color = 'text-red-600';
      break;
    case 2:
      label = 'Weak';
      color = 'text-orange-600';
      break;
    case 3:
      label = 'Fair';
      color = 'text-yellow-600';
      break;
    case 4:
      label = 'Strong';
      color = 'text-green-600';
      break;
    default:
      label = 'Unknown';
      color = 'text-gray-600';
  }

  // If very strong, override label
  if (score === 4 && password.length >= 16 && varietyCount === 4) {
    label = 'Very Strong';
    color = 'text-green-700';
  }

  return {
    score,
    label,
    color,
    feedback: feedback.length > 0 ? feedback : ['Password strength is good'],
  };
}