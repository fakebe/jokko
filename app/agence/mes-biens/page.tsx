"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Statut = "Disponible" | "Vendu" | "Loué" | "Désactivé";

type Bien = {
  id: string;
  titre: string;
  type_bien: string;
  transaction: string;
  statut: Statut | null;
  ville: string;
  quartier: string | null;
  prix: number;
  chambres: number | null;
  salles_bain: number | null;
  surface: number | null;
  description: string | null;
  image_url: string | null;
};

export default function MesBiensPage() {
  const router = useRouter();

  const [biens, setBiens] = useState<Bien[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    chargerBiens();
  }, []);

  async function chargerBiens() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/connexion");
      return;
    }

    const { data, error } = await supabase
      .from("biens")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("ERREUR CHARGEMENT BIENS :", error);
      setMessage("Impossible de charger vos biens.");
      setLoading(false);
      return;
    }

    setBiens((data || []) as Bien[]);
    setLoading(false);
  }

  async function changerStatut(
    bienId: string,
    nouveauStatut: Statut
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Vous devez être connecté.");
      return;
    }

    const { error } = await supabase
      .from("biens")
      .update({
        statut: nouveauStatut,
      })
      .eq("id", bienId)
      .eq("user_id", user.id);

    if (error) {
      console.error("ERREUR MODIFICATION STATUT :", error);
      alert("Impossible de modifier le statut.");
      return;
    }

    setBiens((anciensBiens) =>
      anciensBiens.map((bien) =>
        bien.id === bienId
          ? { ...bien, statut: nouveauStatut }
          : bien
      )
    );
  }

  async function supprimerBien(bienId: string) {
    const confirmer = window.confirm(
      "Voulez-vous vraiment supprimer ce bien ?"
    );

    if (!confirmer) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Vous devez être connecté.");
      return;
    }

    const { error } = await supabase
      .from("biens")
      .delete()
      .eq("id", bienId)
      .eq("user_id", user.id);

    if (error) {
      console.error("ERREUR SUPPRESSION :", error);
      alert("Impossible de supprimer le bien.");
      return;
    }

    setBiens((anciensBiens) =>
      anciensBiens.filter((bien) => bien.id !== bienId)
    );
  }

  function styleStatut(statut: Statut | null) {
    switch (statut) {
      case "Vendu":
        return "bg-red-100 text-red-700";

      case "Loué":
        return "bg-orange-100 text-orange-700";

      case "Désactivé":
        return "bg-gray-200 text-gray-600";

      default:
        return "bg-green-100 text-green-700";
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* EN-TÊTE */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <button
              onClick={() => router.push("/agence")}
              className="text-green-700 font-semibold hover:underline mb-3"
            >
              ← Retour à mon espace
            </button>

            <h1 className="text-3xl font-bold text-green-700">
              🏠 Mes biens
            </h1>

            <p className="text-gray-600 mt-2">
              Retrouvez ici tous les biens publiés par votre agence.
            </p>
          </div>

          <button
            onClick={() =>
              router.push("/agence/ajouter-bien")
            }
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-3 rounded-xl"
          >
            + Ajouter un bien
          </button>

        </div>

        {/* CHARGEMENT */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-gray-600">
              Chargement de vos biens...
            </p>
          </div>
        )}

        {/* MESSAGE */}
        {!loading && message && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-red-600 font-medium">
              {message}
            </p>
          </div>
        )}

        {/* AUCUN BIEN */}
        {!loading && !message && biens.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">

            <div className="text-5xl mb-4">
              🏠
            </div>

            <h2 className="text-xl font-bold text-gray-800">
              Aucun bien pour le moment
            </h2>

            <p className="text-gray-500 mt-2">
              Commencez par ajouter votre premier bien immobilier.
            </p>

            <button
              onClick={() =>
                router.push("/agence/ajouter-bien")
              }
              className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl"
            >
              Ajouter mon premier bien
            </button>

          </div>
        )}

        {/* LISTE */}
        {!loading && biens.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {biens.map((bien) => {

              const statut = bien.statut || "Disponible";

              return (
                <div
                  key={bien.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >

                  {/* PHOTO */}
                  <div className="h-52 bg-green-100 flex items-center justify-center overflow-hidden">

                    {bien.image_url ? (
                      <img
                        src={bien.image_url}
                        alt={bien.titre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-6xl">
                        🏠
                      </span>
                    )}

                  </div>

                  <div className="p-5">

                    {/* TRANSACTION + TYPE */}
                    <div className="flex items-center justify-between gap-2 mb-3">

                      <span className="text-sm font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        {bien.transaction}
                      </span>

                      <span className="text-sm text-gray-500">
                        {bien.type_bien}
                      </span>

                    </div>

                    {/* STATUT */}
                    <div className="mb-3">
                      <span
                        className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${styleStatut(
                          statut
                        )}`}
                      >
                        {statut === "Disponible" && "🟢 "}
                        {statut === "Vendu" && "🔴 "}
                        {statut === "Loué" && "🟠 "}
                        {statut === "Désactivé" && "⚪ "}
                        {statut}
                      </span>
                    </div>

                    {/* TITRE */}
                    <h2 className="text-xl font-bold text-gray-800">
                      {bien.titre}
                    </h2>

                    {/* LOCALISATION */}
                    <p className="text-gray-500 mt-2">
                      📍 {bien.ville}
                      {bien.quartier
                        ? `, ${bien.quartier}`
                        : ""}
                    </p>

                    {/* PRIX */}
                    <p className="text-green-700 font-bold text-xl mt-4">
                      {Number(
                        bien.prix
                      ).toLocaleString("fr-FR")}{" "}
                      FCFA
                    </p>

                    {/* CARACTÉRISTIQUES */}
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

                    {/* DESCRIPTION */}
                    {bien.description && (
                      <p className="text-gray-600 text-sm mt-4 line-clamp-3">
                        {bien.description}
                      </p>
                    )}

                    {/* CHANGEMENT DE STATUT */}
                    <div className="mt-5">

                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Statut du bien
                      </label>

                      <select
                        value={statut}
                        onChange={(e) =>
                          changerStatut(
                            bien.id,
                            e.target.value as Statut
                          )
                        }
                        className="w-full p-3 rounded-lg border border-gray-300 bg-white"
                      >
                        <option value="Disponible">
                          🟢 Disponible
                        </option>

                        <option value="Vendu">
                          🔴 Vendu
                        </option>

                        <option value="Loué">
                          🟠 Loué
                        </option>

                        <option value="Désactivé">
                          ⚪ Désactivé
                        </option>
                      </select>

                    </div>

                    {/* BOUTONS */}
                    <div className="mt-5 flex gap-3">

                      <button
                        onClick={() =>
                          router.push(`/bien/${bien.id}`)
                        }
                        className="flex-1 border border-blue-600 text-blue-700 hover:bg-blue-50 font-semibold py-2 rounded-lg"
                      >
                        👁️ Voir
                      </button>

                      <button
                        onClick={() =>
                          router.push(
                            `/agence/modifier-bien/${bien.id}`
                          )
                        }
                        className="flex-1 border border-green-600 text-green-700 hover:bg-green-50 font-semibold py-2 rounded-lg"
                      >
                        ✏️ Modifier
                      </button>

                    </div>

                    <button
                      onClick={() =>
                        supprimerBien(bien.id)
                      }
                      className="w-full mt-3 border border-red-500 text-red-600 hover:bg-red-50 font-semibold py-2 rounded-lg"
                    >
                      🗑️ Supprimer
                    </button>

                  </div>
                </div>
              );
            })}

          </div>
        )}

      </div>
    </main>
  );
}