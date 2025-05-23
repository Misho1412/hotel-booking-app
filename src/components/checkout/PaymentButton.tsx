import React from 'react';

interface PaymentButtonProps {
  isSubmitting: boolean;
  amount: number;
  isDisabled?: boolean;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ 
  isSubmitting, 
  amount,
  isDisabled = false 
}) => {
  return (
    <button
      type="submit"
      disabled={isSubmitting || isDisabled}
      className={`w-full py-4 px-6 rounded-lg text-white font-semibold text-lg relative
        ${isSubmitting || isDisabled 
          ? 'bg-blue-300 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700 transition-colors'}`}
    >
      {isSubmitting ? (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </div>
      ) : (
        `Pay ${amount ? `$${amount.toFixed(2)}` : ''}`
      )}
    </button>
  );
};

export default PaymentButton; 