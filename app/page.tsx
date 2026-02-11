export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-5xl font-bold text-gray-900">
          Uni Roommate Finder
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Find compatible roommates for university housing. Connect with
          students who match your lifestyle.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
            Get Started
          </button>
          <button className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition">
            Learn More
          </button>
        </div>
      </div>
    </main>
  );
}
