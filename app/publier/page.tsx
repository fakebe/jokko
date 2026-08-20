export default function PublierPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">

        <div className="mb-8">
          <p className="text-green-600 font-semibold">Jokko.sn</p>

          <h1 className="text-4xl font-bold text-gray-800 mt-2">
            Publier une annonce
          </h1>

          <p className="text-gray-500 mt-3">
            Présentez votre bien aux personnes qui recherchent un logement
            au Sénégal.
          </p>
        </div>

        <form className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">

          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Informations du bien
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Type de bien
              </label>

              <select className="w-full p-3 rounded-lg border border-gray-300">
                <option>Maison</option>
                <option>Appartement</option>
                <option>Terrain</option>
                <option>Local commercial</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Type d'annonce
              </label>

              <select className="w-full p-3 rounded-lg border border-gray-300">
                <option>À louer</option>
                <option>À vendre</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Titre de l'annonce
              </label>

              <input
                type="text"
                placeholder="Ex : Belle villa familiale"
                className="w-full p-3 rounded-lg border border-gray-300"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Prix
              </label>

              <input
                type="text"
                placeholder="Ex : 350 000 FCFA"
                className="w-full p-3 rounded-lg border border-gray-300"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Ville
              </label>

              <select className="w-full p-3 rounded-lg border border-gray-300">
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
                className="w-full p-3 rounded-lg border border-gray-300"
              />
            </div>

          </div>

          <div className="mt-5">
            <label className="block font-medium text-gray-700 mb-2">
              Description
            </label>

            <textarea
              rows={5}
              placeholder="Décrivez votre bien..."
              className="w-full p-3 rounded-lg border border-gray-300"
            />
          </div>

          <div className="mt-5">
            <label className="block font-medium text-gray-700 mb-2">
              Téléphone / WhatsApp
            </label>

            <input
              type="tel"
              placeholder="Ex : 77 000 00 00"
              className="w-full p-3 rounded-lg border border-gray-300"
            />
          </div>

          <div className="mt-8 bg-green-50 rounded-xl p-5">
            <h3 className="font-bold text-green-800">
              📸 Photos du bien
            </h3>

            <p className="text-sm text-green-700 mt-1">
              L'ajout des photos sera activé dans la prochaine version.
            </p>
          </div>

          <button
            type="button"
            className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl"
          >
            Publier mon annonce
          </button>

        </form>
      </div>
    </main>
  );
}