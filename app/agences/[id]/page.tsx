import { supabase } from "@/lib/supabase";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Agence = {
  id: string;
  nom_agence: string;
  responsable: string | null;
  telephone: string | null;
  email: string | null;
  ville: string | null;
};

type Bien = {
  id: string;
  titre: string;
  type_bien: string;
  transaction: string;
  ville: string;
  quartier: string | null;
  prix: number;
  chambres: number | null;
  salles_bain: number | null;
  surface: number | null;
  image_url: string | null;
};

export default async function AgencePage({
  params,
}: PageProps) {
  const { id } = await params;

  // Récupérer l'agence
  const { data: agence, error: agenceError } = await supabase
    .from("agences")
    .select(
      "id, nom_agence, responsable, telephone, email, ville"
    )
    .eq("id", id)
    .maybeSingle();

  console.log("AGENCE :", agence);
  console.log("ERREUR AGENCE :", agenceError);

  if (agenceError || !agence) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <div className="text-5xl mb-4">🏢</div>

          <h1 className="text-2xl font-bold text-gray-800">
            Agence introuvable
          </h1>

          <p className="text-gray-500 mt-3">
            Cette agence n'existe pas ou n'est plus disponible.
          </p>

          <a
            href="/agences"
            className="inline-block mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl"
          >
            ← Voir les agences
          </a>
        </div>
      </main>
    );
  }

  // Récupérer les biens de l'agence
  const { data: biens, error: biensError } = await supabase
    .from("biens")
    .select(
      "id, titre, type_bien, transaction, ville, quartier, prix, chambres, salles_bain, surface, image_url"
    )
    .eq("agence_id", agence.id)
    .order("created_at", { ascending: false });

  console.log("BIENS DE L'AGENCE :", biens);
  console.log("ERREUR BIENS :", biensError);

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* RETOUR */}
        <div className="mb-6">
          <a
            href="/agences"
            className="text-green-700 font-semibold hover:underline"
          >
            ← Retour aux agences
          </a>
        </div>

        {/* INFORMATIONS AGENCE */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

          <div className="bg-green-700 text-white p-8 md:p-10">

            <div className="flex flex-col md:flex-row md:items-center gap-5">

              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl">
                🏢
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  {agence.nom_agence}
                </h1>

                <p className="text-green-100 mt-2 text-lg">
                  📍 {agence.ville || "Sénégal"}
                </p>
              </div>

            </div>

          </div>

          <div className="p-6 md:p-10">

            {/* CONTACTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="bg-gray-50 rounded-xl p-5">
                <p className="text-sm text-gray-400">
                  👤 Responsable
                </p>

                <p className="font-bold text-gray-800 mt-2">
                  {agence.responsable || "-"}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-5">
                <p className="text-sm text-gray-400">
                  📍 Ville
                </p>

                <p className="font-bold text-gray-800 mt-2">
                  {agence.ville || "-"}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-5">
                <p className="text-sm text-gray-400">
                  📞 Téléphone
                </p>

                <p className="font-bold text-gray-800 mt-2">
                  {agence.telephone || "-"}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-5">
                <p className="text-sm text-gray-400">
                  ✉️ Email
                </p>

                <p className="font-bold text-gray-800 mt-2">
                  {agence.email || "-"}
                </p>
              </div>

            </div>

            {/* BOUTONS CONTACT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

              {agence.telephone && (
                <a
                  href={`tel:${agence.telephone}`}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-center"
                >
                  📞 Appeler l'agence
                </a>
              )}

              {agence.telephone && (
                <a
                  href={`https://wa.me/221${agence.telephone
                    .replace(/\D/g, "")
                    .replace(/^221/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl text-center"
                >
                  💬 WhatsApp
                </a>
              )}

            </div>

            {/* BIENS */}
            <div className="mt-12 border-t pt-10">

              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">

                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    Les biens de l'agence
                  </h2>

                  <p className="text-gray-500 mt-2">
                    {biens?.length || 0} bien
                    {(biens?.length || 0) > 1
                      ? "s"
                      : ""}{" "}
                    publié
                    {(biens?.length || 0) > 1
                      ? "s"
                      : ""}
                  </p>
                </div>

              </div>

              {!biens || biens.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-10 text-center">
                  <div className="text-5xl mb-4">
                    🏠
                  </div>

                  <h3 className="text-xl font-bold text-gray-800">
                    Aucun bien publié
                  </h3>

                  <p className="text-gray-500 mt-2">
                    Cette agence n'a pas encore publié de biens.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                  {(biens as Bien[]).map((bien) => (
                    <div
                      key={bien.id}
                      className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition"
                    >

                      {/* PHOTO */}
                      <div className="h-48 bg-green-100 flex items-center justify-center overflow-hidden">

                        {bien.image_url ? (
                          <img
                            src={bien.image_url}
                            alt={bien.titre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-6xl">
                            🏡
                          </span>
                        )}

                      </div>

                      <div className="p-5">

                        <div className="flex items-center justify-between gap-2">

                          <span className="text-sm font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                            {bien.transaction}
                          </span>

                          <span className="text-sm text-gray-500">
                            {bien.type_bien}
                          </span>

                        </div>

                        <h3 className="text-xl font-bold text-gray-800 mt-3">
                          {bien.titre}
                        </h3>

                        <p className="text-gray-500 mt-2">
                          📍 {bien.ville}
                          {bien.quartier
                            ? `, ${bien.quartier}`
                            : ""}
                        </p>

                        <p className="text-green-700 font-bold text-xl mt-4">
                          {Number(
                            bien.prix
                          ).toLocaleString("fr-FR")}{" "}
                          FCFA
                        </p>

                        <div className="grid grid-cols-3 gap-2 mt-4 text-sm text-gray-600">

                          <div className="bg-gray-50 rounded-lg p-2 text-center">
                            🛏️
                            <br />
                            {bien.chambres ?? "-"}
                          </div>

                          <div className="bg-gray-50 rounded-lg p-2 text-center">
                            🚿
                            <br />
                            {bien.salles_bain ?? "-"}
                          </div>

                          <div className="bg-gray-50 rounded-lg p-2 text-center">
                            📐
                            <br />
                            {bien.surface
                              ? `${bien.surface} m²`
                              : "-"}
                          </div>

                        </div>

                        <a
                          href={`/bien/${bien.id}`}
                          className="block w-full mt-5 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-center"
                        >
                          👁️ Voir le bien
                        </a>

                      </div>
                    </div>
                  ))}

                </div>
              )}

            </div>

          </div>
        </div>

      </div>
    </main>
  );
}