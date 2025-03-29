import React from 'react';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="container mx-auto py-20 text-center">
      <h1 className="text-8xl font-bold mb-6">404</h1>
      <h2 className="text-3xl mb-6">Page Not Found</h2>
      <p className="text-xl mb-10">Sorry, the page you are looking for doesn't exist or has been moved.</p>
      <Link href="/en" className="bg-blue-600 text-white py-3 px-6 rounded-full hover:bg-blue-700 transition">
        Return to Home
      </Link>
    </div>
  );
} 