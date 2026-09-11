"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  agence_id: string | null;
  agence?: {
    nom_agence: string;
    verifiee: boolean;
  } | null;
};

const categories = [
  {
    icon: "🏠",
    name: "Maisons",
    type: "Maison",
  },
  {
    icon: "🏢",
    name: "Appartements",
    type: "Appartement",
  },
  {
    icon: "🌳",
    name: "Terrains",
    type: "Terrain",
  },
  {
    icon: "🏪",
    name: "Locaux commerciaux",
    type: "Commerce",
  },
];

export default function Home() {
  const router = useRouter();

  const [biens, setBiens] = useState<Bien[]>([]);
  const [typeRecherche, setTypeRecherche] = useState("");
  const [villeRecherche, setVilleRecherche] = useState("");
  const [transactionRecherche, setTransactionRecherche] =
    useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerBiens();
  }, []);

  async function chargerBiens() {
    setLoading(true);

    const { data, error } = await supabase
      .from("biens")
      .select(
        `
        id,
        titre,
        type_bien,
        transaction,
        statut,
        ville,
        quartier,
        prix,
        chambres,
        salles_bain,
        surface,
        image_url,
        agence_id,
        agence:agences (
          nom_agence,
          verifiee
        )
      `
      )
      .eq("statut", "Disponible")
      .order("created_at", {
        ascending: false,
      })
      .limit(6);

    if (error) {
      console.error(
        "ERREUR CHARGEMENT BIENS :",
        error
      );

      setBiens([]);
      setLoading(false);
      return;
    }

    setBiens((data || []) as Bien[]);
    setLoading(false);
  }

  function rechercher() {
    const params = new URLSearchParams();

    if (typeRecherche) {
      params.set("type", typeRecherche);
    }

    if (villeRecherche) {
      params.set("ville", villeRecherche);
    }

    if (transactionRecherche) {
      params.set(
        "transaction",
        transactionRecherche
      );
    }

    const queryString = params.toString();

    router.push(
      queryString
        ? `/recherche?${queryString}`
        : "/recherche"
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">

        {/* HERO */}
        <section className="bg-green-700 text-white px-6 py-20">

          <div className="max-w-6xl mx-auto text-center">

            <p className="text-green-200 font-medium mb-3">
              🇸🇳 L'immobilier au Sénégal, simplement
            </p>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Trouver. Louer. Acheter.
              <br />

              <span className="text-green-200">
                En toute confiance.
              </span>
            </h1>

            <p className="text-lg text-green-50 max-w-2xl mx-auto mb-10">
              Découvrez des maisons, appartements, terrains et locaux
              commerciaux partout au Sénégal.
            </p>

            {/* RECHERCHE */}
            <div className="bg-white rounded-2xl p-3 max-w-5xl mx-auto shadow-xl">

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">

                <select
                  value={transactionRecherche}
                  onChange={(e) =>
                    setTransactionRecherche(
                      e.target.value
                    )
                  }
                  className="p-4 rounded-xl border border-gray-200 text-gray-700 bg-white"
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

                <select
                  value={typeRecherche}
                  onChange={(e) =>
                    setTypeRecherche(
                      e.target.value
                    )
                  }
                  className="p-4 rounded-xl border border-gray-200 text-gray-700 bg-white"
                >
                  <option value="">
                    Type de bien
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

                <select
                  value={villeRecherche}
                  onChange={(e) =>
                    setVilleRecherche(
                      e.target.value
                    )
                  }
                  className="p-4 rounded-xl border border-gray-200 text-gray-700 bg-white"
                >
                  <option value="">
                    Où ?
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

                <button
                  type="button"
                  onClick={rechercher}
                  className="bg-green-600 hover:bg-green-800 text-white font-semibold p-4 rounded-xl transition"
                >
                  🔍 Rechercher
                </button>

              </div>

            </div>
          </div>

        </section>

        {/* CATÉGORIES */}
        <section className="max-w-6xl mx-auto px-6 py-14">

          <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">
            Que cherchez-vous ?
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

            {categories.map((category) => (
              <button
                key={category.name}
                type="button"
                onClick={() =>
                  router.push(
                    `/recherche?type=${encodeURIComponent(
                      category.type
                    )}`
                  )
                }
                className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-lg border border-gray-100 transition text-center"
              >
                <div className="text-4xl mb-4">
                  {category.icon}
                </div>

                <h3 className="font-semibold text-gray-800">
                  {category.name}
                </h3>
              </button>
            ))}

          </div>
        </section>

        {/* ANNONCES */}
        <section className="bg-white py-14">

          <div className="max-w-6xl mx-auto px-6">

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">

              <div>
                <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                  À découvrir
                </p>

                <h2 className="text-3xl font-bold text-gray-800 mt-1">
                  Annonces récentes
                </h2>

                <p className="text-gray-500 mt-2">
                  Découvrez les dernières offres disponibles.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push("/recherche")
                }
                className="text-green-700 font-semibold hover:underline"
              >
                Voir tout →
              </button>

            </div>

            {loading ? (
              <div className="text-center py-10 text-gray-500">
                Chargement des annonces...
              </div>
            ) : biens.length === 0 ? (
              <div className="text-center py-10">

                <div className="text-5xl mb-4">
                  🏠
                </div>

                <p className="text-gray-500">
                  Aucune annonce disponible pour le moment.
                </p>

              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {biens.map((bien) => (
                  <PropertyCard
                    key={bien.id}
                    bien={bien}
                    onClick={() =>
                      router.push(
                        `/bien/${bien.id}`
                      )
                    }
                  />
                ))}

              </div>
            )}

          </div>

        </section>

        {/* CONFIANCE */}
        <section className="max-w-6xl mx-auto px-6 py-16 text-center">

          <h2 className="text-3xl font-bold text-gray-800 mb-10">
            Pourquoi choisir FC Immo ?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div>
              <div className="text-4xl mb-4">
                🔎
              </div>

              <h3 className="font-bold text-xl mb-2">
                Trouvez facilement
              </h3>

              <p className="text-gray-500">
                Recherchez votre futur bien selon vos besoins et votre
                budget.
              </p>
            </div>

            <div>
              <div className="text-4xl mb-4">
                🤝
              </div>

              <h3 className="font-bold text-xl mb-2">
                Des professionnels
              </h3>

              <p className="text-gray-500">
                Retrouvez des agences vérifiées et identifiées sur
                la plateforme.
              </p>
            </div>

            <div>
              <div className="text-4xl mb-4">
                🇸🇳
              </div>

              <h3 className="font-bold text-xl mb-2">
                Pensé pour le Sénégal
              </h3>

              <p className="text-gray-500">
                Une plateforme conçue pour répondre aux réalités du marché
                sénégalais.
              </p>
            </div>

          </div>

        </section>

        {/* FOOTER */}
        <footer className="bg-gray-950 text-white py-12">

          <div className="max-w-6xl mx-auto px-6">

            <div className="flex flex-col items-center text-center">

              <div className="bg-white rounded-2xl px-5 py-3 shadow-lg">
                <img
                  src="/logo-fc-immo.png"
                  alt="FC Immo"
                  className="w-auto h-20 object-contain"
                />
              </div>

              <p className="text-gray-300 mt-6 text-lg">
                Trouver. Louer. Acheter. En toute confiance.
              </p>

              <div className="w-24 h-1 bg-green-600 rounded-full mt-6" />

              <p className="text-gray-500 text-sm mt-6">
                © 2026 FC Immo — Tous droits réservés.
              </p>

            </div>

          </div>

        </footer>

      </main>
    </>
  );
}

