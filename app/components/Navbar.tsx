export default function Navbar() {
  return (
    <header className="bg-white shadow-md">
      <nav className="max-w-7xl mx-auto flex items-center justify-between p-5">
        <h1 className="text-2xl font-bold text-green-700">
          🏡 Jokko
        </h1>

        <div className="flex gap-6 items-center">
          <a href="#" className="text-gray-700 hover:text-green-700">
            Accueil
          </a>

          <a href="#" className="text-gray-700 hover:text-green-700">
            Acheter
          </a>

          <a href="#" className="text-gray-700 hover:text-green-700">
            Louer
          </a>

          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            Publier une annonce
          </button>
        </div>
      </nav>
    </header>
  );
}