"use client";

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
};

export default function MonAgencePage() {
  const router = useRouter();

  const [agence, setAgence] = useState<Agence | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/connexion");
      return;
    }

    const { data, error } = await supabase
      .from("agences")
      .select(
        "id, nom_agence, responsable, telephone, email, ville"
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("ERREUR CHARGEMENT AGENCE :", error);
      setMessage("Impossible de charger les informations de l'agence.");
      setLoading(false);
      return;
    }

    if (!data) {
      setMessage("Aucune agence associée à ce compte.");
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
      return;
    }

    setSaving(true);
    setMessage("");

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
      .select(
        "id, nom_agence, responsable, telephone, email, ville"
      )
      .maybeSingle();

    if (error) {
      console.error("ERREUR MODIFICATION AGENCE :", error);
      setMessage("Impossible d'enregistrer les modifications.");
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

    setMessage("✅ Les informations de votre agence ont été mises à jour.");
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">
          Chargement de votre agence...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* RETOUR */}
        <button
          onClick={() => router.push("/agence")}
          className="text-green-700 font-semibold hover:underline mb-6"
        >
          ← Retour au tableau de bord
        </button>

        {/* TITRE */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            🏢 Mon agence
          </h1>

          <p className="text-gray-500 mt-2">
            Consultez et modifiez les informations de votre agence.
          </p>
        </div>

        {/* MESSAGE AUCUNE AGENCE */}
        {!agence && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-5xl mb-4">
              🏢
            </div>

            <h2 className="text-xl font-bold text-gray-800">
              Agence introuvable
            </h2>

            <p className="text-gray-500 mt-2">
              {message}
            </p>
          </div>
        )}

        {/* FORMULAIRE */}
        {agence && (
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* NOM AGENCE */}
              <div className="md:col-span-2">
                <label className="block font-medium text-gray-700 mb-2">
                  Nom de l'agence
                </label>

                <input
                  type="text"
                  value={nomAgence}
                  onChange={(e) =>
                    setNomAgence(e.target.value)
                  }
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* RESPONSABLE */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Responsable
                </label>

                <input
                  type="text"
                  value={responsable}
                  onChange={(e) =>
                    setResponsable(e.target.value)
                  }
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* TELEPHONE */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Téléphone
                </label>

                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) =>
                    setTelephone(e.target.value)
                  }
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* EMAIL */}
              <div className="md:col-span-2">
                <label className="block font-medium text-gray-700 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* VILLE */}
              <div className="md:col-span-2">
                <label className="block font-medium text-gray-700 mb-2">
                  Ville
                </label>

                <select
                  value={ville}
                  onChange={(e) =>
                    setVille(e.target.value)
                  }
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Dakar">Dakar</option>
                  <option value="Rufisque">Rufisque</option>
                  <option value="Thiès">Thiès</option>
                  <option value="Mbour">Mbour</option>
                  <option value="Saint-Louis">
                    Saint-Louis
                  </option>
                  <option value="Ziguinchor">
                    Ziguinchor
                  </option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

            </div>

            {/* BOUTON */}
            <button
              type="button"
              onClick={enregistrer}
              disabled={saving}
              className="w-full mt-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl"
            >
              {saving
                ? "Enregistrement..."
                : "💾 Enregistrer les modifications"}
            </button>

            {/* MESSAGE */}
            {message && (
              <p className="text-center mt-5 font-medium text-gray-700">
                {message}
              </p>
            )}

          </div>
        )}

      </div>
    </main>
  );
}