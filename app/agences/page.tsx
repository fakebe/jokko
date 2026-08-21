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
};

type Bien = {
  agence_id: string;
};

export default function AgencesPage() {
  const router = useRouter();

  const [agences, setAgences] = useState<Agence[]>([]);
  const [nombreBiens, setNombreBiens] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerAgences();
  }, []);

  async function chargerAgences() {
    setLoading(true);

    const { data: agencesData, error: agencesError } = await supabase
      .from("agences")
      .select(
        "id, nom_agence, responsable, telephone, email, ville"
      )
      .order("nom_agence", { ascending: true });

    if (agencesError) {
      console.error("ERREUR CHARGEMENT AGENCES :", agencesError);
      setAgences([]);
      setLoading(false);
      return;
    }

    const { data: biensData, error: biensError } = await supabase
      .from("biens")
      .select("agence_id");

    if (biensError) {
      console.error("ERREUR CHARGEMENT BIENS :", biensError);
    }

    const compte: Record<string, number> = {};

    (biensData as Bien[] | null)?.forEach((bien) => {
      if (!bien.agence_id) return;

      compte[bien.agence_id] =
        (compte[bien.agence_id] || 0) + 1;
    });

    setAgences(agencesData || []);
    setNombreBiens(compte);
    setLoading(false);
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
              🏢 Les agences immobilières
            </h1>

            <p className="text-gray-500 mt-2">
              Découvrez les agences présentes sur FC Immo.
            </p>

          </div>

          {/* CHARGEMENT */}
          {loading && (
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
              <p className="text-gray-500">
                Chargement des agences...
              </p>
            </div>
          )}

          {/* AUCUNE AGENCE */}
          {!loading && agences.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">

              <div className="text-6xl mb-5">
                🏢
              </div>

              <h2 className="text-2xl font-bold text-gray-800">
                Aucune agence disponible
              </h2>

              <p className="text-gray-500 mt-2">
                Les agences apparaîtront ici lorsqu'elles seront inscrites
                sur FC Immo.
              </p>

            </div>
          )}

          {/* AGENCES */}
          {!loading && agences.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {agences.map((agence) => (
                <div
                  key={agence.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden"
                >

                  {/* EN-TÊTE CARTE */}
                  <div className="bg-green-700 p-6 text-white">

                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                      🏢
                    </div>

                    <h2 className="text-2xl font-bold mt-4">
                      {agence.nom_agence}
                    </h2>

                    <p className="text-green-100 mt-1">
                      📍 {agence.ville || "Sénégal"}
                    </p>

                  </div>

                  <div className="p-6">

                    <div className="space-y-3 text-gray-600">

                      <p>
                        👤{" "}
                        <span className="font-semibold text-gray-800">
                          Responsable :
                        </span>{" "}
                        {agence.responsable || "-"}
                      </p>

                      <p>
                        📞{" "}
                        <span className="font-semibold text-gray-800">
                          Téléphone :
                        </span>{" "}
                        {agence.telephone || "-"}
                      </p>

                      <p>
                        ✉️{" "}
                        <span className="font-semibold text-gray-800">
                          Email :
                        </span>{" "}
                        {agence.email || "-"}
                      </p>

                    </div>

                    <div className="mt-5 bg-green-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-green-700">
                        {nombreBiens[agence.id] || 0}
                      </p>

                      <p className="text-gray-500 text-sm">
                        bien
                        {(nombreBiens[agence.id] || 0) > 1
                          ? "s"
                          : ""}{" "}
                        publié
                        {(nombreBiens[agence.id] || 0) > 1
                          ? "s"
                          : ""}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">

                      {agence.telephone && (
                        <a
                          href={`tel:${agence.telephone}`}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-center"
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
                          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl text-center"
                        >
                          💬 WhatsApp
                        </a>
                      )}

                    </div>

                    <a
                      href={`/agences/${agence.id}`}
                      className="block w-full mt-4 border border-green-600 text-green-700 hover:bg-green-50 font-semibold py-3 rounded-xl text-center"
                    >
                      👁️ Voir l'agence
                    </a>

                  </div>
                </div>
              ))}

            </div>
          )}

        </div>

      </main>
    </>
  );
}