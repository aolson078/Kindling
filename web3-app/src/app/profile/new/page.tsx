"use client";

import { useState } from "react";

export default function NewProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: submit profile data
    if (imageFile) {
      // placeholder to avoid unused variable lint warning
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden vignette noise-soft aurora-bg">
      <section className="relative mx-auto max-w-xl px-6 py-24 sm:py-32">
        <h1 className="gradient-title heading-serif text-4xl font-semibold tracking-tight">
          Create your profile
        </h1>
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="block text-sm" htmlFor="displayName">
              Display name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              required
              className="mt-1 w-full rounded-md border border-white/10 bg-black/10 p-2"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm" htmlFor="pronouns">
              Pronouns
            </label>
            <input
              id="pronouns"
              name="pronouns"
              type="text"
              className="mt-1 w-full rounded-md border border-white/10 bg-black/10 p-2"
              value={pronouns}
              onChange={(e) => setPronouns(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm" htmlFor="ageRange">
              Age range
            </label>
            <input
              id="ageRange"
              name="ageRange"
              type="text"
              className="mt-1 w-full rounded-md border border-white/10 bg-black/10 p-2"
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm" htmlFor="image">
              Profile image
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              className="mt-1 w-full"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>
          <button type="submit" className="btn-primary mt-4">
            Save profile
          </button>
        </form>
      </section>
    </main>
  );
}

