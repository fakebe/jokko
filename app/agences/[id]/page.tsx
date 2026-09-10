"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

type Agence = {
  id: string;
  nom_agence: string;
  responsable: string | null;
  telephone: string | null;
  email: string | null;
  ville: string | null;
  verifiee: boolean;
};

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
  image_url: string | null;
};

export default function AgenceProfilPage() {
  const params = useParams();
  const router = useRouter();

  const id = String(params.id);

  const [agence, setAgence] = useState<Agence | null>(null);
  const [biens, setBiens] = useState<Bien[]>([]);

  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    chargerProfilAgence();
  }, [id]);

  async function chargerProfilAgence() {
    setLoading(true);
    setErreur("");

    const {
      data: agenceData,
      error: agenceError,
    } = await supabase
      .from("agences")
      .select(
        "id, nom_agence, responsable, telephone, email, ville, verifiee"
      )
      .eq("id", id)
      .maybeSingle();

    if (agenceError) {
      console.error(
        "ERREUR CHARGEMENT AGENCE :",
        agenceError
      );

      setErreur(
        "Impossible de charger cette agence."
      );
      setLoading(false);
      return;
    }

    if (!agenceData) {
      setErreur(
        "Cette agence n'existe pas ou n'est plus disponible."
      );
      setLoading(false);
      return;
    }

    setAgence(agenceData as Agence);

    const {
      data: biensData,
      error: biensError,
    } = await supabase
      .from("biens")
      .select(
        "id, titre, type_bien, transaction, statut, ville, quartier, prix, chambres, salles_bain, surface, image_url"
      )
      .eq("agence_id", id)
      .eq("statut", "Disponible")
      .order("created_at", {
        ascending: false,
      });

    if (biensError) {
      console.error(
        "ERREUR CHARGEMENT BIENS :",
        biensError
      );

      setBiens([]);
    } else {
      setBiens((biensData || []) as Bien[]);
    }

    setLoading(false);
  }

  const telephone = agence?.telephone
    ? agence.telephone
        .replace(/\D/g, "")
        .replace(/^221/, "")
    : "";

  const whatsappUrl = telephone
    ? `https://wa.me/221${telephone}`
    : "#";

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center">

            <div className="w-12 h-12 mx-auto rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />

            <p className="text-gray-600 mt-5 font-medium">
              Chargement du profil de l'agence...
            </p>

          </div>
        </main>
      </>
    );
  }

  if (erreur || !agence) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

          <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">

            <div className="w-20 h-20 mx-auto rounded-2xl bg-green-50 flex items-center justify-center text-5xl">
              🏢
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mt-6">
              Agence introuvable
            </h1>

            <p className="text-gray-500 mt-3">
              {erreur}
            </p>

            <button
              type="button"
              onClick={() => router.push("/agences")}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              ← Retour aux agences
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* RETOUR */}
          <button
            type="button"
            onClick={() => router.push("/agences")}
            className="inline-flex items-center gap-2 text-green-700 font-semibold hover:text-green-900 transition mb-6"
          >
            ← Retour aux agences
          </button>

          {/* PROFIL AGENCE */}
          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

            <div className="bg-green-700 text-white p-6 sm:p-8">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                <div className="flex items-center gap-5">

                  <div className="w-20 h-20 bg-white/15 rounded-2xl flex items-center justify-center text-4xl shrink-0">
                    🏢
                  </div>

                  <div>

                    <div className="flex flex-wrap items-center gap-3">

                      <h1 className="text-3xl sm:text-4xl font-bold">
                        {agence.nom_agence}
                      </h1>

                      {agence.verifiee && (
                        <span className="inline-flex items-center gap-1 bg-white text-green-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                          ✅ Vérifiée
                        </span>
                      )}

                    </div>

                    <p className="text-green-100 mt-2">
                      📍 {agence.ville || "Sénégal"}
                    </p>

                    <p className="text-green-100 mt-1">
                      {biens.length} bien
                      {biens.length > 1 ? "s" : ""} disponible
                      {biens.length > 1 ? "s" : ""}
                    </p>

                  </div>

                </div>

                {agence.telephone && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full md:w-auto bg-white text-green-700 hover:bg-green-50 font-bold px-6 py-3.5 rounded-xl text-center transition"
                  >
                    💬 Contacter sur WhatsApp
                  </a>
                )}

              </div>

            </div>

            {/* INFORMATIONS */}
            <div className="p-6 sm:p-8">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-sm text-gray-400">
                    Responsable
                  </p>

                  <p className="font-bold text-gray-900 mt-1">
                    👤 {agence.responsable || "-"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-sm text-gray-400">
                    Téléphone
                  </p>

                  <p className="font-bold text-gray-900 mt-1">
                    📞 {agence.telephone || "-"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-sm text-gray-400">
                    Email
                  </p>

                  <p className="font-bold text-gray-900 mt-1 break-all">
                    ✉️ {agence.email || "-"}
                  </p>
                </div>

              </div>

            </div>

          </section>

          {/* BIENS DE L'AGENCE */}
          <section className="mt-10">

            <div className="mb-6">

              <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                Annonces
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                Les biens de {agence.nom_agence}
              </h2>

              <p className="text-gray-500 mt-2">
                Découvrez les biens actuellement disponibles auprès de cette agence.
              </p>

            </div>

            {biens.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">

                <div className="text-5xl">
                  🏠
                </div>

                <h3 className="text-xl font-bold text-gray-900 mt-5">
                  Aucun bien disponible
                </h3>

                <p className="text-gray-500 mt-2">
                  Cette agence n'a actuellement aucun bien disponible.
                </p>

              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                {biens.map((bien) => (
                  <article
                    key={bien.id}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition"
                  >

                    {/* IMAGE */}
                    <div className="relative h-56 bg-green-50 overflow-hidden">

                      {bien.image_url ? (
                        <img
                          src={bien.image_url}
                          alt={bien.titre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-7xl">
                            🏠
                          </span>
                        </div>
                      )}

                      <div className="absolute top-4 left-4">
                        <span className="bg-green-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow">
                          {bien.transaction === "Vente"
                            ? "À vendre"
                            : "À louer"}
                        </span>
                      </div>

                    </div>

                    {/* CONTENU */}
                    <div className="p-5">

                      <p className="text-sm font-semibold text-green-700">
                        {bien.type_bien}
                      </p>

                      <h3 className="text-xl font-bold text-gray-900 mt-2 line-clamp-2">
                        {bien.titre}
                      </h3>

                      <p className="text-sm text-gray-500 mt-2">
                        📍 {bien.ville}
                        {bien.quartier
                          ? `, ${bien.quartier}`
                          : ""}
                      </p>

                      <p className="text-2xl font-extrabold text-green-700 mt-4">
                        {Number(
                          bien.prix
                        ).toLocaleString("fr-FR")}{" "}
                        <span className="text-base">
                          FCFA
                        </span>
                      </p>

                      <div className="grid grid-cols-3 gap-2 mt-5">

                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                          <div>🛏️</div>

                          <p className="font-bold text-gray-800 mt-1">
                            {bien.chambres ?? "-"}
                          </p>

                          <p className="text-[11px] text-gray-500">
                            Chambres
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                          <div>🚿</div>

                          <p className="font-bold text-gray-800 mt-1">
                            {bien.salles_bain ?? "-"}
                          </p>

                          <p className="text-[11px] text-gray-500">
                            S. de bain
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                          <div>📐</div>

                          <p className="font-bold text-gray-800 mt-1">
                            {bien.surface ?? "-"}
                          </p>

                          <p className="text-[11px] text-gray-500">
                            m²
                          </p>
                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/bien/${bien.id}`
                          )
                        }
                        className="w-full mt-5 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition"
                      >
                        👁️ Voir le bien
                      </button>

                    </div>

                  </article>
                ))}

              </div>
            )}

          </section>

        </div>
      </main>
    </>
  );
}