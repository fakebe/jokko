"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

type Agence = {
  id: string;
  nom_agence: string;
  responsable: string | null;
  telephone: string | null;
  email: string | null;
  ville: string | null;
  verifiee: boolean;
};

type Bien = {
  agence_id: string;
};

export default function AgencesPage() {
  const router = useRouter();

  const [agences, setAgences] = useState<Agence[]>([]);
  const [nombreBiens, setNombreBiens] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerAgences();
  }, []);

  async function chargerAgences() {
    setLoading(true);

    const {
      data: agencesData,
      error: agencesError,
    } = await supabase
      .from("agences")
      .select(
        "id, nom_agence, responsable, telephone, email, ville, verifiee"
      )
      .order("nom_agence", {
        ascending: true,
      });

    if (agencesError) {
      console.error(
        "ERREUR CHARGEMENT AGENCES :",
        agencesError
      );

      setAgences([]);
      setLoading(false);
      return;
    }

    const {
      data: biensData,
      error: biensError,
    } = await supabase
      .from("biens")
      .select("agence_id");

    if (biensError) {
      console.error(
        "ERREUR CHARGEMENT BIENS :",
        biensError
      );
    }

    const compte: Record<string, number> = {};

    (biensData as Bien[] | null)?.forEach((bien) => {
      if (!bien.agence_id) return;

      compte[bien.agence_id] =
        (compte[bien.agence_id] || 0) + 1;
    });

    setAgences((agencesData || []) as Agence[]);
    setNombreBiens(compte);
    setLoading(false);
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">

          {/* EN-TÊTE */}
          <div className="mb-8">

            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 text-green-700 font-semibold hover:text-green-900 transition mb-4"
            >
              ← Retour à l'accueil
            </button>

            <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
              Réseau immobilier
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-1">
              🏢 Les agences immobilières
            </h1>

            <p className="text-gray-500 mt-2 max-w-2xl">
              Découvrez les agences présentes sur FC Immo et consultez
              leurs biens immobiliers.
            </p>

          </div>

          {/* CHARGEMENT */}
          {loading && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="w-12 h-12 mx-auto rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />

              <p className="text-gray-600 mt-5 font-medium">
                Chargement des agences...
              </p>
            </div>
          )}

          {/* AUCUNE AGENCE */}
          {!loading && agences.length === 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">

              <div className="w-20 h-20 mx-auto rounded-2xl bg-green-50 flex items-center justify-center text-5xl">
                🏢
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mt-6">
                Aucune agence disponible
              </h2>

              <p className="text-gray-500 mt-2">
                Les agences apparaîtront ici lorsqu'elles seront
                inscrites sur FC Immo.
              </p>

            </div>
          )}

          {/* AGENCES */}
          {!loading && agences.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

              {agences.map((agence) => {
                const totalBiens =
                  nombreBiens[agence.id] || 0;

                return (
                  <article
                    key={agence.id}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition overflow-hidden"
                  >

                    {/* EN-TÊTE CARTE */}
                    <div className="bg-green-700 p-6 text-white">

                      <div className="flex items-start justify-between gap-3">

                        <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center text-3xl">
                          🏢
                        </div>

                        {agence.verifiee && (
                          <span className="inline-flex items-center gap-1 bg-white text-green-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                            ✅ Vérifiée
                          </span>
                        )}

                      </div>

                      <div className="mt-5">

                        <h2 className="text-2xl font-bold leading-tight">
                          {agence.nom_agence || "Agence immobilière"}
                        </h2>

                        <p className="text-green-100 mt-2">
                          📍 {agence.ville || "Sénégal"}
                        </p>

                      </div>

                    </div>

                    {/* CONTENU */}
                    <div className="p-6">

                      {/* INFORMATIONS */}
                      <div className="space-y-3 text-gray-600">

                        <div className="flex items-start gap-3">
                          <span>👤</span>

                          <div>
                            <p className="text-xs text-gray-400">
                              Responsable
                            </p>

                            <p className="font-semibold text-gray-800">
                              {agence.responsable || "-"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <span>📞</span>

                          <div>
                            <p className="text-xs text-gray-400">
                              Téléphone
                            </p>

                            <p className="font-semibold text-gray-800">
                              {agence.telephone || "-"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <span>✉️</span>

                          <div className="min-w-0">
                            <p className="text-xs text-gray-400">
                              Email
                            </p>

                            <p className="font-semibold text-gray-800 break-all">
                              {agence.email || "-"}
                            </p>
                          </div>
                        </div>

                      </div>

                      {/* NOMBRE DE BIENS */}
                      <div className="mt-6 bg-green-50 border border-green-100 rounded-2xl p-5 text-center">

                        <p className="text-3xl font-extrabold text-green-700">
                          {totalBiens}
                        </p>

                        <p className="text-gray-500 text-sm mt-1">
                          bien
                          {totalBiens > 1 ? "s" : ""} publié
                          {totalBiens > 1 ? "s" : ""}
                        </p>

                      </div>

                      {/* ACTIONS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">

                        {agence.telephone && (
                          <a
                            href={`tel:${agence.telephone}`}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-center transition"
                          >
                            📞 Appeler
                          </a>
                        )}

                        {agence.telephone && (
                          <a
                            href={`https://wa.me/221${agence.telephone
                              .replace(/\D/g, "")
                              .replace(/^221/, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl text-center transition"
                          >
                            💬 WhatsApp
                          </a>
                        )}

                      </div>

                      {/* VOIR AGENCE */}
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/agences/${agence.id}`
                          )
                        }
                        className="w-full mt-4 border-2 border-green-600 text-green-700 hover:bg-green-50 font-bold py-3 rounded-xl text-center transition"
                      >
                        👁️ Voir l'agence
                      </button>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

        </div>
      </main>
    </>
  );
}