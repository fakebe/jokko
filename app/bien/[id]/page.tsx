import { supabase } from "@/lib/supabase";
import FavoriButton from "@/components/FavoriButton";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BienPage({ params }: PageProps) {
  const { id } = await params;

  // Récupération du bien
  const { data: bien, error: bienError } = await supabase
    .from("biens")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  console.log("ID REÇU :", id);
  console.log("BIEN TROUVÉ :", bien);
  console.log("ERREUR BIEN :", bienError);

  if (bienError || !bien) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <div className="text-5xl mb-4">🏠</div>

          <h1 className="text-2xl font-bold text-gray-800">
            Bien introuvable
          </h1>

          <p className="text-gray-500 mt-3">
            Ce bien immobilier n'existe pas ou n'est plus disponible.
          </p>
        </div>
      </main>
    );
  }

  // Récupération de l'agence
  let agence = null;

  if (bien.agence_id) {
    const { data: agenceData, error: agenceError } = await supabase
      .from("agences")
      .select(
        "id, nom_agence, responsable, telephone, email, ville"
      )
      .eq("id", bien.agence_id)
      .maybeSingle();

    console.log("AGENCE TROUVÉE :", agenceData);
    console.log("ERREUR AGENCE :", agenceError);

    agence = agenceData;
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* RETOUR */}
        <div className="mb-6">
          <a
            href="/"
            className="text-green-700 font-semibold hover:underline"
          >
            ← Retour à l'accueil
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

          {/* PHOTO */}
          <div className="h-72 md:h-[450px] bg-green-100 flex items-center justify-center overflow-hidden">
            {bien.image_url ? (
              <img
                src={bien.image_url}
                alt={bien.titre}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-8xl">🏠</span>
            )}
          </div>

          <div className="p-6 md:p-10">

            {/* TRANSACTION + TYPE */}
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
                {bien.transaction}
              </span>

              <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full">
                {bien.type_bien}
              </span>
            </div>

            {/* TITRE */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              {bien.titre}
            </h1>

            {/* LOCALISATION */}
            <p className="text-gray-500 text-lg mt-3">
              📍 {bien.ville}
              {bien.quartier ? `, ${bien.quartier}` : ""}
            </p>

            {/* PRIX */}
            <p className="text-green-700 text-3xl font-bold mt-6">
              {Number(bien.prix).toLocaleString("fr-FR")} FCFA
            </p>

            {/* CARACTERISTIQUES */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">

              <div className="bg-gray-50 rounded-xl p-5 text-center">
                <div className="text-3xl">🛏️</div>
                <p className="font-bold text-gray-800 mt-2">
                  {bien.chambres ?? "-"}
                </p>
                <p className="text-gray-500 text-sm">
                  Chambres
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 text-center">
                <div className="text-3xl">🚿</div>
                <p className="font-bold text-gray-800 mt-2">
                  {bien.salles_bain ?? "-"}
                </p>
                <p className="text-gray-500 text-sm">
                  Salles de bain
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 text-center">
                <div className="text-3xl">📐</div>
                <p className="font-bold text-gray-800 mt-2">
                  {bien.surface
                    ? `${bien.surface} m²`
                    : "-"}
                </p>
                <p className="text-gray-500 text-sm">
                  Surface
                </p>
              </div>

            </div>

            {/* DESCRIPTION */}
            {bien.description && (
              <div className="mt-10">
                <h2 className="text-2xl font-bold text-gray-800">
                  Description
                </h2>

                <p className="text-gray-600 leading-7 mt-4 whitespace-pre-line">
                  {bien.description}
                </p>
              </div>
            )}

            {/* AGENCE */}
            <div className="mt-10 border-t pt-8">

              <h2 className="text-2xl font-bold text-gray-800">
                Intéressé par ce bien ?
              </h2>

              <p className="text-gray-500 mt-2">
                Contactez l'agence pour obtenir plus d'informations.
              </p>

              {agence ? (
                <div className="mt-6 bg-gray-50 rounded-2xl p-6 border border-gray-100">

                  <div className="flex items-center gap-4">

                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                      🏢
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {agence.nom_agence}
                      </h3>

                      <p className="text-gray-500">
                        Responsable : {agence.responsable || "-"}
                      </p>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">

                    <div className="bg-white rounded-xl p-4">
                      <p className="text-sm text-gray-400">
                        📍 Ville
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {agence.ville || "-"}
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-4">
                      <p className="text-sm text-gray-400">
                        📞 Téléphone
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {agence.telephone || "-"}
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-4 md:col-span-2">
                      <p className="text-sm text-gray-400">
                        ✉️ Email
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {agence.email || "-"}
                      </p>
                    </div>

                  </div>

                  {/* CONTACT */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">

                    {agence.telephone && (
                      <a
                        href={`tel:${agence.telephone}`}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-center"
                      >
                        📞 Appeler
                      </a>
                    )}

                    {agence.telephone && (
                      <a
                        href={`https://wa.me/221${agence.telephone
                          .replace(/\D/g, "")
                          .replace(/^221/, "")}?text=${encodeURIComponent(
                          `Bonjour, je suis intéressé(e) par le bien "${bien.titre}" publié sur FC Immo. Prix : ${Number(
                            bien.prix
                          ).toLocaleString("fr-FR")} FCFA. ${
                            bien.quartier
                              ? `Quartier : ${bien.quartier}.`
                              : ""
                          }`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-center"
                      >
                        💬 WhatsApp
                      </a>
                    )}

                    {agence.email && (
                      <a
                        href={`mailto:${agence.email}`}
                        className="border border-green-600 text-green-700 hover:bg-green-50 font-bold py-3 rounded-xl text-center"
                      >
                        ✉️ Email
                      </a>
                    )}

                  </div>

                </div>
              ) : (
                <div className="mt-6 bg-gray-50 rounded-2xl p-6 text-gray-500">
                  Les informations de l'agence ne sont pas disponibles.
                </div>
              )}

              {/* FAVORIS */}
              <div className="mt-4">
                <FavoriButton bienId={bien.id} />
              </div>

            </div>

          </div>
        </div>
      </div>
    </main>
  );
}