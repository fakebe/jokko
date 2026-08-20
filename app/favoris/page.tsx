"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

type Favori = {
  id: string;
  bien_id: string;
  bien: {
    id: string;
    titre: string;
    type_bien: string;
    transaction: string;
    ville: string;
    quartier: string | null;
    prix: number;
    chambres: number | null;
    salles_bain: number | null;
    surface: number | null;
    image_url: string | null;
  } | null;
};

export default function FavorisPage() {
  const router = useRouter();

  const [favoris, setFavoris] = useState<Favori[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    chargerFavoris();
  }, []);

 async function chargerFavoris() {
  setLoading(true);
  setMessage("");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    setMessage("Vous devez être connecté pour voir vos favoris.");
    setLoading(false);
    return;
  }

  // Récupérer les favoris de l'utilisateur
  const { data: favorisData, error: favorisError } = await supabase
    .from("favoris")
    .select("id, bien_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (favorisError) {
    console.error("ERREUR FAVORIS :", favorisError);
    setMessage("Impossible de charger vos favoris.");
    setLoading(false);
    return;
  }

  if (!favorisData || favorisData.length === 0) {
    setFavoris([]);
    setLoading(false);
    return;
  }

  // Récupérer les IDs des biens
  const bienIds = favorisData.map((favori) => favori.bien_id);

  const { data: biensData, error: biensError } = await supabase
    .from("biens")
    .select(`
      id,
      titre,
      type_bien,
      transaction,
      ville,
      quartier,
      prix,
      chambres,
      salles_bain,
      surface,
      image_url
    `)
    .in("id", bienIds);

  if (biensError) {
    console.error("ERREUR BIENS FAVORIS :", biensError);
    setMessage("Impossible de récupérer les biens favoris.");
    setLoading(false);
    return;
  }

  // Associer chaque favori à son bien
  const favorisComplets = favorisData.map((favori) => ({
    id: favori.id,
    bien_id: favori.bien_id,
    bien:
      biensData?.find((bien) => bien.id === favori.bien_id) || null,
  }));

  setFavoris(favorisComplets as Favori[]);
  setLoading(false);
}

  async function supprimerFavori(
    favoriId: string,
    bienId: string
  ) {
    const { error } = await supabase
      .from("favoris")
      .delete()
      .eq("id", favoriId);

    if (error) {
      console.error("ERREUR SUPPRESSION FAVORI :", error);
      alert("Impossible de retirer ce favori.");
      return;
    }

    setFavoris((anciens) =>
      anciens.filter(
        (favori) =>
          favori.id !== favoriId &&
          favori.bien_id !== bienId
      )
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-100 py-10 px-4">

        <div className="max-w-6xl mx-auto">

          {/* EN-TÊTE */}
          <div className="mb-8">

            <button
              onClick={() => router.push("/")}
              className="text-green-700 font-semibold hover:underline mb-4"
            >
              ← Retour à l'accueil
            </button>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              ❤️ Mes favoris
            </h1>

            <p className="text-gray-500 mt-2">
              Retrouvez les biens immobiliers que vous avez sauvegardés.
            </p>

          </div>

          {/* CHARGEMENT */}
          {loading && (
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
              <p className="text-gray-500">
                Chargement de vos favoris...
              </p>
            </div>
          )}

          {/* MESSAGE */}
          {!loading && message && (
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center">

              <div className="text-5xl mb-4">
                ❤️
              </div>

              <h2 className="text-xl font-bold text-gray-800">
                {message}
              </h2>

              <button
                onClick={() => router.push("/connexion")}
                className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl"
              >
                🔐 Se connecter
              </button>

            </div>
          )}

          {/* AUCUN FAVORI */}
          {!loading &&
            !message &&
            favoris.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">

                <div className="text-6xl mb-5">
                  🤍
                </div>

                <h2 className="text-2xl font-bold text-gray-800">
                  Aucun favori pour le moment
                </h2>

                <p className="text-gray-500 mt-2">
                  Lorsque vous trouverez un bien qui vous plaît,
                  ajoutez-le à vos favoris.
                </p>

                <button
                  onClick={() => router.push("/recherche")}
                  className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl"
                >
                  🔎 Rechercher un bien
                </button>

              </div>
            )}

          {/* LISTE DES FAVORIS */}
          {!loading &&
            !message &&
            favoris.length > 0 && (

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {favoris.map((favori) => {

                  const bien = favori.bien;

                  if (!bien) return null;

                  return (
                    <div
                      key={favori.id}
                      className="bg-white rounded-2xl shadow-sm overflow-hidden"
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

                        <h2 className="text-xl font-bold text-gray-800 mt-3">
                          {bien.titre}
                        </h2>

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

                        {/* BOUTONS */}
                        <div className="flex gap-3 mt-5">

                          <button
                            onClick={() =>
                              router.push(
                                `/bien/${bien.id}`
                              )
                            }
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg"
                          >
                            👁️ Voir
                          </button>

                          <button
                            onClick={() =>
                              supprimerFavori(
                                favori.id,
                                favori.bien_id
                              )
                            }
                            className="flex-1 border border-red-500 text-red-600 hover:bg-red-50 font-semibold py-2 rounded-lg"
                          >
                            🗑️ Retirer
                          </button>

                        </div>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

        </div>

      </main>
    </>
  );
}