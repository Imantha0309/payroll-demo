/**
 * Sri Lankan Phone Number Validation
 * Supports both mobile and landline numbers
 */

export const MOBILE_PREFIXES = ['070', '071', '072', '073', '074', '075', '076', '077', '078', '079'];

export const LANDLINE_PREFIXES = [
  '011', '012', '021', '022', '031', '032', '033', '034', '035', '036',
  '037', '041', '042', '043', '044', '045', '046', '047', '048', '049'
];

/**
 * Validates if a phone number is a valid Sri Lankan phone number
 * Accepts both mobile (070-079) and landline (geographic codes)
 * @param {string} phoneNumber - The phone number to validate (10 digits with leading 0)
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidSriLankanPhone = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') return false;
  
  // Remove spaces and dashes
  const cleaned = phoneNumber.replace(/[\s-]/g, '');
  
  // Must be exactly 10 digits
  if (!/^\d{10}$/.test(cleaned)) return false;
  
  // Check if it matches any valid prefix
  const prefix = cleaned.substring(0, 3);
  return MOBILE_PREFIXES.includes(prefix) || LANDLINE_PREFIXES.includes(prefix);
};

/**
 * Gets the type of phone number (mobile or landline)
 * @param {string} phoneNumber - The phone number
 * @returns {string} - 'mobile', 'landline', or 'invalid'
 */
export const getPhoneNumberType = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') return 'invalid';
  
  const cleaned = phoneNumber.replace(/[\s-]/g, '');
  if (!/^\d{10}$/.test(cleaned)) return 'invalid';
  
  const prefix = cleaned.substring(0, 3);
  if (MOBILE_PREFIXES.includes(prefix)) return 'mobile';
  if (LANDLINE_PREFIXES.includes(prefix)) return 'landline';
  return 'invalid';
};

/**
 * Regex pattern for phone validation
 * Accepts 10 digits starting with valid Sri Lankan prefixes
 */
export const SRILANKA_PHONE_REGEX = /^(0[0-3][0-9]|0[4-7][0-9]|07[0-9])\d{7}$/;
