"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ConnexionPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConnexion(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("ERREUR CONNEXION :", error);
      setMessage(error.message);
      setLoading(false);
      return;
    }

    console.log("CONNEXION RÉUSSIE !");

    router.push("/agence");
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">

          <div className="text-4xl mb-3">
            🏢
          </div>

          <h1 className="text-3xl font-bold text-green-700">
            Connexion FC Immo
          </h1>

          <p className="text-gray-600 mt-2">
            Connectez-vous à votre espace agence.
          </p>

        </div>

        <form
          onSubmit={handleConnexion}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
        >

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Email
            </label>

            <input
              type="email"
              placeholder="agence@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300"
              required
            />
          </div>

          <div className="mt-5">
            <label className="block font-medium text-gray-700 mb-2">
              Mot de passe
            </label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl"
          >
            {loading
              ? "Connexion..."
              : "Se connecter"}
          </button>

          {message && (
            <p className="text-center mt-5 text-red-600 font-medium">
              {message}
            </p>
          )}

        </form>
      </div>
    </main>
  );
}