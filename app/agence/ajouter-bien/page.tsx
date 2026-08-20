"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AjouterBienPage() {
  const router = useRouter();

  const [titre, setTitre] = useState("");
  const [typeBien, setTypeBien] = useState("Maison");
  const [transaction, setTransaction] = useState("Vente");
  const [ville, setVille] = useState("Dakar");
  const [quartier, setQuartier] = useState("");
  const [prix, setPrix] = useState("");
  const [chambres, setChambres] = useState("");
  const [sallesBain, setSallesBain] = useState("");
  const [surface, setSurface] = useState("");
  const [description, setDescription] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAjouterBien(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("UTILISATEUR CONNECTÉ :", user);

    if (!user) {
      setMessage("Vous devez être connecté.");
      setLoading(false);
      return;
    }

    const { data: agence, error: agenceError } = await supabase
      .from("agences")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (agenceError || !agence) {
      console.error("ERREUR AGENCE :", agenceError);
      setMessage("Impossible de trouver votre agence.");
      setLoading(false);
      return;
    }

    let imageUrl = "";

    // Upload de la photo
    if (image) {
      const extension = image.name.split(".").pop();
      const nomFichier = `${user.id}-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("bien-images")
        .upload(nomFichier, image);

      if (uploadError) {
        console.error("ERREUR UPLOAD PHOTO :", uploadError);
        setMessage("Impossible d'envoyer la photo.");
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("bien-images")
        .getPublicUrl(nomFichier);

      imageUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from("biens").insert({
  agence_id: agence.id,
  user_id: user.id,
  titre,
  type_bien: typeBien,
  transaction,
  statut: "Disponible",
  ville,
  quartier,
  prix: Number(prix),
  chambres: chambres ? Number(chambres) : null,
  salles_bain: sallesBain ? Number(sallesBain) : null,
  surface: surface ? Number(surface) : null,
  description,
  image_url: imageUrl || null,
});

    if (error) {
      console.error("ERREUR AJOUT BIEN :", error);
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("✅ Bien ajouté avec succès !");
    setLoading(false);

    setTimeout(() => {
      router.push("/agence/mes-biens");
    }, 1000);
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="mb-6">
          <button
            onClick={() => router.push("/agence")}
            className="text-green-700 font-semibold hover:underline"
          >
            ← Retour à mon espace
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-green-700">
              🏠 Ajouter un bien
            </h1>

            <p className="text-gray-600 mt-2">
              Publiez un nouveau bien immobilier sur Jokko.
            </p>
          </div>

          <form onSubmit={handleAjouterBien}>

            {/* TITRE */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Titre du bien
              </label>

              <input
                type="text"
                placeholder="Ex : Belle maison à Dakar"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300"
                required
              />
            </div>

            {/* TYPE + TRANSACTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Type de bien
                </label>

                <select
                  value={typeBien}
                  onChange={(e) => setTypeBien(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300"
                >
                  <option>Maison</option>
                  <option>Appartement</option>
                  <option>Terrain</option>
                  <option>Villa</option>
                  <option>Bureau</option>
                  <option>Commerce</option>
                  <option>Immeuble</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Transaction
                </label>

                <select
                  value={transaction}
                  onChange={(e) => setTransaction(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300"
                >
                  <option>Vente</option>
                  <option>Location</option>
                </select>
              </div>

            </div>

            {/* VILLE + QUARTIER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Ville
                </label>

                <select
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300"
                >
                  <option>Dakar</option>
                  <option>Rufisque</option>
                  <option>Thiès</option>
                  <option>Mbour</option>
                  <option>Saint-Louis</option>
                  <option>Ziguinchor</option>
                  <option>Autre</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Quartier
                </label>

                <input
                  type="text"
                  placeholder="Ex : Ouakam"
                  value={quartier}
                  onChange={(e) => setQuartier(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300"
                />
              </div>

            </div>

            {/* PRIX */}
            <div className="mt-5">
              <label className="block font-medium text-gray-700 mb-2">
                Prix (FCFA)
              </label>

              <input
                type="number"
                placeholder="Ex : 50000000"
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300"
                required
              />
            </div>

            {/* CARACTERISTIQUES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">

              <div>
                <label className="block font-medium text-gray-700 mb-2">
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
                <label className="block font-medium text-gray-700 mb-2">
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
                <label className="block font-medium text-gray-700 mb-2">
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

            {/* DESCRIPTION */}
            <div className="mt-5">
              <label className="block font-medium text-gray-700 mb-2">
                Description
              </label>

              <textarea
                rows={5}
                placeholder="Décrivez le bien..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300"
              />
            </div>

            {/* PHOTO */}
            <div className="mt-5">
              <label className="block font-medium text-gray-700 mb-2">
                📷 Photo du bien
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (!file) return;

                  setImage(file);
                  setImagePreview(URL.createObjectURL(file));
                }}
                className="w-full p-3 rounded-lg border border-gray-300"
              />

              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Aperçu du bien"
                    className="w-full max-h-80 object-cover rounded-xl"
                  />
                </div>
              )}
            </div>

            {/* BOUTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl"
            >
              {loading
                ? "Enregistrement..."
                : "Ajouter le bien"}
            </button>

            {/* MESSAGE */}
            {message && (
              <p className="text-center mt-5 font-medium text-gray-700">
                {message}
              </p>
            )}

          </form>
        </div>
      </div>
    </main>
  );
}