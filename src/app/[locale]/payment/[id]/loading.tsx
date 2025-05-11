export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-100 h-96 rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            <div className="h-36 bg-gray-200 rounded mt-8"></div>
            <div className="h-12 bg-gray-200 rounded mt-8"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 