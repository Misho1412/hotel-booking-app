import { z } from 'zod';

// Credit card validation helper functions
const isCreditCardValid = (value: string): boolean => {
  // Remove spaces and hyphens
  const cardNumber = value.replace(/[\s-]/g, '');
  
  // Check if contains only digits
  if (!/^\d+$/.test(cardNumber)) return false;
  
  // Luhn algorithm (mod 10)
  let sum = 0;
  let shouldDouble = false;

  // Loop from right to left
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i));

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return (sum % 10) === 0;
};

// Expiry date validation
const isExpiryValid = (value: string): boolean => {
  // Format: MM/YY
  const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
  if (!expiryRegex.test(value)) return false;

  const [month, year] = value.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  const expiryYear = parseInt(year);
  const expiryMonth = parseInt(month);

  // Check if expired
  if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
    return false;
  }

  return true;
};

// Create payment form schema
export const paymentFormSchema = z.object({
  cardholderName: z.string()
    .min(2, { message: 'Cardholder name must be at least 2 characters' })
    .max(100, { message: 'Cardholder name must not exceed 100 characters' }),
  
  email: z.string()
    .email({ message: 'Please enter a valid email address' }),
  
  phone: z.string()
    .optional()
    .refine((val) => !val || /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(val), {
      message: 'Please enter a valid phone number',
    }),
  
  cardNumber: z.string()
    .min(13, { message: 'Card number is too short' })
    .max(19, { message: 'Card number is too long' })
    .refine(isCreditCardValid, {
      message: 'Please enter a valid credit card number',
    }),
  
  expiryDate: z.string()
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, { 
      message: 'Expiry date must be in MM/YY format' 
    })
    .refine(isExpiryValid, {
      message: 'Card is expired or expiry date is invalid',
    }),
  
  cvc: z.string()
    .min(3, { message: 'CVC must be at least 3 digits' })
    .max(4, { message: 'CVC must not exceed 4 digits' })
    .regex(/^\d+$/, { message: 'CVC must contain only digits' })
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>; 