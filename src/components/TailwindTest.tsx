export default function TailwindTest() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        Tailwind Test Component
      </h1>
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <p className="text-gray-800">This is a test card with hover effect</p>
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
          Test Button
        </button>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-100 p-4 rounded">Grid Item 1</div>
          <div className="bg-yellow-100 p-4 rounded">Grid Item 2</div>
        </div>
      </div>
    </div>
  );
} 