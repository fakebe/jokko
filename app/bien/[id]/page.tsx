"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import FavoriButton from "@/components/FavoriButton";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

type Bien = {
  id: string;
  titre: string;
  type_bien: string;
  transaction: string;
  statut: string | null;
  ville: string;
  quartier: string | null;
  prix: number;
  chambres: number | null;
  salles_bain: number | null;
  surface: number | null;
  description: string | null;
  image_url: string | null;
  agence_id: string | null;
};

type BienImage = {
  id: string;
  image_url: string;
  ordre: number;
};

type Agence = {
  id: string;
  nom_agence: string;
  responsable: string | null;
  telephone: string | null;
  email: string | null;
  ville: string | null;
  verifiee: boolean;
};

export default function BienPage() {
  const params = useParams();
  const router = useRouter();

  const id = String(params.id);

  const [bien, setBien] = useState<Bien | null>(null);
  const [photos, setPhotos] = useState<BienImage[]>([]);
  const [agence, setAgence] = useState<Agence | null>(null);

  const [photoActive, setPhotoActive] = useState("");
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    chargerBien();
  }, [id]);

  async function chargerBien() {
    setLoading(true);
    setErreur("");

    const { data: bienData, error: bienError } = await supabase
      .from("biens")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (bienError || !bienData) {
      console.error("ERREUR BIEN :", bienError);
      setErreur(
        "Ce bien immobilier n'existe pas ou n'est plus disponible."
      );
      setLoading(false);
      return;
    }

    setBien(bienData);

    const { data: photosData, error: photosError } = await supabase
      .from("bien_images")
      .select("id, image_url, ordre")
      .eq("bien_id", bienData.id)
      .order("ordre", { ascending: true });

    if (photosError) {
      console.error("ERREUR PHOTOS :", photosError);
    }

    const photosGalerie: BienImage[] = photosData || [];

    /*
     * Compatibilité avec les anciennes annonces :
     * si image_url existe mais n'est pas encore dans bien_images,
     * on l'ajoute visuellement à la galerie.
     */
    if (
      bienData.image_url &&
      !photosGalerie.some(
        (photo) => photo.image_url === bienData.image_url
      )
    ) {
      photosGalerie.unshift({
        id: `principale-${bienData.id}`,
        image_url: bienData.image_url,
        ordre: -1,
      });
    }

    setPhotos(photosGalerie);

    if (photosGalerie.length > 0) {
      setPhotoActive(photosGalerie[0].image_url);
    } else {
      setPhotoActive("");
    }

    if (bienData.agence_id) {
      const { data: agenceData, error: agenceError } =
        await supabase
          .from("agences")
          .select(
  "id, nom_agence, responsable, telephone, email, ville, verifiee"
)
          .eq("id", bienData.agence_id)
          .maybeSingle();

      if (agenceError) {
        console.error("ERREUR AGENCE :", agenceError);
      }

      setAgence(agenceData || null);
    }

    setLoading(false);
  }

  const prix = Number(bien?.prix || 0).toLocaleString("fr-FR");

  const telephone = agence?.telephone
    ? String(agence.telephone)
        .replace(/\D/g, "")
        .replace(/^221/, "")
    : "";

  const whatsappText = bien
    ? `Bonjour, je suis intéressé(e) par le bien "${bien.titre}" publié sur FC Immo. Prix : ${prix} FCFA.${
        bien.quartier
          ? ` Quartier : ${bien.quartier}.`
          : ""
      }`
    : "";

  const whatsappUrl = telephone
    ? `https://wa.me/221${telephone}?text=${encodeURIComponent(
        whatsappText
      )}`
    : "#";

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />

            <p className="text-gray-600 mt-5 font-medium">
              Chargement de l'annonce...
            </p>
          </div>
        </main>
      </>
    );
  }

  if (erreur || !bien) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-50 flex items-center justify-center text-4xl">
              🏠
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mt-6">
              Bien introuvable
            </h1>

            <p className="text-gray-500 mt-3 leading-6">
              {erreur}
            </p>

            <button
              type="button"
              onClick={() => router.push("/recherche")}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              ← Retour aux annonces
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

          {/* RETOUR */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => router.push("/recherche")}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-green-700 font-semibold transition"
            >
              ← Retour aux annonces
            </button>
          </div>

          {/* GRILLE PRINCIPALE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* COLONNE PRINCIPALE */}
            <div className="lg:col-span-2 space-y-6">

              {/* GALERIE */}
              <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">

                {/* PHOTO PRINCIPALE */}
                <div className="relative h-[280px] sm:h-[400px] md:h-[520px] bg-green-50">

                  {photoActive ? (
                    <img
                      src={photoActive}
                      alt={bien.titre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-7xl">
                          🏠
                        </div>

                        <p className="text-gray-400 mt-3">
                          Aucune photo disponible
                        </p>
                      </div>
                    </div>
                  )}

                  {/* BADGE TRANSACTION */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      {bien.transaction === "Vente"
                        ? "À vendre"
                        : "À louer"}
                    </span>
                  </div>

                  {/* FAVORI */}
                  <div className="absolute top-4 right-4 bg-white rounded-full shadow-lg">
                    <FavoriButton bienId={bien.id} />
                  </div>

                  {/* COMPTEUR */}
                  {photos.length > 0 && (
                    <div className="absolute bottom-4 right-4">
                      <span className="bg-black/70 text-white px-3 py-2 rounded-full text-sm font-semibold">
                        📷 {photos.length} photo
                        {photos.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}

                </div>

                {/* MINIATURES */}
                {photos.length > 0 && (
                  <div className="p-4 sm:p-5">

                    <div className="flex gap-3 overflow-x-auto pb-1">

                      {photos.map((photo, index) => {
                        const active =
                          photo.image_url === photoActive;

                        return (
                          <button
                            key={photo.id}
                            type="button"
                            onClick={() =>
                              setPhotoActive(
                                photo.image_url
                              )
                            }
                            className={`relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 transition ${
                              active
                                ? "border-green-600 ring-2 ring-green-200"
                                : "border-gray-200 hover:border-green-400"
                            }`}
                            aria-label={`Voir la photo ${
                              index + 1
                            }`}
                          >
                            <img
                              src={photo.image_url}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        );
                      })}

                    </div>

                  </div>
                )}

              </div>

              {/* INFORMATIONS */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">

                {/* TYPE */}
                <span className="inline-flex bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-semibold">
                  {bien.type_bien}
                </span>

                {/* TITRE */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mt-4">
                  {bien.titre}
                </h1>

                {/* LOCALISATION */}
                <p className="flex items-center gap-2 text-gray-500 mt-4">
                  <span>📍</span>

                  <span>
                    {bien.ville}
                    {bien.quartier
                      ? `, ${bien.quartier}`
                      : ""}
                  </span>
                </p>

                {/* PRIX */}
                <div className="mt-7 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-400 uppercase tracking-wide font-medium">
                    Prix
                  </p>

                  <p className="text-3xl md:text-4xl font-extrabold text-green-600 mt-1">
                    {prix}{" "}
                    <span className="text-lg md:text-xl">
                      FCFA
                    </span>
                  </p>
                </div>

                {/* CARACTÉRISTIQUES */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">

                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                    <div className="text-2xl">🛏️</div>

                    <p className="text-xl font-bold text-gray-900 mt-3">
                      {bien.chambres ?? "-"}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Chambres
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                    <div className="text-2xl">🚿</div>

                    <p className="text-xl font-bold text-gray-900 mt-3">
                      {bien.salles_bain ?? "-"}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Salles de bain
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                    <div className="text-2xl">📐</div>

                    <p className="text-xl font-bold text-gray-900 mt-3">
                      {bien.surface
                        ? `${bien.surface} m²`
                        : "-"}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Surface
                    </p>
                  </div>

                </div>

                {/* DESCRIPTION */}
                {bien.description && (
                  <div className="mt-10 pt-8 border-t border-gray-100">

                    <h2 className="text-2xl font-bold text-gray-900">
                      Description
                    </h2>

                    <p className="text-gray-600 leading-7 mt-4 whitespace-pre-line">
                      {bien.description}
                    </p>

                  </div>
                )}

              </div>

            </div>

            {/* COLONNE CONTACT */}
            <aside className="lg:col-span-1">

              <div className="lg:sticky lg:top-24 space-y-6">

                {/* AGENCE */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">

                  <p className="text-sm text-gray-400 font-medium">
                    Vous êtes intéressé ?
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-1">
                    Contactez l'agence
                  </h2>

                  {agence ? (
                    <div className="mt-6">

                      <div className="flex items-center gap-4">

                        <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-2xl">
                          🏢
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
  <h3 className="font-bold text-lg text-gray-900 truncate">
    {agence.nom_agence}
  </h3>

  {agence.verifiee && (
    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold">
      ✅ Vérifiée
    </span>
  )}
</div>

<p className="text-sm text-gray-500 mt-1">
  Agence immobilière
</p>
                        </div>

                      </div>

                      <div className="mt-6 space-y-3">

                        {agence.ville && (
                          <div className="p-3 rounded-xl bg-gray-50">
                            <p className="text-xs text-gray-400">
                              Ville
                            </p>

                            <p className="text-sm font-semibold text-gray-800 mt-1">
                              📍 {agence.ville}
                            </p>
                          </div>
                        )}

                        {agence.responsable && (
                          <div className="p-3 rounded-xl bg-gray-50">
                            <p className="text-xs text-gray-400">
                              Responsable
                            </p>

                            <p className="text-sm font-semibold text-gray-800 mt-1">
                              👤 {agence.responsable}
                            </p>
                          </div>
                        )}

                      </div>

                      <div className="mt-6 space-y-3">

                        {agence.telephone && (
                          <a
                            href={`tel:${agence.telephone}`}
                            className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition"
                          >
                            📞 Appeler l'agence
                          </a>
                        )}

                        {agence.telephone && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition"
                          >
                            💬 WhatsApp
                          </a>
                        )}

                        {agence.email && (
                          <a
                            href={`mailto:${agence.email}`}
                            className="flex items-center justify-center gap-2 w-full border-2 border-green-600 text-green-700 hover:bg-green-50 font-bold py-3 rounded-xl transition"
                          >
                            ✉️ Email
                          </a>
                        )}

                      </div>

                    </div>
                  ) : (
                    <div className="mt-6 p-4 rounded-2xl bg-gray-50 text-sm text-gray-500">
                      Les informations de l'agence ne sont pas disponibles.
                    </div>
                  )}

                </div>

                {/* FAVORIS */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">

                  <div className="flex items-center justify-between gap-4">

                    <div>
                      <h3 className="font-bold text-gray-900">
                        Garder ce bien
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        Ajoutez-le à vos favoris.
                      </p>
                    </div>

                    <FavoriButton bienId={bien.id} />

                  </div>

                </div>

                {/* CONSEIL */}
                <div className="rounded-3xl bg-green-50 border border-green-100 p-6">

                  <div className="text-2xl">
                    🔒
                  </div>

                  <h3 className="font-bold text-green-900 mt-3">
                    Restez vigilant
                  </h3>

                  <p className="text-sm text-green-800/70 leading-6 mt-2">
                    Ne versez jamais d'argent avant d'avoir vérifié
                    le bien et l'identité du vendeur ou de l'agence.
                  </p>

                </div>

              </div>

            </aside>

          </div>
        </div>
      </main>
    </>
  );
}