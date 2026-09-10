"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

type Bien = {
  id: string;
  titre: string;
  type_bien: string;
  transaction: string;
  statut: string | null;
  ville: string;
  quartier: string | null;
  prix: number;
  chambres: number | null;
  salles_bain: number | null;
  surface: number | null;
  image_url: string | null;
};

function RecherchePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [biens, setBiens] = useState<Bien[]>([]);
  const [loading, setLoading] = useState(true);

  const [transaction, setTransaction] = useState(
    searchParams.get("transaction") || ""
  );

  const [typeBien, setTypeBien] = useState(
    searchParams.get("type") || ""
  );

  const [ville, setVille] = useState(
    searchParams.get("ville") || ""
  );

  const [quartier, setQuartier] = useState(
    searchParams.get("quartier") || ""
  );

  const [prixMin, setPrixMin] = useState(
    searchParams.get("prixMin") || ""
  );

  const [prixMax, setPrixMax] = useState(
    searchParams.get("prixMax") || ""
  );

  const [chambresMin, setChambresMin] = useState(
    searchParams.get("chambresMin") || ""
  );

  const [surfaceMin, setSurfaceMin] = useState(
    searchParams.get("surfaceMin") || ""
  );

  const [tri, setTri] = useState(
    searchParams.get("tri") || "recent"
  );

  useEffect(() => {
    rechercherBiens();
  }, []);

  async function rechercherBiens() {
    setLoading(true);

    let query = supabase
      .from("biens")
      .select(
        "id,titre,type_bien,transaction,statut,ville,quartier,prix,chambres,salles_bain,surface,image_url"
      )
      .eq("statut", "Disponible");

    if (transaction) {
      query = query.eq("transaction", transaction);
    }

    if (typeBien) {
      query = query.eq("type_bien", typeBien);
    }

    if (ville) {
      query = query.eq("ville", ville);
    }

    if (quartier.trim()) {
      query = query.ilike(
        "quartier",
        `%${quartier.trim()}%`
      );
    }

    if (prixMin && Number(prixMin) >= 0) {
      query = query.gte(
        "prix",
        Number(prixMin)
      );
    }

    if (prixMax && Number(prixMax) >= 0) {
      query = query.lte(
        "prix",
        Number(prixMax)
      );
    }

    if (
      chambresMin &&
      Number(chambresMin) >= 0
    ) {
      query = query.gte(
        "chambres",
        Number(chambresMin)
      );
    }

    if (
      surfaceMin &&
      Number(surfaceMin) >= 0
    ) {
      query = query.gte(
        "surface",
        Number(surfaceMin)
      );
    }

    if (tri === "prix_asc") {
      query = query.order("prix", {
        ascending: true,
      });
    } else if (tri === "prix_desc") {
      query = query.order("prix", {
        ascending: false,
      });
    } else if (tri === "surface") {
      query = query.order("surface", {
        ascending: false,
        nullsFirst: false,
      });
    } else {
      query = query.order("created_at", {
        ascending: false,
      });
    }

    const { data, error } = await query;

    if (error) {
      console.error(
        "ERREUR RECHERCHE :",
        error
      );

      setBiens([]);
      setLoading(false);
      return;
    }

    setBiens((data || []) as Bien[]);
    setLoading(false);
  }

  function mettreAJourURL() {
    const params = new URLSearchParams();

    if (transaction) {
      params.set("transaction", transaction);
    }

    if (typeBien) {
      params.set("type", typeBien);
    }

    if (ville) {
      params.set("ville", ville);
    }

    if (quartier.trim()) {
      params.set("quartier", quartier.trim());
    }

    if (prixMin) {
      params.set("prixMin", prixMin);
    }

    if (prixMax) {
      params.set("prixMax", prixMax);
    }

    if (chambresMin) {
      params.set(
        "chambresMin",
        chambresMin
      );
    }

    if (surfaceMin) {
      params.set(
        "surfaceMin",
        surfaceMin
      );
    }

    if (tri !== "recent") {
      params.set("tri", tri);
    }

    const queryString = params.toString();

    router.push(
      queryString
        ? `/recherche?${queryString}`
        : "/recherche",
      { scroll: false }
    );
  }

  async function lancerRecherche() {
    mettreAJourURL();
    await rechercherBiens();
  }

  async function changerTri(
    nouveauTri: string
  ) {
    setTri(nouveauTri);

    const params = new URLSearchParams();

    if (transaction) {
      params.set("transaction", transaction);
    }

    if (typeBien) {
      params.set("type", typeBien);
    }

    if (ville) {
      params.set("ville", ville);
    }

    if (quartier.trim()) {
      params.set("quartier", quartier.trim());
    }

    if (prixMin) {
      params.set("prixMin", prixMin);
    }

    if (prixMax) {
      params.set("prixMax", prixMax);
    }

    if (chambresMin) {
      params.set(
        "chambresMin",
        chambresMin
      );
    }

    if (surfaceMin) {
      params.set(
        "surfaceMin",
        surfaceMin
      );
    }

    if (nouveauTri !== "recent") {
      params.set("tri", nouveauTri);
    }

    const queryString = params.toString();

    router.push(
      queryString
        ? `/recherche?${queryString}`
        : "/recherche",
      { scroll: false }
    );

    await rechercherBiens();
  }

  function reinitialiser() {
    setTransaction("");
    setTypeBien("");
    setVille("");
    setQuartier("");
    setPrixMin("");
    setPrixMax("");
    setChambresMin("");
    setSurfaceMin("");
    setTri("recent");

    router.push("/recherche", {
      scroll: false,
    });

    setTimeout(() => {
      rechercherBiens();
    }, 0);
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">

        {/* HERO */}
        <section className="bg-green-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">

            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-green-100 hover:text-white font-semibold mb-5 transition"
            >
              ← Retour à l'accueil
            </button>

            <p className="text-green-200 text-sm font-semibold uppercase tracking-wide">
              FC Immo
            </p>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-1">
              🔎 Trouver votre bien
            </h1>

            <p className="text-green-100 mt-3 max-w-2xl text-base sm:text-lg">
              Recherchez une maison, un appartement, un terrain ou
              un local selon vos besoins et votre budget.
            </p>

          </div>
        </section>

        {/* FILTRES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-7 relative z-10">

          <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-5 sm:p-7">

            <div className="flex items-center justify-between gap-4 mb-6">

              <div>
                <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                  Recherche
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-1">
                  Affinez vos critères
                </h2>
              </div>

              <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-green-50 items-center justify-center text-2xl">
                🔍
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

              {/* TRANSACTION */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Transaction
                </label>

                <select
                  value={transaction}
                  onChange={(e) =>
                    setTransaction(e.target.value)
                  }
                  className="w-full p-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">
                    Vente ou location
                  </option>

                  <option value="Vente">
                    À vendre
                  </option>

                  <option value="Location">
                    À louer
                  </option>
                </select>
              </div>

              {/* TYPE */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type de bien
                </label>

                <select
                  value={typeBien}
                  onChange={(e) =>
                    setTypeBien(e.target.value)
                  }
                  className="w-full p-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">
                    Tous les types
                  </option>

                  <option value="Maison">
                    Maison
                  </option>

                  <option value="Appartement">
                    Appartement
                  </option>

                  <option value="Terrain">
                    Terrain
                  </option>

                  <option value="Villa">
                    Villa
                  </option>

                  <option value="Bureau">
                    Bureau
                  </option>

                  <option value="Commerce">
                    Commerce
                  </option>

                  <option value="Immeuble">
                    Immeuble
                  </option>
                </select>
              </div>

              {/* VILLE */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ville
                </label>

                <select
                  value={ville}
                  onChange={(e) =>
                    setVille(e.target.value)
                  }
                  className="w-full p-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">
                    Toutes les villes
                  </option>

                  <option value="Dakar">
                    Dakar
                  </option>

                  <option value="Rufisque">
                    Rufisque
                  </option>

                  <option value="Thiès">
                    Thiès
                  </option>

                  <option value="Mbour">
                    Mbour
                  </option>

                  <option value="Saint-Louis">
                    Saint-Louis
                  </option>

                  <option value="Ziguinchor">
                    Ziguinchor
                  </option>

                  <option value="Autre">
                    Autre
                  </option>
                </select>
              </div>

              {/* QUARTIER */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quartier
                </label>

                <input
                  type="text"
                  placeholder="Ex : Ouakam"
                  value={quartier}
                  onChange={(e) =>
                    setQuartier(e.target.value)
                  }
                  className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* PRIX MIN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prix minimum
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="Ex : 5000000"
                  value={prixMin}
                  onChange={(e) =>
                    setPrixMin(e.target.value)
                  }
                  className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* PRIX MAX */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prix maximum
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="Ex : 100000000"
                  value={prixMax}
                  onChange={(e) =>
                    setPrixMax(e.target.value)
                  }
                  className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* CHAMBRES */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Chambres minimum
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="Ex : 3"
                  value={chambresMin}
                  onChange={(e) =>
                    setChambresMin(e.target.value)
                  }
                  className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* SURFACE */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Surface minimum
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="Ex : 100"
                  value={surfaceMin}
                  onChange={(e) =>
                    setSurfaceMin(e.target.value)
                  }
                  className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

            </div>

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">

              <button
                type="button"
                onClick={lancerRecherche}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3.5 rounded-xl transition"
              >
                {loading
                  ? "Recherche..."
                  : "🔎 Rechercher"}
              </button>

              <button
                type="button"
                onClick={reinitialiser}
                disabled={loading}
                className="sm:w-48 border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-xl transition"
              >
                Réinitialiser
              </button>

            </div>

          </div>
        </section>

        {/* RESULTATS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-6">

            <div>
              <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                Annonces
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                Résultats de recherche
              </h2>

              {!loading && (
                <p className="text-gray-500 mt-2">
                  {biens.length} bien
                  {biens.length > 1 ? "s" : ""} trouvé
                  {biens.length > 1 ? "s" : ""}
                </p>
              )}
            </div>

            <div className="w-full lg:w-auto">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trier par
              </label>

              <select
                value={tri}
                onChange={(e) =>
                  changerTri(e.target.value)
                }
                className="w-full lg:w-64 p-3.5 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="recent">
                  🆕 Plus récent
                </option>

                <option value="prix_asc">
                  💰 Prix croissant
                </option>

                <option value="prix_desc">
                  💰 Prix décroissant
                </option>

                <option value="surface">
                  📐 Plus grande surface
                </option>
              </select>

            </div>

          </div>

          {/* CHARGEMENT */}
          {loading && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">

              <div className="w-12 h-12 mx-auto rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />

              <p className="text-gray-600 mt-5 font-medium">
                Recherche des biens...
              </p>

            </div>
          )}

          {/* AUCUN RESULTAT */}
          {!loading && biens.length === 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 sm:p-14 text-center">

              <div className="w-20 h-20 mx-auto rounded-2xl bg-green-50 flex items-center justify-center text-5xl">
                🏠
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-6">
                Aucun bien trouvé
              </h3>

              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                Aucun bien disponible ne correspond à vos critères.
                Essayez de modifier les filtres.
              </p>

              <button
                type="button"
                onClick={reinitialiser}
                className="mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl"
              >
                Réinitialiser les filtres
              </button>

            </div>
          )}

          {/* LISTE */}
          {!loading && biens.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

              {biens.map((bien) => (
                <article
                  key={bien.id}
                  className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition"
                >

                  {/* IMAGE */}
                  <div className="relative h-56 bg-green-50 overflow-hidden">

                    {bien.image_url ? (
                      <img
                        src={bien.image_url}
                        alt={bien.titre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-7xl">
                          🏠
                        </span>
                      </div>
                    )}

                    <div className="absolute top-4 left-4">

                      <span className="bg-green-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow">
                        {bien.transaction === "Vente"
                          ? "À vendre"
                          : "À louer"}
                      </span>

                    </div>

                  </div>

                  <div className="p-5">

                    <div className="flex items-center justify-between gap-3">

                      <span className="text-sm font-semibold text-green-700">
                        {bien.type_bien}
                      </span>

                      <span className="text-xs font-medium text-gray-400">
                        Disponible
                      </span>

                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mt-2 line-clamp-2">
                      {bien.titre}
                    </h3>

                    <p className="text-gray-500 text-sm mt-2">
                      📍 {bien.ville}
                      {bien.quartier
                        ? `, ${bien.quartier}`
                        : ""}
                    </p>

                    <p className="text-green-700 font-extrabold text-2xl mt-4">
                      {Number(
                        bien.prix
                      ).toLocaleString("fr-FR")}{" "}
                      <span className="text-base font-semibold">
                        FCFA
                      </span>
                    </p>

                    <div className="grid grid-cols-3 gap-2 mt-5">

                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-lg">
                          🛏️
                        </div>

                        <p className="font-bold text-gray-800 mt-1">
                          {bien.chambres ?? "-"}
                        </p>

                        <p className="text-[11px] text-gray-500">
                          Chambres
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-lg">
                          🚿
                        </div>

                        <p className="font-bold text-gray-800 mt-1">
                          {bien.salles_bain ?? "-"}
                        </p>

                        <p className="text-[11px] text-gray-500">
                          S. de bain
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-lg">
                          📐
                        </div>

                        <p className="font-bold text-gray-800 mt-1">
                          {bien.surface ?? "-"}
                        </p>

                        <p className="text-[11px] text-gray-500">
                          m²
                        </p>
                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/bien/${bien.id}`
                        )
                      }
                      className="w-full mt-5 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition"
                    >
                      👁️ Voir le bien
                    </button>

                  </div>

                </article>
              ))}

            </div>
          )}

        </section>

      </main>
    </>
  );
}

export default function RecherchePage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />

          <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="text-center">

              <div className="w-12 h-12 mx-auto rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />

              <p className="text-gray-600 mt-5 font-medium">
                Chargement de la recherche...
              </p>

            </div>
          </main>
        </>
      }
    >
      <RecherchePageContent />
    </Suspense>
  );
}