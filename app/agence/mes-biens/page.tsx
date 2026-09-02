"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Statut =
  | "Disponible"
  | "Vendu"
  | "Loué"
  | "Désactivé";

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
      console.error(
        "ERREUR MODIFICATION STATUT :",
        error
      );
      alert("Impossible de modifier le statut.");
      return;
    }

    setBiens((anciensBiens) =>
      anciensBiens.map((bien) =>
        bien.id === bienId
          ? {
              ...bien,
              statut: nouveauStatut,
            }
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
      console.error(
        "ERREUR SUPPRESSION :",
        error
      );
      alert("Impossible de supprimer le bien.");
      return;
    }

    setBiens((anciensBiens) =>
      anciensBiens.filter(
        (bien) => bien.id !== bienId
      )
    );
  }

  function styleStatut(
    statut: Statut | null
  ) {
    switch (statut) {
      case "Vendu":
        return "bg-red-100 text-red-700 border-red-200";

      case "Loué":
        return "bg-orange-100 text-orange-700 border-orange-200";

      case "Désactivé":
        return "bg-gray-100 text-gray-600 border-gray-200";

      default:
        return "bg-green-100 text-green-700 border-green-200";
    }
  }

  function iconeStatut(
    statut: Statut
  ) {
    switch (statut) {
      case "Vendu":
        return "🔴";

      case "Loué":
        return "🟠";

      case "Désactivé":
        return "⚪";

      default:
        return "🟢";
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        {/* EN-TÊTE */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">

          <div>
            <button
              type="button"
              onClick={() =>
                router.push("/agence")
              }
              className="inline-flex items-center text-green-700 font-semibold hover:text-green-900 transition mb-4"
            >
              ← Retour à mon espace
            </button>

            <div>
              <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                Espace professionnel
              </p>

              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-1">
                Mes biens
              </h1>

              <p className="text-gray-500 mt-2 max-w-2xl">
                Gérez vos annonces immobilières, leurs statuts
                et leurs informations depuis votre espace FC Immo.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/agence/ajouter-bien")
            }
            className="w-full lg:w-auto bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3.5 rounded-xl transition shadow-sm"
          >
            + Ajouter un bien
          </button>

        </div>

        {/* COMPTEUR */}
        {!loading && !message && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div>
                <p className="text-gray-500 text-sm">
                  Biens enregistrés
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {biens.length}
                </p>
              </div>

              <p className="text-sm text-gray-500">
                {biens.length === 0
                  ? "Aucune annonce"
                  : `${biens.length} annonce${
                      biens.length > 1 ? "s" : ""
                    } dans votre espace`}
              </p>

            </div>
          </div>
        )}

        {/* CHARGEMENT */}
        {loading && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />

            <p className="text-gray-600 mt-5 font-medium">
              Chargement de vos biens...
            </p>
          </div>
        )}

        {/* MESSAGE */}
        {!loading && message && (
          <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-10 text-center">

            <div className="text-5xl mb-4">
              ⚠️
            </div>

            <p className="text-red-600 font-semibold">
              {message}
            </p>

            <button
              type="button"
              onClick={chargerBiens}
              className="mt-5 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-xl"
            >
              Réessayer
            </button>

          </div>
        )}

        {/* AUCUN BIEN */}
        {!loading &&
          !message &&
          biens.length === 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 sm:p-14 text-center">

              <div className="w-20 h-20 mx-auto rounded-2xl bg-green-50 flex items-center justify-center text-5xl">
                🏠
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mt-6">
                Aucun bien pour le moment
              </h2>

              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                Commencez par ajouter votre premier bien immobilier
                pour le publier sur FC Immo.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/agence/ajouter-bien")
                }
                className="mt-7 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3.5 rounded-xl transition"
              >
                + Ajouter mon premier bien
              </button>

            </div>
          )}

        {/* LISTE */}
        {!loading &&
          !message &&
          biens.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

              {biens.map((bien) => {
                const statut =
                  bien.statut || "Disponible";

                return (
                  <article
                    key={bien.id}
                    className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition"
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

                      {/* TRANSACTION */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-green-600 text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-md">
                          {bien.transaction ===
                          "Vente"
                            ? "À vendre"
                            : "À louer"}
                        </span>
                      </div>

                      {/* STATUT */}
                      <div className="absolute top-4 right-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs sm:text-sm font-bold shadow-sm ${styleStatut(
                            statut
                          )}`}
                        >
                          {iconeStatut(statut)}
                          {statut}
                        </span>
                      </div>

                    </div>

                    {/* CONTENU */}
                    <div className="p-5">

                      {/* TYPE */}
                      <p className="text-sm font-semibold text-green-700">
                        {bien.type_bien}
                      </p>

                      {/* TITRE */}
                      <h2 className="text-xl font-bold text-gray-900 mt-2 line-clamp-2">
                        {bien.titre}
                      </h2>

                      {/* LOCALISATION */}
                      <p className="text-gray-500 text-sm mt-2">
                        📍 {bien.ville}
                        {bien.quartier
                          ? `, ${bien.quartier}`
                          : ""}
                      </p>

                      {/* PRIX */}
                      <p className="text-2xl font-extrabold text-green-700 mt-4">
                        {Number(
                          bien.prix
                        ).toLocaleString("fr-FR")}{" "}
                        <span className="text-base font-semibold">
                          FCFA
                        </span>
                      </p>

                      {/* CARACTÉRISTIQUES */}
                      <div className="grid grid-cols-3 gap-2 mt-5">

                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                          <div className="text-lg">
                            🛏️
                          </div>

                          <p className="font-bold text-gray-800 mt-1">
                            {bien.chambres ??
                              "-"}
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
                            {bien.salles_bain ??
                              "-"}
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
                            {bien.surface ??
                              "-"}
                          </p>

                          <p className="text-[11px] text-gray-500">
                            m²
                          </p>
                        </div>

                      </div>

                      {/* DESCRIPTION */}
                      {bien.description && (
                        <p className="text-gray-500 text-sm leading-6 mt-4 line-clamp-3">
                          {bien.description}
                        </p>
                      )}

                      {/* STATUT */}
                      <div className="mt-5">

                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Modifier le statut
                        </label>

                        <select
                          value={statut}
                          onChange={(e) =>
                            changerStatut(
                              bien.id,
                              e.target.value as Statut
                            )
                          }
                          className="w-full p-3 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
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

                      {/* ACTIONS */}
                      <div className="grid grid-cols-2 gap-3 mt-5">

                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/bien/${bien.id}`
                            )
                          }
                          className="border-2 border-blue-600 text-blue-700 hover:bg-blue-50 font-semibold py-3 rounded-xl transition"
                        >
                          👁️ Voir
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/agence/modifier-bien/${bien.id}`
                            )
                          }
                          className="border-2 border-green-600 text-green-700 hover:bg-green-50 font-semibold py-3 rounded-xl transition"
                        >
                          ✏️ Modifier
                        </button>

                      </div>

                      {/* SUPPRIMER */}
                      <button
                        type="button"
                        onClick={() =>
                          supprimerBien(bien.id)
                        }
                        className="w-full mt-3 border-2 border-red-500 text-red-600 hover:bg-red-50 font-semibold py-3 rounded-xl transition"
                      >
                        🗑️ Supprimer ce bien
                      </button>

                    </div>
                  </article>
                );
              })}

            </div>
          )}

      </div>
    </main>
  );
}