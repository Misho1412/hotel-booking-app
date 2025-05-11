import React, { useState } from 'react';
import ButtonPrimary from '@/shared/ButtonPrimary';
import Alert from '@/shared/Alert';

const TestRegistration = () => {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const testRegistration = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    
    const testData = {
      username: "testuser" + Math.floor(Math.random() * 10000),
      email: `testuser${Math.floor(Math.random() * 10000)}@example.com`,
      password: "TestPassword123",
      confirm_password: "TestPassword123",
      phone_number: ""
    };
    
    try {
      console.log("Making direct registration API call with:", testData);
      
      // Get the API base URL - using the same as in authService
      const baseURL = process.env.NEXT_PUBLIC_AMR_API_URL || 'https://bookingengine.onrender.com';
      const fullURL = `${baseURL}/auth/api/v1/register/`;
      
      console.log("Registration URL:", fullURL);
      
      const response = await fetch(fullURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testData)
      });
      
      console.log("Registration response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Registration failed:", errorData);
        throw new Error(JSON.stringify(errorData) || `Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Registration successful:", data);
      
      setResult(JSON.stringify(data, null, 2));
    } catch (error: any) {
      console.error("Test registration error:", error);
      setError(error.message || "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="mt-8 p-4 border rounded-lg">
      <h3 className="text-lg font-medium mb-4">Test Direct Registration</h3>
      
      {result && (
        <Alert type="success" className="mb-4">
          Registration successful! Result:
          <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-40 dark:bg-gray-800">
            {result}
          </pre>
        </Alert>
      )}
      
      {error && (
        <Alert type="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      <ButtonPrimary
        onClick={testRegistration}
        disabled={isLoading}
      >
        {isLoading ? "Testing..." : "Test Direct Registration"}
      </ButtonPrimary>
      <p className="mt-2 text-sm text-gray-500">
        This will attempt to register a random test user directly using the Fetch API.
      </p>
    </div>
  );
};

export default TestRegistration; 