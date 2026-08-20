"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ModifierBienPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [titre, setTitre] = useState("");
  const [typeBien, setTypeBien] = useState("");
  const [transaction, setTransaction] = useState("");
  const [ville, setVille] = useState("");
  const [quartier, setQuartier] = useState("");
  const [prix, setPrix] = useState("");
  const [chambres, setChambres] = useState("");
  const [sallesBain, setSallesBain] = useState("");
  const [surface, setSurface] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    chargerBien();
  }, [id]);

  async function chargerBien() {
    setLoading(true);

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
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      console.error("ERREUR CHARGEMENT BIEN :", error);
      setMessage("Impossible de trouver ce bien.");
      setLoading(false);
      return;
    }

    setTitre(data.titre || "");
    setTypeBien(data.type_bien || "");
    setTransaction(data.transaction || "");
    setVille(data.ville || "");
    setQuartier(data.quartier || "");
    setPrix(data.prix?.toString() || "");
    setChambres(data.chambres?.toString() || "");
    setSallesBain(data.salles_bain?.toString() || "");
    setSurface(data.surface?.toString() || "");
    setDescription(data.description || "");

    setLoading(false);
  }

  async function modifierBien(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Vous devez être connecté.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("biens")
      .update({
        titre,
        type_bien: typeBien,
        transaction,
        ville,
        quartier,
        prix: Number(prix),
        chambres: chambres ? Number(chambres) : null,
        salles_bain: sallesBain ? Number(sallesBain) : null,
        surface: surface ? Number(surface) : null,
        description,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("ERREUR MODIFICATION BIEN :", error);
      setMessage("Impossible de modifier le bien.");
      setSaving(false);
      return;
    }

    setMessage("✅ Bien modifié avec succès !");
    setSaving(false);

    setTimeout(() => {
      router.push("/agence/mes-biens");
    }, 1000);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">
          Chargement du bien...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        <button
          onClick={() => router.push("/agence/mes-biens")}
          className="text-green-700 font-semibold hover:underline mb-6"
        >
          ← Retour à mes biens
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">

          <h1 className="text-3xl font-bold text-green-700 mb-2">
            ✏️ Modifier le bien
          </h1>

          <p className="text-gray-500 mb-8">
            Modifiez les informations de votre bien immobilier.
          </p>

          <form onSubmit={modifierBien} className="space-y-5">

            <div>
              <label className="block font-semibold mb-2">
                Titre du bien
              </label>

              <input
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                required
                className="w-full p-3 rounded-lg border border-gray-300"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">

              <div>
                <label className="block font-semibold mb-2">
                  Type de bien
                </label>

                <select
                  value={typeBien}
                  onChange={(e) => setTypeBien(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg border border-gray-300 bg-white"
                >
                  <option value="">Choisir</option>
                  <option value="Maison">Maison</option>
                  <option value="Appartement">Appartement</option>
                  <option value="Villa">Villa</option>
                  <option value="Terrain">Terrain</option>
                  <option value="Bureau">Bureau</option>
                  <option value="Commerce">Commerce</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Transaction
                </label>

                <select
                  value={transaction}
                  onChange={(e) => setTransaction(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg border border-gray-300 bg-white"
                >
                  <option value="">Choisir</option>
                  <option value="Vente">Vente</option>
                  <option value="Location">Location</option>
                </select>
              </div>

            </div>

            <div className="grid md:grid-cols-2 gap-5">

              <div>
                <label className="block font-semibold mb-2">
                  Ville
                </label>

                <select
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg border border-gray-300 bg-white"
                >
                  <option value="">Choisir une ville</option>
                  <option value="Dakar">Dakar</option>
                  <option value="Rufisque">Rufisque</option>
                  <option value="Thiès">Thiès</option>
                  <option value="Mbour">Mbour</option>
                  <option value="Saint-Louis">Saint-Louis</option>
                  <option value="Ziguinchor">Ziguinchor</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Quartier
                </label>

                <input
                  type="text"
                  value={quartier}
                  onChange={(e) => setQuartier(e.target.value)}
                  placeholder="Ex : Ouakam"
                  className="w-full p-3 rounded-lg border border-gray-300"
                />
              </div>

            </div>

            <div>
              <label className="block font-semibold mb-2">
                Prix (FCFA)
              </label>

              <input
                type="number"
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
                required
                className="w-full p-3 rounded-lg border border-gray-300"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <div>
                <label className="block font-semibold mb-2">
                  Chambres
                </label>

                <input
                  type="number"
                  min="0"
                  value={chambres}
                  onChange={(e) => setChambres(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Salles de bain
                </label>

                <input
                  type="number"
                  min="0"
                  value={sallesBain}
                  onChange={(e) => setSallesBain(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Surface (m²)
                </label>

                <input
                  type="number"
                  min="0"
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300"
                />
              </div>

            </div>

            <div>
              <label className="block font-semibold mb-2">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Décrivez le bien..."
                className="w-full p-3 rounded-lg border border-gray-300"
              />
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.includes("succès")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl"
            >
              {saving ? "Enregistrement..." : "💾 Enregistrer les modifications"}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}