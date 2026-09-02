"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [menuOuvert, setMenuOuvert] = useState(false);

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
    setMenuOuvert(false);
    router.push("/");
    router.refresh();
  }

  function naviguer(chemin: string) {
    setMenuOuvert(false);
    router.push(chemin);
  }

  return (
    <>
      <header className="sticky top-0 w-full bg-white border-b border-gray-100 shadow-sm z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-5 py-3">

          {/* BARRE PRINCIPALE */}
          <div className="flex items-center justify-between gap-4">

            {/* LOGO FC IMMO */}
            <button
              type="button"
              onClick={() => naviguer("/")}
              className="flex items-center shrink-0"
              aria-label="Accueil FC Immo"
            >
              <Image
                src="/logo-fc-immo.png"
                alt="FC Immo"
                width={170}
                height={65}
                priority
                className="h-14 sm:h-16 w-auto object-contain"
              />
            </button>

            {/* MENU DESKTOP */}
            <div className="hidden md:flex gap-4 lg:gap-5 items-center">

              <button
                type="button"
                onClick={() => naviguer("/")}
                className="text-gray-700 hover:text-green-700 font-medium transition"
              >
                🏠 Accueil
              </button>

              <button
                type="button"
                onClick={() => naviguer("/recherche")}
                className="text-gray-700 hover:text-green-700 font-medium transition"
              >
                🔎 Rechercher
              </button>

              <button
                type="button"
                onClick={() =>
                  naviguer("/recherche?transaction=Vente")
                }
                className="text-gray-700 hover:text-green-700 font-medium transition"
              >
                🏷️ Acheter
              </button>

              <button
                type="button"
                onClick={() =>
                  naviguer("/recherche?transaction=Location")
                }
                className="text-gray-700 hover:text-green-700 font-medium transition"
              >
                🔑 Louer
              </button>

              <button
                type="button"
                onClick={() => naviguer("/favoris")}
                className="text-gray-700 hover:text-green-700 font-medium transition"
              >
                ❤️ Favoris
              </button>

              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => naviguer("/agence")}
                    className="text-green-700 font-semibold hover:text-green-900 transition"
                  >
                    🏢 Mon espace
                  </button>

                  <button
                    type="button"
                    onClick={deconnexion}
                    className="border border-red-500 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => naviguer("/connexion")}
                    className="text-gray-700 hover:text-green-700 font-medium transition"
                  >
                    🔐 Connexion
                  </button>

                  <button
                    type="button"
                    onClick={() => naviguer("/inscription")}
                    className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition font-semibold"
                  >
                    S'inscrire
                  </button>
                </>
              )}
            </div>

            {/* BOUTON MOBILE */}
            <button
              type="button"
              onClick={() => setMenuOuvert(!menuOuvert)}
              className="md:hidden w-11 h-11 rounded-xl bg-green-700 text-white text-2xl flex items-center justify-center hover:bg-green-800 transition shrink-0"
              aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOuvert}
            >
              {menuOuvert ? "✕" : "☰"}
            </button>
          </div>

          {/* MENU MOBILE */}
          {menuOuvert && (
            <div className="md:hidden mt-3 border-t border-gray-100 pt-3 pb-2">

              <div className="flex flex-col gap-1">

                <button
                  type="button"
                  onClick={() => naviguer("/")}
                  className="w-full text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-700 font-medium transition"
                >
                  🏠 Accueil
                </button>

                <button
                  type="button"
                  onClick={() => naviguer("/recherche")}
                  className="w-full text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-700 font-medium transition"
                >
                  🔎 Rechercher
                </button>

                <button
                  type="button"
                  onClick={() =>
                    naviguer("/recherche?transaction=Vente")
                  }
                  className="w-full text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-700 font-medium transition"
                >
                  🏷️ Acheter
                </button>

                <button
                  type="button"
                  onClick={() =>
                    naviguer("/recherche?transaction=Location")
                  }
                  className="w-full text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-700 font-medium transition"
                >
                  🔑 Louer
                </button>

                <button
                  type="button"
                  onClick={() => naviguer("/favoris")}
                  className="w-full text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-700 font-medium transition"
                >
                  ❤️ Favoris
                </button>

                <div className="border-t border-gray-100 my-2" />

                {user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => naviguer("/agence")}
                      className="w-full text-left px-4 py-3 rounded-xl text-green-700 hover:bg-green-50 font-semibold transition"
                    >
                      🏢 Mon espace
                    </button>

                    <button
                      type="button"
                      onClick={deconnexion}
                      className="w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-semibold transition"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => naviguer("/connexion")}
                      className="w-full text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-700 font-medium transition"
                    >
                      🔐 Connexion
                    </button>

                    <button
                      type="button"
                      onClick={() => naviguer("/inscription")}
                      className="w-full bg-green-700 text-white px-4 py-3 rounded-xl hover:bg-green-800 transition font-semibold text-left"
                    >
                      ✨ S'inscrire
                    </button>
                  </>
                )}

              </div>
            </div>
          )}

        </nav>
      </header>
    </>
  );
}