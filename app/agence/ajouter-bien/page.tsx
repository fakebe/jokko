"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
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
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");
  const [loading, setLoading] = useState(false);

  async function handleAjouterBien(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setMessage("");
    setMessageType("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Vous devez être connecté pour ajouter un bien.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (!titre.trim()) {
      setMessage("Veuillez renseigner le titre du bien.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (!prix || Number(prix) <= 0) {
      setMessage("Veuillez renseigner un prix valide.");
      setMessageType("error");
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

      setMessage(
        "Impossible de trouver votre agence. Vérifiez votre profil agence."
      );
      setMessageType("error");
      setLoading(false);
      return;
    }

    let imageUrl = "";

    // Upload de la photo
    if (image) {
      const extension =
        image.name.split(".").pop()?.toLowerCase() || "jpg";

      const nomFichier = `${user.id}-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("bien-images")
        .upload(nomFichier, image);

      if (uploadError) {
        console.error(
          "ERREUR UPLOAD PHOTO :",
          uploadError
        );

        setMessage(
          "Impossible d'envoyer la photo. Vérifiez le fichier et réessayez."
        );
        setMessageType("error");
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
      titre: titre.trim(),
      type_bien: typeBien,
      transaction,
      statut: "Disponible",
      ville,
      quartier: quartier.trim() || null,
      prix: Number(prix),
      chambres: chambres ? Number(chambres) : null,
      salles_bain: sallesBain
        ? Number(sallesBain)
        : null,
      surface: surface ? Number(surface) : null,
      description: description.trim() || null,
      image_url: imageUrl || null,
    });

    if (error) {
      console.error(
        "ERREUR AJOUT BIEN :",
        error
      );

      setMessage(
        `Impossible d'ajouter le bien : ${error.message}`
      );
      setMessageType("error");
      setLoading(false);
      return;
    }

    setMessage("✅ Bien ajouté avec succès !");
    setMessageType("success");
    setLoading(false);

    setTimeout(() => {
      router.push("/agence/mes-biens");
      router.refresh();
    }, 1000);
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
              ← Retour à mon espace
            </button>
          </div>

          {/* EN-TÊTE */}
          <div className="bg-green-700 text-white rounded-3xl p-6 sm:p-8 mb-6 shadow-sm">

            <div className="flex flex-col sm:flex-row sm:items-center gap-5">

              <div className="bg-white rounded-2xl p-3 w-fit">
                <Image
                  src="/logo-fc-immo.png"
                  alt="FC Immo"
                  width={130}
                  height={60}
                  className="w-auto h-12 object-contain"
                />
              </div>

              <div>
                <p className="text-green-200 text-sm font-medium">
                  Espace professionnel
                </p>

                <h1 className="text-3xl sm:text-4xl font-bold mt-1">
                  Ajouter un bien
                </h1>

                <p className="text-green-100 mt-2">
                  Publiez une nouvelle annonce immobilière sur FC Immo.
                </p>
              </div>

            </div>
          </div>

          {/* FORMULAIRE */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-8">

            <form onSubmit={handleAjouterBien}>

              {/* INFORMATIONS PRINCIPALES */}
              <section>

                <div className="mb-5">
                  <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                    Étape 1
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-1">
                    Informations principales
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Donnez les informations essentielles de votre bien.
                  </p>
                </div>

                {/* TITRE */}
                <div>
                  <label
                    htmlFor="titre"
                    className="block font-semibold text-gray-700 mb-2"
                  >
                    Titre du bien *
                  </label>

                  <input
                    id="titre"
                    type="text"
                    placeholder="Ex : Belle maison familiale à Dakar"
                    value={titre}
                    onChange={(e) =>
                      setTitre(e.target.value)
                    }
                    className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                {/* TYPE + TRANSACTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

                  <div>
                    <label
                      htmlFor="typeBien"
                      className="block font-semibold text-gray-700 mb-2"
                    >
                      Type de bien
                    </label>

                    <select
                      id="typeBien"
                      value={typeBien}
                      onChange={(e) =>
                        setTypeBien(e.target.value)
                      }
                      className="w-full p-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    <label
                      htmlFor="transaction"
                      className="block font-semibold text-gray-700 mb-2"
                    >
                      Transaction
                    </label>

                    <select
                      id="transaction"
                      value={transaction}
                      onChange={(e) =>
                        setTransaction(e.target.value)
                      }
                      className="w-full p-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option>Vente</option>
                      <option>Location</option>
                    </select>
                  </div>

                </div>

              </section>

              {/* LOCALISATION */}
              <section className="mt-10 pt-8 border-t border-gray-100">

                <div className="mb-5">
                  <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                    Étape 2
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-1">
                    Localisation
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Indiquez où se trouve le bien.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div>
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
                    <label
                      htmlFor="quartier"
                      className="block font-semibold text-gray-700 mb-2"
                    >
                      Quartier
                    </label>

                    <input
                      id="quartier"
                      type="text"
                      placeholder="Ex : Ouakam"
                      value={quartier}
                      onChange={(e) =>
                        setQuartier(e.target.value)
                      }
                      className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                </div>

              </section>

              {/* PRIX ET CARACTÉRISTIQUES */}
              <section className="mt-10 pt-8 border-t border-gray-100">

                <div className="mb-5">
                  <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                    Étape 3
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-1">
                    Prix et caractéristiques
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Précisez le prix et les principales caractéristiques.
                  </p>
                </div>

                {/* PRIX */}
                <div>
                  <label
                    htmlFor="prix"
                    className="block font-semibold text-gray-700 mb-2"
                  >
                    Prix (FCFA) *
                  </label>

                  <div className="relative">
                    <input
                      id="prix"
                      type="number"
                      min="1"
                      placeholder="Ex : 50000000"
                      value={prix}
                      onChange={(e) =>
                        setPrix(e.target.value)
                      }
                      className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                {/* CARACTÉRISTIQUES */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-5">

                  <div>
                    <label
                      htmlFor="chambres"
                      className="block font-semibold text-gray-700 mb-2"
                    >
                      Chambres
                    </label>

                    <input
                      id="chambres"
                      type="number"
                      min="0"
                      placeholder="Ex : 3"
                      value={chambres}
                      onChange={(e) =>
                        setChambres(e.target.value)
                      }
                      className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="sallesBain"
                      className="block font-semibold text-gray-700 mb-2"
                    >
                      Salles de bain
                    </label>

                    <input
                      id="sallesBain"
                      type="number"
                      min="0"
                      placeholder="Ex : 2"
                      value={sallesBain}
                      onChange={(e) =>
                        setSallesBain(e.target.value)
                      }
                      className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="surface"
                      className="block font-semibold text-gray-700 mb-2"
                    >
                      Surface (m²)
                    </label>

                    <input
                      id="surface"
                      type="number"
                      min="0"
                      placeholder="Ex : 150"
                      value={surface}
                      onChange={(e) =>
                        setSurface(e.target.value)
                      }
                      className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                </div>

              </section>

              {/* DESCRIPTION */}
              <section className="mt-10 pt-8 border-t border-gray-100">

                <div className="mb-5">
                  <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                    Étape 4
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-1">
                    Description
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Présentez votre bien aux futurs acheteurs ou locataires.
                  </p>
                </div>

                <textarea
                  id="description"
                  rows={7}
                  placeholder="Ex : Belle maison située dans un quartier calme..."
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  className="w-full p-4 rounded-xl border border-gray-200 resize-y focus:outline-none focus:ring-2 focus:ring-green-500"
                />

              </section>

              {/* PHOTO */}
              <section className="mt-10 pt-8 border-t border-gray-100">

                <div className="mb-5">
                  <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                    Étape 5
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-1">
                    Photo du bien
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Ajoutez une photo claire et attractive de votre bien.
                  </p>
                </div>

                <label
                  htmlFor="image"
                  className="block border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-green-500 transition cursor-pointer"
                >
                  <div className="text-4xl">
                    📷
                  </div>

                  <p className="font-semibold text-gray-800 mt-3">
                    Choisir une photo
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    JPG, PNG ou autre image
                  </p>

                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file =
                        e.target.files?.[0];

                      if (!file) return;

                      setImage(file);
                      setImagePreview(
                        URL.createObjectURL(file)
                      );
                    }}
                  />
                </label>

                {imagePreview && (
                  <div className="mt-5 relative">

                    <img
                      src={imagePreview}
                      alt="Aperçu du bien"
                      className="w-full max-h-96 object-cover rounded-2xl border border-gray-200"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview("");
                      }}
                      className="absolute top-3 right-3 bg-white text-red-600 px-4 py-2 rounded-xl shadow-md font-semibold hover:bg-red-50"
                    >
                      Supprimer la photo
                    </button>

                  </div>
                )}

              </section>

              {/* MESSAGE */}
              {message && (
                <div
                  className={`mt-8 p-4 rounded-xl font-semibold text-center ${
                    messageType === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* BOUTONS */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">

                <button
                  type="button"
                  onClick={() =>
                    router.push("/agence/mes-biens")
                  }
                  disabled={loading}
                  className="w-full sm:w-1/3 border-2 border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-2/3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3.5 rounded-xl transition"
                >
                  {loading
                    ? "Publication en cours..."
                    : "✅ Publier le bien"}
                </button>

              </div>

            </form>
          </div>

        </div>
      </main>
    </>
  );
}