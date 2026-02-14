import { CheckCircle2, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full text-sm font-medium text-indigo-700">
              <Sparkles className="h-4 w-4" />
              Find Your Perfect Match
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Find compatible{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600">
                roommates
              </span>{" "}
              for university
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              Match with students who share your lifestyle, study habits, and
              interests. Make university housing stress-free.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>Verified students</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>Secure & private</span>
              </div>
            </div>
          </div>

          {/* Right: Visual/Mockup */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-purple-500"></div>
                  <div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    <div className="h-3 w-24 bg-gray-100 rounded mt-2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-100 rounded"></div>
                  <div className="h-3 w-5/6 bg-gray-100 rounded"></div>
                  <div className="h-3 w-4/6 bg-gray-100 rounded"></div>
                </div>
                <div className="flex gap-2 pt-4">
                  <div className="h-8 w-24 bg-indigo-100 rounded-full"></div>
                  <div className="h-8 w-24 bg-purple-100 rounded-full"></div>
                  <div className="h-8 w-24 bg-pink-100 rounded-full"></div>
                </div>
                <div className="pt-4 flex items-center justify-between border-t">
                  <div className="text-sm font-semibold text-indigo-600">
                    98% Match
                  </div>
                  <div className="h-10 w-28 bg-linear-to-r from-indigo-600 to-purple-600 rounded-lg"></div>
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg px-6 py-3 border border-gray-100">
              <div className="text-2xl font-bold text-gray-900">1000+</div>
              <div className="text-sm text-gray-600">Active Students</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
