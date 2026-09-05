"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

type BienImage = {
  id: string;
  image_url: string;
  ordre: number;
};

export default function ModifierBienPage() {
  const router = useRouter();
  const params = useParams();

  const id = String(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photosLoading, setPhotosLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");

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

  const [imagePrincipale, setImagePrincipale] = useState("");
  const [photos, setPhotos] = useState<BienImage[]>([]);
  const [nouvellesImages, setNouvellesImages] = useState<File[]>([]);
  const [nouveauxApercus, setNouveauxApercus] = useState<string[]>([]);

  useEffect(() => {
    chargerBien();
  }, [id]);

  useEffect(() => {
    return () => {
      nouveauxApercus.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [nouveauxApercus]);

  async function chargerBien() {
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
      .from("biens")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      console.error("ERREUR CHARGEMENT BIEN :", error);
      setMessage("Impossible de trouver ce bien.");
      setMessageType("error");
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

    if (data.image_url) {
      setImagePrincipale(data.image_url);
    }

    await chargerPhotos(data.id, data.image_url);

    setLoading(false);
  }

  async function chargerPhotos(
    bienId: string,
    imageUrlPrincipale: string | null
  ) {
    setPhotosLoading(true);

    const { data, error } = await supabase
      .from("bien_images")
      .select("id, image_url, ordre")
      .eq("bien_id", bienId)
      .order("ordre", { ascending: true });

    if (error) {
      console.error("ERREUR CHARGEMENT PHOTOS :", error);
      setPhotos([]);
      setPhotosLoading(false);
      return;
    }

    let liste = (data || []) as BienImage[];

    /*
     * Compatibilité avec les anciennes annonces :
     * image_url peut exister dans biens sans ligne dans bien_images.
     */
    if (
      imageUrlPrincipale &&
      !liste.some(
        (photo) => photo.image_url === imageUrlPrincipale
      )
    ) {
      liste = [
        {
          id: `ancienne-${bienId}`,
          image_url: imageUrlPrincipale,
          ordre: -1,
        },
        ...liste,
      ];
    }

    setPhotos(liste);

    if (!imagePrincipale && liste.length > 0) {
      setImagePrincipale(liste[0].image_url);
    }

    setPhotosLoading(false);
  }

  function choisirNouvellesImages(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const fichiers = Array.from(e.target.files || []);

    if (fichiers.length === 0) {
      return;
    }

    const imagesValides = fichiers.filter((file) =>
      file.type.startsWith("image/")
    );

    if (imagesValides.length === 0) {
      setMessage("Veuillez sélectionner uniquement des images.");
      setMessageType("error");
      return;
    }

    nouveauxApercus.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    setNouvellesImages(imagesValides);

    setNouveauxApercus(
      imagesValides.map((file) =>
        URL.createObjectURL(file)
      )
    );

    setMessage("");
    setMessageType("");

    e.target.value = "";
  }

  function supprimerNouvelleImage(index: number) {
    const url = nouveauxApercus[index];

    if (url) {
      URL.revokeObjectURL(url);
    }

    setNouvellesImages((anciennes) =>
      anciennes.filter((_, i) => i !== index)
    );

    setNouveauxApercus((anciens) =>
      anciens.filter((_, i) => i !== index)
    );
  }

  async function supprimerPhoto(photo: BienImage) {
    const anciennePhoto = photo.id.startsWith("ancienne-");

    if (anciennePhoto) {
      if (imagePrincipale === photo.image_url) {
        setImagePrincipale("");
      }

      setPhotos((anciennes) =>
        anciennes.filter((p) => p.id !== photo.id)
      );

      const { data: userData } =
        await supabase.auth.getUser();

      if (userData.user) {
        const remaining = photos.filter(
          (p) => p.id !== photo.id
        );

        const nouvellePrincipale =
          remaining.length > 0
            ? remaining[0].image_url
            : null;

        await supabase
          .from("biens")
          .update({
            image_url: nouvellePrincipale,
          })
          .eq("id", id)
          .eq("user_id", userData.user.id);

        setImagePrincipale(
          nouvellePrincipale || ""
        );
      }

      return;
    }

    const confirmer = window.confirm(
      "Voulez-vous supprimer cette photo ?"
    );

    if (!confirmer) {
      return;
    }

    const { error } = await supabase
      .from("bien_images")
      .delete()
      .eq("id", photo.id)
      .eq("bien_id", id);

    if (error) {
      console.error(
        "ERREUR SUPPRESSION PHOTO :",
        error
      );

      setMessage(
        "Impossible de supprimer cette photo."
      );
      setMessageType("error");
      return;
    }

    const nouvellesPhotos = photos.filter(
      (p) => p.id !== photo.id
    );

    setPhotos(nouvellesPhotos);

    if (imagePrincipale === photo.image_url) {
      const nouvellePrincipale =
        nouvellesPhotos.length > 0
          ? nouvellesPhotos[0].image_url
          : "";

      setImagePrincipale(nouvellePrincipale);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("biens")
          .update({
            image_url:
              nouvellePrincipale || null,
          })
          .eq("id", id)
          .eq("user_id", user.id);
      }
    }
  }

  async function choisirPhotoPrincipale(
    photoUrl: string
  ) {
    setImagePrincipale(photoUrl);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { error } = await supabase
      .from("biens")
      .update({
        image_url: photoUrl,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error(
        "ERREUR PHOTO PRINCIPALE :",
        error
      );

      setMessage(
        "Impossible de définir la photo principale."
      );
      setMessageType("error");
      return;
    }

    setMessage("Photo principale mise à jour.");
    setMessageType("success");
  }

  async function ajouterPhotos() {
    if (nouvellesImages.length === 0) {
      return;
    }

    setPhotosLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Vous devez être connecté.");
        setMessageType("error");
        setPhotosLoading(false);
        return;
      }

      const photosExistantes = photos.filter(
        (photo) =>
          !photo.id.startsWith("ancienne-")
      );

      let ordre =
        photosExistantes.length > 0
          ? Math.max(
              ...photosExistantes.map(
                (photo) => photo.ordre
              )
            ) + 1
          : 0;

      const photosAjoutees: BienImage[] = [];

      for (const image of nouvellesImages) {
        const extension =
          image.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const nomFichier =
          `${user.id}-${id}-${Date.now()}-${ordre}.${extension}`;

        const { error: uploadError } =
          await supabase.storage
            .from("bien-images")
            .upload(nomFichier, image);

        if (uploadError) {
          console.error(
            "ERREUR UPLOAD :",
            uploadError
          );

          setMessage(
            "Impossible d'envoyer une des nouvelles photos."
          );
          setMessageType("error");
          setPhotosLoading(false);
          return;
        }

        const { data: urlData } =
          supabase.storage
            .from("bien-images")
            .getPublicUrl(nomFichier);

        photosAjoutees.push({
          id: `nouvelle-${Date.now()}-${ordre}`,
          image_url: urlData.publicUrl,
          ordre,
        });

        ordre++;
      }

      const lignes = photosAjoutees.map(
        (photo) => ({
          bien_id: id,
          image_url: photo.image_url,
          ordre: photo.ordre,
        })
      );

      const { data: insertedPhotos, error } =
        await supabase
          .from("bien_images")
          .insert(lignes)
          .select("id, image_url, ordre");

      if (error) {
        console.error(
          "ERREUR ENREGISTREMENT PHOTOS :",
          error
        );

        setMessage(
          `Impossible d'enregistrer les photos : ${error.message}`
        );
        setMessageType("error");
        setPhotosLoading(false);
        return;
      }

      if (insertedPhotos) {
        const listeComplete = [
          ...photos,
          ...(insertedPhotos as BienImage[]),
        ];

        setPhotos(listeComplete);

        /*
         * S'il n'existe pas encore de photo principale,
         * la première nouvelle photo devient principale.
         */
        if (
          !imagePrincipale &&
          insertedPhotos.length > 0
        ) {
          const premiere =
            insertedPhotos[0].image_url;

          setImagePrincipale(premiere);

          await supabase
            .from("biens")
            .update({
              image_url: premiere,
            })
            .eq("id", id)
            .eq("user_id", user.id);
        }
      }

      nouveauxApercus.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      setNouvellesImages([]);
      setNouveauxApercus([]);

      setMessage(
        `${insertedPhotos?.length || 0} photo(s) ajoutée(s) avec succès.`
      );
      setMessageType("success");
    } catch (error) {
      console.error(
        "ERREUR AJOUT PHOTOS :",
        error
      );

      setMessage(
        "Une erreur est survenue lors de l'ajout des photos."
      );
      setMessageType("error");
    }

    setPhotosLoading(false);
  }

  async function modifierBien(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setMessageType("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Vous devez être connecté.");
      setMessageType("error");
      setSaving(false);
      return;
    }

    if (!titre.trim()) {
      setMessage(
        "Veuillez renseigner le titre du bien."
      );
      setMessageType("error");
      setSaving(false);
      return;
    }

    if (!prix || Number(prix) <= 0) {
      setMessage("Veuillez renseigner un prix valide.");
      setMessageType("error");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("biens")
      .update({
        titre: titre.trim(),
        type_bien: typeBien,
        transaction,
        ville: ville.trim(),
        quartier: quartier.trim() || null,
        prix: Number(prix),
        chambres: chambres
          ? Number(chambres)
          : null,
        salles_bain: sallesBain
          ? Number(sallesBain)
          : null,
        surface: surface
          ? Number(surface)
          : null,
        description:
          description.trim() || null,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error(
        "ERREUR MODIFICATION BIEN :",
        error
      );

      setMessage(
        "Impossible de modifier le bien."
      );
      setMessageType("error");
      setSaving(false);
      return;
    }

    setMessage(
      "Bien modifié avec succès."
    );
    setMessageType("success");
    setSaving(false);

    setTimeout(() => {
      router.push("/agence/mes-biens");
      router.refresh();
    }, 1000);
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />

            <p className="text-gray-600 mt-5">
              Chargement du bien...
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
        <div className="max-w-5xl mx-auto">

          {/* RETOUR */}
          <button
            type="button"
            onClick={() =>
              router.push("/agence/mes-biens")
            }
            className="text-green-700 font-semibold hover:text-green-900 transition mb-6"
          >
            ← Retour à mes biens
          </button>

          {/* EN-TÊTE */}
          <div className="bg-green-700 text-white rounded-3xl p-6 sm:p-8 mb-6">

            <p className="text-green-200 text-sm font-semibold uppercase tracking-wide">
              Espace professionnel
            </p>

            <h1 className="text-3xl sm:text-4xl font-bold mt-1">
              Modifier le bien
            </h1>

            <p className="text-green-100 mt-2">
              Modifiez les informations et les photos de votre annonce.
            </p>

          </div>

          {/* FORMULAIRE */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-8">

            <form onSubmit={modifierBien}>

              {/* INFORMATIONS */}
              <section>

                <h2 className="text-2xl font-bold text-gray-900">
                  Informations du bien
                </h2>

                <p className="text-gray-500 mt-1">
                  Mettez à jour les informations principales de l'annonce.
                </p>

                <div className="mt-6">

                  <label
                    htmlFor="titre"
                    className="block font-semibold text-gray-700 mb-2"
                  >
                    Titre du bien
                  </label>

                  <input
                    id="titre"
                    type="text"
                    value={titre}
                    onChange={(e) =>
                      setTitre(e.target.value)
                    }
                    required
                    className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />

                </div>

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
                      required
                      className="w-full p-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">
                        Choisir
                      </option>

                      <option value="Maison">
                        Maison
                      </option>

                      <option value="Appartement">
                        Appartement
                      </option>

                      <option value="Villa">
                        Villa
                      </option>

                      <option value="Terrain">
                        Terrain
                      </option>

                      <option value="Bureau">
                        Bureau
                      </option>

                      <option value="Commerce">
                        Commerce
                      </option>

                      <option value="Immeuble">
                        Immeuble
                      </option>
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
                      required
                      className="w-full p-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">
                        Choisir
                      </option>

                      <option value="Vente">
                        Vente
                      </option>

                      <option value="Location">
                        Location
                      </option>
                    </select>
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

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
                      required
                      className="w-full p-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">
                        Choisir une ville
                      </option>

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
                      value={quartier}
                      onChange={(e) =>
                        setQuartier(e.target.value)
                      }
                      placeholder="Ex : Ouakam"
                      className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                </div>

                <div className="mt-5">

                  <label
                    htmlFor="prix"
                    className="block font-semibold text-gray-700 mb-2"
                  >
                    Prix (FCFA)
                  </label>

                  <input
                    id="prix"
                    type="number"
                    min="1"
                    value={prix}
                    onChange={(e) =>
                      setPrix(e.target.value)
                    }
                    required
                    className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-5">

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Chambres
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={chambres}
                      onChange={(e) =>
                        setChambres(e.target.value)
                      }
                      className="w-full p-3.5 rounded-xl border border-gray-200"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Salles de bain
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={sallesBain}
                      onChange={(e) =>
                        setSallesBain(e.target.value)
                      }
                      className="w-full p-3.5 rounded-xl border border-gray-200"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Surface (m²)
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={surface}
                      onChange={(e) =>
                        setSurface(e.target.value)
                      }
                      className="w-full p-3.5 rounded-xl border border-gray-200"
                    />
                  </div>

                </div>

                <div className="mt-5">

                  <label
                    htmlFor="description"
                    className="block font-semibold text-gray-700 mb-2"
                  >
                    Description
                  </label>

                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    rows={6}
                    placeholder="Décrivez le bien..."
                    className="w-full p-4 rounded-xl border border-gray-200 resize-y focus:outline-none focus:ring-2 focus:ring-green-500"
                  />

                </div>

              </section>

              {/* PHOTOS EXISTANTES */}
              <section className="mt-10 pt-8 border-t border-gray-100">

                <div>
                  <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                    Photos
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-1">
                    Photos de l'annonce
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Choisissez la photo principale ou supprimez une photo.
                  </p>
                </div>

                {photosLoading ? (
                  <div className="py-8 text-center text-gray-500">
                    Chargement des photos...
                  </div>
                ) : photos.length === 0 ? (
                  <div className="mt-5 bg-gray-50 rounded-2xl p-8 text-center">
                    <div className="text-5xl">
                      📷
                    </div>

                    <p className="text-gray-500 mt-3">
                      Aucune photo pour le moment.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">

                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        className={`relative rounded-2xl overflow-hidden border-2 ${
                          imagePrincipale === photo.image_url
                            ? "border-green-600 ring-2 ring-green-200"
                            : "border-gray-200"
                        }`}
                      >

                        <img
                          src={photo.image_url}
                          alt="Photo du bien"
                          className="w-full h-40 sm:h-48 object-cover"
                        />

                        {imagePrincipale === photo.image_url && (
                          <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                            ⭐ Principale
                          </div>
                        )}

                        <div className="absolute top-2 right-2">
                          <button
                            type="button"
                            onClick={() =>
                              supprimerPhoto(photo)
                            }
                            className="w-9 h-9 rounded-full bg-white text-red-600 shadow-md font-bold hover:bg-red-50"
                            aria-label="Supprimer la photo"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="absolute bottom-2 left-2 right-2">

                          {imagePrincipale !== photo.image_url ? (
                            <button
                              type="button"
                              onClick={() =>
                                choisirPhotoPrincipale(
                                  photo.image_url
                                )
                              }
                              className="w-full bg-white/95 text-gray-800 font-semibold py-2 rounded-lg text-xs sm:text-sm shadow-md hover:bg-white"
                            >
                              ⭐ Définir principale
                            </button>
                          ) : (
                            <div className="w-full bg-green-600/90 text-white font-semibold py-2 rounded-lg text-xs sm:text-sm text-center">
                              Photo principale
                            </div>
                          )}

                        </div>

                      </div>
                    ))}

                  </div>
                )}

              </section>

              {/* AJOUTER PHOTOS */}
              <section className="mt-10 pt-8 border-t border-gray-100">

                <div>
                  <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                    Ajouter
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-1">
                    Ajouter de nouvelles photos
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Sélectionnez plusieurs photos à ajouter à votre annonce.
                  </p>
                </div>

                <label
                  htmlFor="nouvellesImages"
                  className="block mt-5 border-2 border-dashed border-gray-300 rounded-2xl p-7 text-center cursor-pointer hover:border-green-500 hover:bg-green-50/30 transition"
                >
                  <div className="text-5xl">
                    📷
                  </div>

                  <p className="font-semibold text-gray-800 mt-3">
                    Choisir plusieurs photos
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    JPG, PNG ou autre image
                  </p>

                  <input
                    id="nouvellesImages"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={choisirNouvellesImages}
                  />
                </label>

                {nouveauxApercus.length > 0 && (
                  <div className="mt-6">

                    <div className="flex items-center justify-between gap-3 mb-4">
                      <h3 className="font-bold text-gray-900">
                        {nouveauxApercus.length} nouvelle
                        {nouveauxApercus.length > 1
                          ? "s"
                          : ""} photo
                        {nouveauxApercus.length > 1
                          ? "s"
                          : ""}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                      {nouveauxApercus.map(
                        (preview, index) => (
                          <div
                            key={`${preview}-${index}`}
                            className="relative"
                          >

                            <img
                              src={preview}
                              alt={`Nouvelle photo ${index + 1}`}
                              className="w-full h-40 sm:h-48 object-cover rounded-2xl border border-gray-200"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                supprimerNouvelleImage(
                                  index
                                )
                              }
                              className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white text-red-600 shadow-md font-bold hover:bg-red-50"
                            >
                              ✕
                            </button>

                          </div>
                        )
                      )}

                    </div>

                    <button
                      type="button"
                      onClick={ajouterPhotos}
                      disabled={
                        photosLoading ||
                        nouvellesImages.length === 0
                      }
                      className="w-full mt-5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3.5 rounded-xl transition"
                    >
                      {photosLoading
                        ? "Ajout des photos..."
                        : "📷 Ajouter les photos"}
                    </button>

                  </div>
                )}

              </section>

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

              {/* ACTIONS */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">

                <button
                  type="button"
                  onClick={() =>
                    router.push("/agence/mes-biens")
                  }
                  disabled={saving}
                  className="w-full sm:w-1/3 border-2 border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-2/3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3.5 rounded-xl transition"
                >
                  {saving
                    ? "Enregistrement..."
                    : "💾 Enregistrer les modifications"}
                </button>

              </div>

            </form>
          </div>

        </div>
      </main>
    </>
  );
}