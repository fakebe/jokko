"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    chargerUtilisateur();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function chargerUtilisateur() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);
  }

  async function deconnexion() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* NAVBAR FIXE */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 shadow-sm z-50">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-5 py-4">

          {/* LOGO */}
          <button
            onClick={() => router.push("/")}
            className="text-2xl font-bold text-green-700 hover:text-green-800 transition"
          >
            🏢 FC Immo
          </button>

          {/* NAVIGATION DESKTOP */}
          <div className="hidden md:flex gap-5 items-center">

            <button
              onClick={() => router.push("/")}
              className="text-gray-700 hover:text-green-700 font-medium transition"
            >
              🏠 Accueil
            </button>

            <button
              onClick={() => router.push("/recherche")}
              className="text-gray-700 hover:text-green-700 font-medium transition"
            >
              🔎 Rechercher
            </button>

            <button
              onClick={() =>
                router.push("/recherche?transaction=Vente")
              }
              className="text-gray-700 hover:text-green-700 font-medium transition"
            >
              🏷️ Acheter
            </button>

            <button
              onClick={() =>
                router.push("/recherche?transaction=Location")
              }
              className="text-gray-700 hover:text-green-700 font-medium transition"
            >
              🔑 Louer
            </button>

            <button
              onClick={() => router.push("/favoris")}
              className="text-gray-700 hover:text-green-700 font-medium transition"
            >
              ❤️ Favoris
            </button>

            {/* UTILISATEUR CONNECTÉ */}
            {user ? (
              <>
                <button
                  onClick={() => router.push("/agence")}
                  className="text-green-700 font-semibold hover:text-green-900 transition"
                >
                  🏢 Mon espace
                </button>

                <button
                  onClick={deconnexion}
                  className="border border-red-500 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push("/connexion")}
                  className="text-gray-700 hover:text-green-700 font-medium transition"
                >
                  🔐 Connexion
                </button>

                <button
                  onClick={() => router.push("/inscription")}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  S'inscrire
                </button>
              </>
            )}
          </div>

          {/* BOUTON MOBILE */}
          <button
            onClick={() => router.push("/recherche")}
            className="md:hidden bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            aria-label="Rechercher"
          >
            🔎
          </button>

        </nav>
      </header>

      {/* ESPACE SOUS LA NAVBAR */}
      <div className="h-[76px]" />
    </>
  );
}