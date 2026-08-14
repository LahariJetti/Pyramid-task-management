"use client";

import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");

  function continueAsGuest() {
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    localStorage.setItem("guestName", name.trim());
    window.location.href = "/tasks";
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-xl font-bold text-white">
            P
          </div>

          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome to Pyramid
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Task management made simple.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Your name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm-gray-900 placeholder:text-gray-600 outline-none focus:border-black"
            />
          </div>

          <button
            onClick={continueAsGuest}
            className="w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Continue as Guest
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          No account required
        </p>
      </div>
    </main>
  );
}