import React, { useRef, useEffect } from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { PaymentFormValues } from '@/lib/validationSchema';
import useTap from '@/hooks/useTap';

interface CardInputsProps {
  control: Control<PaymentFormValues>;
  errors: FieldErrors<PaymentFormValues>;
  isSubmitting: boolean;
  publicKey: string;
}

const CardInputs: React.FC<CardInputsProps> = ({
  control,
  errors,
  isSubmitting,
  publicKey
}) => {
  const { tap, loading, error } = useTap({
    publicKey,
    currencyCode: 'USD' 
  });
  
  const cardInputRef = useRef<HTMLDivElement>(null);
  
  // Field style classes
  const baseInputClass = "w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-colors";
  const validClass = `${baseInputClass} border-gray-300 focus:border-blue-500 focus:ring-blue-200`;
  const errorClass = `${baseInputClass} border-red-300 focus:border-red-500 focus:ring-red-200`;
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim();
  };
  
  // Format expiry date
  const formatExpiryDate = (value: string) => {
    value = value.replace(/\D/g, '');
    
    if (value.length > 2) {
      return `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    
    return value;
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
          Cardholder Name
        </label>
        <Controller
          name="cardholderName"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              id="cardholderName"
              placeholder="Name on card"
              className={errors.cardholderName ? errorClass : validClass}
              disabled={isSubmitting}
              autoComplete="cc-name"
            />
          )}
        />
        {errors.cardholderName && (
          <p className="mt-1 text-sm text-red-600">{errors.cardholderName.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
          Card Number
        </label>
        <Controller
          name="cardNumber"
          control={control}
          render={({ field: { onChange, value, ...restField } }) => (
            <input
              {...restField}
              type="text"
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              className={errors.cardNumber ? errorClass : validClass}
              value={value ? formatCardNumber(value) : ''}
              onChange={(e) => onChange(e.target.value.replace(/\s/g, ''))}
              disabled={isSubmitting}
              autoComplete="cc-number"
              maxLength={19}
            />
          )}
        />
        {errors.cardNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date
          </label>
          <Controller
            name="expiryDate"
            control={control}
            render={({ field: { onChange, value, ...restField } }) => (
              <input
                {...restField}
                type="text"
                id="expiryDate"
                placeholder="MM/YY"
                className={errors.expiryDate ? errorClass : validClass}
                value={value ? formatExpiryDate(value) : ''}
                onChange={(e) => onChange(formatExpiryDate(e.target.value))}
                disabled={isSubmitting}
                autoComplete="cc-exp"
                maxLength={5}
              />
            )}
          />
          {errors.expiryDate && (
            <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
            CVC
          </label>
          <Controller
            name="cvc"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                id="cvc"
                placeholder="123"
                className={errors.cvc ? errorClass : validClass}
                disabled={isSubmitting}
                autoComplete="cc-csc"
                maxLength={4}
              />
            )}
          />
          {errors.cvc && (
            <p className="mt-1 text-sm text-red-600">{errors.cvc.message}</p>
          )}
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {error.message}
        </div>
      )}
    </div>
  );
};

export default CardInputs; 