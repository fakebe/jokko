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

  if (bienError || !bien) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-50 flex items-center justify-center text-4xl">
            🏠
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mt-6">
            Bien introuvable
          </h1>

          <p className="text-gray-500 mt-3 leading-6">
            Ce bien immobilier n'existe pas ou n'est plus disponible.
          </p>

          <a
            href="/"
            className="inline-flex items-center justify-center mt-6 px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
          >
            ← Retour aux annonces
          </a>
        </div>
      </main>
    );
  }

  // Récupération de l'agence
  let agence = null;

  if (bien.agence_id) {
    const { data: agenceData } = await supabase
      .from("agences")
      .select(
        "id, nom_agence, responsable, telephone, email, ville"
      )
      .eq("id", bien.agence_id)
      .maybeSingle();

    agence = agenceData;
  }

  // Formatage du prix
  const prix = Number(bien.prix || 0).toLocaleString("fr-FR");

  // Nettoyage du téléphone
  const telephone = agence?.telephone
    ? String(agence.telephone)
        .replace(/\D/g, "")
        .replace(/^221/, "")
    : "";

  // Message WhatsApp
  const whatsappText =
    `Bonjour, je suis intéressé(e) par le bien "${bien.titre}" ` +
    `publié sur FC Immo. Prix : ${prix} FCFA.` +
    (bien.quartier
      ? ` Quartier : ${bien.quartier}.`
      : "");

  const whatsappMessage = encodeURIComponent(whatsappText);

  const whatsappUrl = telephone
    ? `https://wa.me/221${telephone}?text=${whatsappMessage}`
    : "#";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

        {/* RETOUR */}
        <div className="mb-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 font-semibold transition"
          >
            <span className="text-xl">←</span>
            Retour aux annonces
          </a>
        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* COLONNE PRINCIPALE */}
          <div className="lg:col-span-2 space-y-6">

            {/* PHOTO */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <div className="relative h-[280px] sm:h-[380px] md:h-[500px] bg-green-50">

                {bien.image_url ? (
                  <img
                    src={bien.image_url}
                    alt={bien.titre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <span className="text-7xl">
                      🏠
                    </span>

                    <p className="text-gray-400 mt-3">
                      Aucune photo disponible
                    </p>
                  </div>
                )}

                {/* BADGE TRANSACTION */}
                <div className="absolute top-5 left-5">
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-600 text-white text-sm font-bold shadow-lg">
                    {bien.transaction === "Vente"
                      ? "À vendre"
                      : "À louer"}
                  </span>
                </div>

                {/* BADGE TYPE */}
                <div className="absolute top-5 right-5">
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/95 text-gray-700 text-sm font-semibold shadow-lg">
                    {bien.type_bien}
                  </span>
                </div>

              </div>
            </div>

            {/* INFORMATIONS DU BIEN */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">

              {/* TITRE */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                {bien.titre}
              </h1>

              {/* LOCALISATION */}
              <p className="flex items-center gap-2 text-gray-500 mt-4">
                <span className="text-lg">
                  📍
                </span>

                <span>
                  {bien.ville}
                  {bien.quartier
                    ? `, ${bien.quartier}`
                    : ""}
                </span>
              </p>

              {/* PRIX */}
              <div className="mt-7 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-400 font-medium uppercase tracking-wide">
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
                  <div className="text-2xl">
                    🛏️
                  </div>

                  <p className="text-xl font-bold text-gray-900 mt-3">
                    {bien.chambres ?? "-"}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Chambres
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                  <div className="text-2xl">
                    🚿
                  </div>

                  <p className="text-xl font-bold text-gray-900 mt-3">
                    {bien.salles_bain ?? "-"}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Salles de bain
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                  <div className="text-2xl">
                    📐
                  </div>

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

            <div className="lg:sticky lg:top-6 space-y-6">

              {/* CONTACT AGENCE */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">

                <p className="text-sm text-gray-400 font-medium">
                  Vous êtes intéressé ?
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-1">
                  Contactez l'agence
                </h2>

                {agence ? (
                  <div className="mt-6">

                    {/* AGENCE */}
                    <div className="flex items-center gap-4">

                      <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-2xl">
                        🏢
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 truncate">
                          {agence.nom_agence}
                        </h3>

                        <p className="text-sm text-gray-500">
                          Agence immobilière
                        </p>
                      </div>

                    </div>

                    {/* INFORMATIONS AGENCE */}
                    <div className="mt-6 space-y-3">

                      {/* VILLE */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                        <span>
                          📍
                        </span>

                        <div>
                          <p className="text-xs text-gray-400">
                            Ville
                          </p>

                          <p className="text-sm font-semibold text-gray-800">
                            {agence.ville || "-"}
                          </p>
                        </div>
                      </div>

                      {/* RESPONSABLE */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                        <span>
                          👤
                        </span>

                        <div>
                          <p className="text-xs text-gray-400">
                            Responsable
                          </p>

                          <p className="text-sm font-semibold text-gray-800">
                            {agence.responsable || "-"}
                          </p>
                        </div>
                      </div>

                      {/* TÉLÉPHONE */}
                      {agence.telephone && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                          <span>
                            📞
                          </span>

                          <div>
                            <p className="text-xs text-gray-400">
                              Téléphone
                            </p>

                            <p className="text-sm font-semibold text-gray-800">
                              {agence.telephone}
                            </p>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* BOUTONS CONTACT */}
                    <div className="mt-6 space-y-3">

                      {/* APPEL */}
                      {agence.telephone && (
                        <a
                          href={`tel:${agence.telephone}`}
                          className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition shadow-sm"
                        >
                          📞 Appeler l'agence
                        </a>
                      )}

                      {/* WHATSAPP */}
                      {agence.telephone && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition shadow-sm"
                        >
                          💬 Contacter sur WhatsApp
                        </a>
                      )}

                      {/* EMAIL */}
                      {agence.email && (
                        <a
                          href={`mailto:${agence.email}`}
                          className="flex items-center justify-center gap-2 w-full border-2 border-green-600 text-green-700 hover:bg-green-50 font-bold py-3 rounded-xl transition"
                        >
                          ✉️ Envoyer un email
                        </a>
                      )}

                    </div>

                    {/* EMAIL AFFICHÉ */}
                    {agence.email && (
                      <p className="text-xs text-gray-400 text-center mt-4 break-all">
                        {agence.email}
                      </p>
                    )}

                  </div>
                ) : (
                  <div className="mt-6 p-4 rounded-2xl bg-gray-50 text-sm text-gray-500">
                    Les informations de l'agence ne sont pas disponibles.
                  </div>
                )}

              </div>

              {/* FAVORIS */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">

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
                  Ne versez jamais d'argent avant d'avoir
                  vérifié le bien et l'identité du vendeur
                  ou de l'agence.
                </p>

              </div>

            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}