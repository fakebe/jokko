"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function InscriptionPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationPassword, setConfirmationPassword] = useState("");

  const [nomAgence, setNomAgence] = useState("");
  const [responsable, setResponsable] = useState("");
  const [telephone, setTelephone] = useState("");
  const [ville, setVille] = useState("Dakar");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleInscription(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    if (
      !nomAgence.trim() ||
      !responsable.trim() ||
      !telephone.trim() ||
      !email.trim() ||
      !password ||
      !confirmationPassword
    ) {
      setMessage("Veuillez remplir tous les champs.");
      setLoading(false);
      return;
    }

    if (password !== confirmationPassword) {
      setMessage("Les deux mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage(
        "Le mot de passe doit contenir au moins 6 caractères."
      );
      setLoading(false);
      return;
    }

    console.log("Création du compte...", email);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          nom_agence: nomAgence.trim(),
          responsable: responsable.trim(),
          telephone: telephone.trim(),
          ville,
        },
      },
    });

    console.log("Réponse inscription :", data, error);

    if (error) {
      console.error("ERREUR INSCRIPTION :", error);
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setMessage("Le compte n'a pas pu être créé.");
      setLoading(false);
      return;
    }

    setMessage(
      "✅ Compte créé ! Vérifie ton adresse email pour confirmer ton compte."
    );

    setLoading(false);

    setEmail("");
    setPassword("");
    setConfirmationPassword("");
    setNomAgence("");
    setResponsable("");
    setTelephone("");

    // On ne redirige pas immédiatement :
    // l'utilisateur doit d'abord confirmer son email.
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* EN-TÊTE */}
        <div className="text-center mb-8">

          <div className="text-4xl mb-3">
            🏡
          </div>

          <h1 className="text-3xl font-bold text-green-700">
            Rejoindre Jokko
          </h1>

          <p className="text-gray-600 mt-2">
            Créez votre compte professionnel et présentez vos biens
            aux futurs clients.
          </p>

        </div>

        {/* FORMULAIRE */}
        <form
          onSubmit={handleInscription}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* NOM AGENCE */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Nom de l'agence
              </label>

              <input
                type="text"
                placeholder="Ex : Dakar Immobilier"
                value={nomAgence}
                onChange={(e) => setNomAgence(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300"
              />
            </div>

            {/* RESPONSABLE */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Nom du responsable
              </label>

              <input
                type="text"
                placeholder="Votre nom"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300"
              />
            </div>

            {/* TELEPHONE */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Téléphone
              </label>

              <input
                type="tel"
                placeholder="77 000 00 00"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Email professionnel
              </label>

              <input
                type="email"
                placeholder="agence@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300"
              />
            </div>

          </div>

          {/* VILLE */}
          <div className="mt-5">

            <label className="block font-medium text-gray-700 mb-2">
              Ville
            </label>

            <select
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300"
            >
              <option value="Dakar">Dakar</option>
              <option value="Rufisque">Rufisque</option>
              <option value="Thiès">Thiès</option>
              <option value="Mbour">Mbour</option>
              <option value="Saint-Louis">Saint-Louis</option>
              <option value="Ziguinchor">Ziguinchor</option>
              <option value="Autre">Autre</option>
            </select>

          </div>

          {/* MOT DE PASSE */}
          <div className="mt-5">

            <label className="block font-medium text-gray-700 mb-2">
              Mot de passe
            </label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300"
            />

          </div>

          {/* CONFIRMATION */}
          <div className="mt-5">

            <label className="block font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>

            <input
              type="password"
              placeholder="••••••••"
              value={confirmationPassword}
              onChange={(e) =>
                setConfirmationPassword(e.target.value)
              }
              className="w-full p-3 rounded-lg border border-gray-300"
            />

          </div>

          {/* BOUTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl"
          >
            {loading
              ? "Création du compte..."
              : "Créer mon compte agence"}
          </button>

          {/* MESSAGE */}
          {message && (
            <p className="text-center mt-5 font-medium text-gray-700">
              {message}
            </p>
          )}

          <p className="text-center text-sm text-gray-500 mt-5">
            En créant votre compte, vous acceptez les conditions
            d'utilisation de Jokko.
          </p>

        </form>

        {/* CONNEXION */}
        <div className="text-center mt-6">

          <p className="text-gray-500">
            Vous avez déjà un compte ?
          </p>

          <button
            type="button"
            onClick={() => router.push("/connexion")}
            className="text-green-700 font-semibold hover:underline mt-1"
          >
            Se connecter
          </button>

        </div>

      </div>
    </main>
  );
}