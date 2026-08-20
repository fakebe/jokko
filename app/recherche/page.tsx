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

  const [quartier, setQuartier] = useState("");
  const [prixMin, setPrixMin] = useState("");
  const [prixMax, setPrixMax] = useState("");
  const [chambresMin, setChambresMin] = useState("");
  const [surfaceMin, setSurfaceMin] = useState("");
  const [tri, setTri] = useState("recent");

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

    if (prixMin) {
      query = query.gte(
        "prix",
        Number(prixMin)
      );
    }

    if (prixMax) {
      query = query.lte(
        "prix",
        Number(prixMax)
      );
    }

    if (chambresMin) {
      query = query.gte(
        "chambres",
        Number(chambresMin)
      );
    }

    if (surfaceMin) {
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

    router.push("/recherche");

    setTimeout(() => {
      window.location.reload();
    }, 100);
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">

        {/* EN-TÊTE */}
        <section className="bg-green-700 text-white py-12 px-6">

          <div className="max-w-6xl mx-auto">

            <button
              onClick={() => router.push("/")}
              className="mb-6 text-green-100 hover:text-white"
            >
              ← Retour à l'accueil
            </button>

            <h1 className="text-4xl font-bold">
              🔎 Rechercher un bien
            </h1>

            <p className="mt-2 text-green-100">
              Trouvez le logement ou le terrain qui vous
              correspond.
            </p>

          </div>
        </section>

        {/* FILTRES */}
        <section className="max-w-6xl mx-auto px-6 -mt-6">

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* TRANSACTION */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Transaction
                </label>

                <select
                  value={transaction}
                  onChange={(e) =>
                    setTransaction(e.target.value)
                  }
                  className="w-full p-3 rounded-xl border border-gray-300"
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
                <label className="block font-semibold text-gray-700 mb-2">
                  Type de bien
                </label>

                <select
                  value={typeBien}
                  onChange={(e) =>
                    setTypeBien(e.target.value)
                  }
                  className="w-full p-3 rounded-xl border border-gray-300"
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
                <label className="block font-semibold text-gray-700 mb-2">
                  Ville
                </label>

                <select
                  value={ville}
                  onChange={(e) =>
                    setVille(e.target.value)
                  }
                  className="w-full p-3 rounded-xl border border-gray-300"
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
                <label className="block font-semibold text-gray-700 mb-2">
                  Quartier
                </label>

                <input
                  type="text"
                  placeholder="Ex : Ouakam"
                  value={quartier}
                  onChange={(e) =>
                    setQuartier(e.target.value)
                  }
                  className="w-full p-3 rounded-xl border border-gray-300"
                />
              </div>

              {/* PRIX MIN */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
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
                  className="w-full p-3 rounded-xl border border-gray-300"
                />
              </div>

              {/* PRIX MAX */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
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
                  className="w-full p-3 rounded-xl border border-gray-300"
                />
              </div>

              {/* CHAMBRES */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
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
                  className="w-full p-3 rounded-xl border border-gray-300"
                />
              </div>

              {/* SURFACE */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Surface minimum (m²)
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="Ex : 100"
                  value={surfaceMin}
                  onChange={(e) =>
                    setSurfaceMin(e.target.value)
                  }
                  className="w-full p-3 rounded-xl border border-gray-300"
                />
              </div>

            </div>

            {/* BOUTONS */}
            <div className="flex flex-col md:flex-row gap-3 mt-6">

              <button
                onClick={rechercherBiens}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl"
              >
                🔎 Rechercher
              </button>

              <button
                onClick={reinitialiser}
                className="md:w-48 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl"
              >
                Réinitialiser
              </button>

            </div>

          </div>
        </section>

        {/* RÉSULTATS */}
        <section className="max-w-6xl mx-auto px-6 py-12">

          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Résultats
              </h2>

              {!loading && (
                <p className="text-gray-500 mt-1">
                  {biens.length} bien
                  {biens.length > 1 ? "s" : ""} trouvé
                  {biens.length > 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* TRI */}
            <select
              value={tri}
              onChange={(e) => {
                setTri(e.target.value);
                setTimeout(() => {
                  rechercherBiens();
                }, 0);
              }}
              className="p-3 rounded-xl border border-gray-300 bg-white text-gray-700"
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

          {loading && (
            <div className="bg-white rounded-2xl p-10 text-center">
              <p className="text-gray-500">
                Recherche des biens...
              </p>
            </div>
          )}

          {!loading && biens.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center">

              <div className="text-6xl mb-5">
                🏠
              </div>

              <h3 className="text-xl font-bold text-gray-800">
                Aucun bien disponible
              </h3>

              <p className="text-gray-500 mt-2">
                Aucun bien disponible ne correspond à vos critères.
              </p>

            </div>
          )}

          {!loading && biens.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {biens.map((bien) => (

                <div
                  key={bien.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition"
                >

                  {/* PHOTO */}
                  <div className="h-48 bg-green-100 flex items-center justify-center overflow-hidden">

                    {bien.image_url ? (
                      <img
                        src={bien.image_url}
                        alt={bien.titre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-6xl">
                        🏡
                      </span>
                    )}

                  </div>

                  <div className="p-5">

                    <div className="flex justify-between items-center">

                      <span className="text-sm font-semibold text-green-700">
                        {bien.transaction}
                      </span>

                      <span className="text-sm text-gray-500">
                        {bien.type_bien}
                      </span>

                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mt-3">
                      {bien.titre}
                    </h3>

                    <p className="text-gray-500 mt-2">
                      📍 {bien.ville}
                      {bien.quartier
                        ? `, ${bien.quartier}`
                        : ""}
                    </p>

                    <p className="text-green-700 font-bold text-xl mt-4">
                      {Number(
                        bien.prix
                      ).toLocaleString("fr-FR")}{" "}
                      FCFA
                    </p>

                    <div className="grid grid-cols-3 gap-2 mt-4 text-sm text-gray-600">

                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        🛏️
                        <br />
                        {bien.chambres ?? "-"}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        🚿
                        <br />
                        {bien.salles_bain ?? "-"}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        📐
                        <br />
                        {bien.surface
                          ? `${bien.surface} m²`
                          : "-"}
                      </div>

                    </div>

                    <button
                      onClick={() =>
                        router.push(
                          `/bien/${bien.id}`
                        )
                      }
                      className="w-full mt-5 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl"
                    >
                      👁️ Voir le bien
                    </button>

                  </div>

                </div>

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
    <Suspense fallback={<div>Chargement...</div>}>
      <RecherchePageContent />
    </Suspense>
  );
}