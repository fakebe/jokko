"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Agence = {
  id: string;
  nom_agence: string;
  responsable: string | null;
  telephone: string | null;
  email: string | null;
  ville: string | null;
  user_id: string;
  verifiee: boolean;
};

export default function AdminPage() {
  const router = useRouter();

  const [agences, setAgences] = useState<Agence[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    chargerAdmin();
  }, []);

  async function chargerAdmin() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/connexion");
      return;
    }

    const { data: admin, error: adminError } =
      await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (adminError) {
      console.error(
        "ERREUR VERIFICATION ADMIN :",
        adminError
      );

      setMessage(
        "Impossible de vérifier vos droits administrateur."
      );
      setLoading(false);
      return;
    }

    if (!admin) {
      setMessage("Ce compte n'est pas administrateur.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("agences")
      .select(
        "id, nom_agence, responsable, telephone, email, ville, user_id, verifiee"
      )
      .order("nom_agence", {
        ascending: true,
      });

    if (error) {
      console.error(
        "ERREUR CHARGEMENT AGENCES :",
        error
      );

      setMessage(
        "Impossible de charger les agences."
      );
      setAgences([]);
      setLoading(false);
      return;
    }

    setAgences((data || []) as Agence[]);
    setLoading(false);
  }

  async function verifierAgence(agence: Agence) {
    const nouveauStatut = !agence.verifiee;

    setActionId(agence.id);
    setMessage("");

    const { data, error } = await supabase.rpc(
      "admin_set_agence_verifiee",
      {
        p_agence_id: agence.id,
        p_verifiee: nouveauStatut,
      }
    );

    if (error) {
      console.error(
        "ERREUR VERIFICATION AGENCE :",
        error
      );

      setMessage(
        `Impossible de modifier le statut : ${error.message}`
      );
      setActionId(null);
      return;
    }

    if (!data) {
      setMessage(
        "L'agence n'a pas pu être mise à jour."
      );
      setActionId(null);
      return;
    }

    setAgences((liste) =>
      liste.map((item) =>
        item.id === agence.id
          ? {
              ...item,
              verifiee: nouveauStatut,
            }
          : item
      )
    );

    setMessage(
      nouveauStatut
        ? `✅ ${agence.nom_agence} est maintenant vérifiée.`
        : `${agence.nom_agence} n'est plus vérifiée.`
    );

    setActionId(null);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />

          <p className="text-gray-600 mt-5 font-medium">
            Chargement de l'administration...
          </p>
        </div>
      </main>
    );
  }

  const agencesVerifiees = agences.filter(
    (agence) => agence.verifiee
  ).length;

  const agencesNonVerifiees =
    agences.length - agencesVerifiees;

  return (
    <main className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <section className="bg-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div className="flex items-center gap-4">

              <div className="bg-white rounded-2xl p-3">
                <Image
                  src="/logo-fc-immo.png"
                  alt="FC Immo"
                  width={130}
                  height={60}
                  className="w-auto h-12 object-contain"
                />
              </div>

              <div>
                <p className="text-green-200 text-sm font-semibold uppercase tracking-wide">
                  Administration
                </p>

                <h1 className="text-3xl sm:text-4xl font-bold mt-1">
                  FC Immo
                </h1>

                <p className="text-green-100 mt-1">
                  Gestion des agences
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="bg-white text-green-700 px-5 py-3 rounded-xl font-semibold hover:bg-green-50 transition"
            >
              ← Retour au site
            </button>

          </div>

        </div>
      </section>

      {/* CONTENU */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <p className="text-gray-500 font-medium">
              Total agences
            </p>

            <p className="text-4xl font-extrabold text-gray-900 mt-2">
              {agences.length}
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <p className="text-gray-500 font-medium">
              Agences vérifiées
            </p>

            <p className="text-4xl font-extrabold text-green-700 mt-2">
              {agencesVerifiees}
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <p className="text-gray-500 font-medium">
              À vérifier
            </p>

            <p className="text-4xl font-extrabold text-orange-600 mt-2">
              {agencesNonVerifiees}
            </p>
          </div>

        </div>

        {/* MESSAGE */}
        {message && (
          <div className="mb-6 bg-white border border-green-200 rounded-2xl p-4 text-green-700 font-semibold">
            {message}
          </div>
        )}

        {/* AGENCES */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

          <div className="p-6 border-b border-gray-100">

            <h2 className="text-2xl font-bold text-gray-900">
              Agences
            </h2>

            <p className="text-gray-500 mt-1">
              Gérez la vérification des agences inscrites sur FC Immo.
            </p>

          </div>

          {agences.length === 0 ? (
            <div className="p-10 text-center">

              <div className="text-5xl mb-4">
                🏢
              </div>

              <p className="text-gray-500">
                Aucune agence enregistrée.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-gray-100">

              {agences.map((agence) => (
                <div
                  key={agence.id}
                  className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
                >

                  {/* INFORMATIONS */}
                  <div className="flex items-start gap-4 min-w-0">

                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-green-50 flex items-center justify-center text-2xl">
                      🏢
                    </div>

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="text-xl font-bold text-gray-900">
                          {agence.nom_agence || "Agence sans nom"}
                        </h3>

                        {agence.verifiee ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                            ✅ Vérifiée
                          </span>
                        ) : (
                          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                            ⏳ À vérifier
                          </span>
                        )}

                      </div>

                      <p className="text-gray-500 mt-1">
                        👤 {agence.responsable || "-"}
                      </p>

                      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-3">

                        {agence.ville && (
                          <span>
                            📍 {agence.ville}
                          </span>
                        )}

                        {agence.telephone && (
                          <span>
                            📞 {agence.telephone}
                          </span>
                        )}

                        {agence.email && (
                          <span className="break-all">
                            ✉️ {agence.email}
                          </span>
                        )}

                      </div>

                    </div>

                  </div>

                  {/* ACTION */}
                  <div className="w-full lg:w-auto shrink-0">

                    <button
                      type="button"
                      onClick={() =>
                        verifierAgence(agence)
                      }
                      disabled={
                        actionId === agence.id
                      }
                      className={`w-full lg:min-w-[230px] px-6 py-3 rounded-xl font-bold transition ${
                        actionId === agence.id
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : agence.verifiee
                          ? "border-2 border-red-500 text-red-600 hover:bg-red-50"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {actionId === agence.id
                        ? "Mise à jour..."
                        : agence.verifiee
                        ? "❌ Retirer la vérification"
                        : "✅ Vérifier l'agence"}
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}