function PropertyCard({
  bien,
  onClick,
}: {
  bien: Bien;
  onClick: () => void;
}) {
  return (
    <article className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">

      {/* IMAGE */}
      <button
        type="button"
        onClick={onClick}
        className="block w-full text-left"
      >
        <div className="relative h-48 sm:h-56 bg-green-50 overflow-hidden">

          {bien.image_url ? (
            <img
              src={bien.image_url}
              alt={bien.titre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl sm:text-7xl">
                🏡
              </span>
            </div>
          )}

          {/* TRANSACTION */}
          <div className="absolute top-3 left-3">
            <span className="bg-green-600 text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-md">
              {bien.transaction === "Vente"
                ? "À vendre"
                : "À louer"}
            </span>
          </div>

          {/* TYPE */}
          <div className="absolute top-3 right-3">
            <span className="bg-white/95 text-gray-700 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-md">
              {bien.type_bien}
            </span>
          </div>

          {/* AGENCE VÉRIFIÉE */}
          {bien.agence?.verifiee && (
            <div className="absolute bottom-3 left-3">
              <span className="bg-white text-green-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                ✅ Agence vérifiée
              </span>
            </div>
          )}

        </div>
      </button>

      {/* CONTENU */}
      <div className="p-4 sm:p-5">

        <button
          type="button"
          onClick={onClick}
          className="text-left w-full"
        >
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 hover:text-green-700 transition line-clamp-2">
            {bien.titre}
          </h3>
        </button>

        {/* AGENCE */}
        {bien.agence?.nom_agence && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (bien.agence_id) {
                router.push(
                  `/agences/${bien.agence_id}`
                );
              }
            }}
            className="text-left text-sm text-gray-500 hover:text-green-700 mt-2 transition"
          >
            🏢 {bien.agence.nom_agence}
          </button>
        )}

        {/* LOCALISATION */}
        <p className="text-gray-500 text-sm sm:text-base mt-2">
          📍 {bien.ville}
          {bien.quartier
            ? `, ${bien.quartier}`
            : ""}
        </p>

        {/* PRIX */}
        <div className="mt-4">
          <p className="text-xl sm:text-2xl font-bold text-green-700">
            {Number(
              bien.prix
            ).toLocaleString("fr-FR")}{" "}
            FCFA
          </p>

          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Prix affiché
          </p>
        </div>

        {/* CARACTÉRISTIQUES */}
        <div className="grid grid-cols-3 gap-2 mt-4">

          <div className="bg-gray-50 rounded-xl p-2.5 sm:p-3 text-center">
            <div className="text-lg sm:text-xl">
              🛏️
            </div>

            <p className="font-semibold text-gray-800 mt-1">
              {bien.chambres ?? "-"}
            </p>

            <p className="text-[11px] sm:text-xs text-gray-500">
              Chambres
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-2.5 sm:p-3 text-center">
            <div className="text-lg sm:text-xl">
              🚿
            </div>

            <p className="font-semibold text-gray-800 mt-1">
              {bien.salles_bain ?? "-"}
            </p>

            <p className="text-[11px] sm:text-xs text-gray-500">
              Salles de bain
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-2.5 sm:p-3 text-center">
            <div className="text-lg sm:text-xl">
              📐
            </div>

            <p className="font-semibold text-gray-800 mt-1">
              {bien.surface ?? "-"}
            </p>

            <p className="text-[11px] sm:text-xs text-gray-500">
              m²
            </p>
          </div>

        </div>

        {/* BOUTON */}
        <button
          type="button"
          onClick={onClick}
          className="w-full mt-5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-3.5 rounded-xl transition"
        >
          👁️ Voir l'annonce
        </button>

      </div>
    </article>
  );
}