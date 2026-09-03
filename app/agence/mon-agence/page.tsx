"use client";

import Image from "next/image";
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

export default function MonAgencePage() {
  const router = useRouter();

  const [agence, setAgence] = useState<Agence | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">(
    ""
  );

  const [nomAgence, setNomAgence] = useState("");
  const [responsable, setResponsable] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [ville, setVille] = useState("Dakar");

  useEffect(() => {
    chargerAgence();
  }, []);

  async function chargerAgence() {
    setLoading(true);
    setMessage("");
    setMessageType("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/connexion");
      return;
    }

    const { data, error } = await supabase
      .from("agences")
      .select("id, nom_agence, responsable, telephone, email, ville")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("ERREUR CHARGEMENT AGENCE :", error);
      setMessage("Impossible de charger les informations de l'agence.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (!data) {
      setMessage("Aucune agence associée à ce compte.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    setAgence(data);

    setNomAgence(data.nom_agence || "");
    setResponsable(data.responsable || "");
    setTelephone(data.telephone || "");
    setEmail(data.email || "");
    setVille(data.ville || "Dakar");

    setLoading(false);
  }

  async function enregistrer() {
    if (!agence) return;

    if (
      !nomAgence.trim() ||
      !responsable.trim() ||
      !telephone.trim() ||
      !email.trim() ||
      !ville.trim()
    ) {
      setMessage("Veuillez remplir tous les champs.");
      setMessageType("error");
      return;
    }

    setSaving(true);
    setMessage("");
    setMessageType("");

    const { data, error } = await supabase
      .from("agences")
      .update({
        nom_agence: nomAgence.trim(),
        responsable: responsable.trim(),
        telephone: telephone.trim(),
        email: email.trim(),
        ville: ville.trim(),
      })
      .eq("id", agence.id)
      .select("id, nom_agence, responsable, telephone, email, ville")
      .maybeSingle();

    if (error) {
      console.error("ERREUR MODIFICATION AGENCE :", error);
      setMessage("Impossible d'enregistrer les modifications.");
      setMessageType("error");
      setSaving(false);
      return;
    }

    if (data) {
      setAgence(data);

      setNomAgence(data.nom_agence || "");
      setResponsable(data.responsable || "");
      setTelephone(data.telephone || "");
      setEmail(data.email || "");
      setVille(data.ville || "Dakar");
    }

    setMessage("Les informations de votre agence ont été mises à jour.");
    setMessageType("success");
    setSaving(false);
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />

            <p className="text-gray-600 mt-5 font-medium">
              Chargement de votre agence...
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">

          {/* RETOUR */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => router.push("/agence")}
              className="inline-flex items-center gap-2 text-green-700 font-semibold hover:text-green-900 transition"
            >
              ← Retour au tableau de bord
            </button>
          </div>

          {/* EN-TÊTE */}
          <section className="bg-green-700 text-white rounded-3xl p-6 sm:p-8 mb-6 shadow-sm">

            <div className="flex flex-col sm:flex-row sm:items-center gap-5">

              <div className="bg-white rounded-2xl p-3 w-fit shadow-sm">
                <Image
                  src="/logo-fc-immo.png"
                  alt="FC Immo"
                  width={140}
                  height={65}
                  className="w-auto h-14 object-contain"
                />
              </div>

              <div>
                <p className="text-green-200 text-sm font-semibold uppercase tracking-wide">
                  Espace professionnel
                </p>

                <h1 className="text-3xl sm:text-4xl font-bold mt-1">
                  Mon agence
                </h1>

                <p className="text-green-100 mt-2">
                  Gérez les informations visibles sur votre agence.
                </p>
              </div>

            </div>
          </section>

          {/* AUCUNE AGENCE */}
          {!agence && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10 text-center">

              <div className="w-20 h-20 mx-auto rounded-2xl bg-green-50 flex items-center justify-center text-5xl">
                🏢
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mt-6">
                Agence introuvable
              </h2>

              <p className="text-gray-500 mt-2">
                {message}
              </p>

            </div>
          )}

          {/* PROFIL AGENCE */}
          {agence && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-8">

              <div className="mb-8">
                <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                  Profil
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-1">
                  Informations de votre agence
                </h2>

                <p className="text-gray-500 mt-2">
                  Ces informations pourront être utilisées pour présenter votre
                  agence aux visiteurs de FC Immo.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* NOM */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="nomAgence"
                    className="block font-semibold text-gray-700 mb-2"
                  >
                    Nom de l'agence
                  </label>

                  <input
                    id="nomAgence"
                    type="text"
                    value={nomAgence}
                    onChange={(e) =>
                      setNomAgence(e.target.value)
                    }
                    placeholder="Ex : FC Immo Sénégal"
                    className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* RESPONSABLE */}
                <div>
                  <label
                    htmlFor="responsable"
                    className="block font-semibold text-gray-700 mb-2"
                  >
                    Responsable
                  </label>

                  <input
                    id="responsable"
                    type="text"
                    value={responsable}
                    onChange={(e) =>
                      setResponsable(e.target.value)
                    }
                    placeholder="Nom du responsable"
                    className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* TELEPHONE */}
                <div>
                  <label
                    htmlFor="telephone"
                    className="block font-semibold text-gray-700 mb-2"
                  >
                    Téléphone
                  </label>

                  <input
                    id="telephone"
                    type="tel"
                    value={telephone}
                    onChange={(e) =>
                      setTelephone(e.target.value)
                    }
                    placeholder="Ex : 77 123 45 67"
                    className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* EMAIL */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="email"
                    className="block font-semibold text-gray-700 mb-2"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="contact@agence.com"
                    className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* VILLE */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="ville"
                    className="block font-semibold text-gray-700 mb-2"
                  >
                    Ville
                  </label>

                  <select
                    id="ville"
                    value={ville}
                    onChange={(e) =>
                      setVille(e.target.value)
                    }
                    className="w-full p-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
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

              </div>

              {/* APERÇU */}
              <div className="mt-10 pt-8 border-t border-gray-100">

                <div className="mb-5">
                  <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                    Aperçu
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mt-1">
                    Votre agence
                  </h3>
                </div>

                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5 sm:p-6">

                  <div className="flex items-center gap-4">

                    <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-2xl">
                      🏢
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-bold text-lg text-gray-900 truncate">
                        {nomAgence || "Nom de votre agence"}
                      </h4>

                      <p className="text-sm text-gray-500">
                        Agence immobilière • {ville || "Ville"}
                      </p>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">

                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-400">
                        Responsable
                      </p>

                      <p className="text-sm font-semibold text-gray-800 mt-1">
                        {responsable || "-"}
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-400">
                        Téléphone
                      </p>

                      <p className="text-sm font-semibold text-gray-800 mt-1">
                        {telephone || "-"}
                      </p>
                    </div>

                  </div>
                </div>
              </div>

              {/* MESSAGE */}
              {message && (
                <div
                  className={`mt-8 p-4 rounded-xl text-center font-semibold ${
                    messageType === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {messageType === "success"
                    ? "✅ "
                    : "⚠️ "}
                  {message}
                </div>
              )}

              {/* BOUTONS */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">

                <button
                  type="button"
                  onClick={() =>
                    router.push("/agence")
                  }
                  disabled={saving}
                  className="w-full sm:w-1/3 border-2 border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={enregistrer}
                  disabled={saving}
                  className="w-full sm:w-2/3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3.5 rounded-xl transition"
                >
                  {saving
                    ? "Enregistrement..."
                    : "💾 Enregistrer les modifications"}
                </button>

              </div>

            </div>
          )}

        </div>
      </main>
    </>
  );
}