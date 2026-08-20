"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Bien = {
  id: string;
  transaction: string;
};

export default function AgencePage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [biens, setBiens] = useState<Bien[]>([]);

  useEffect(() => {
    async function chargerDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/connexion");
        return;
      }

      setEmail(user.email ?? "");

      const { data, error } = await supabase
        .from("biens")
        .select("id, transaction")
        .eq("user_id", user.id);

      if (error) {
        console.error("ERREUR DASHBOARD :", error);
        setBiens([]);
      } else {
        setBiens(data || []);
      }

      setLoading(false);
    }

    chargerDashboard();
  }, [router]);

  async function deconnexion() {
    await supabase.auth.signOut();
    router.push("/connexion");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          Chargement du tableau de bord...
        </p>
      </main>
    );
  }

  const totalBiens = biens.length;

  const biensVente = biens.filter(
    (bien) => bien.transaction === "Vente"
  ).length;

  const biensLocation = biens.filter(
    (bien) => bien.transaction === "Location"
  ).length;

  return (
    <main className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <header className="bg-green-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              🏡 Jokko
            </h1>

            <p className="text-green-100 text-sm">
              Tableau de bord agence
            </p>
          </div>

          <button
            onClick={deconnexion}
            className="bg-white text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-green-50"
          >
            Déconnexion
          </button>

        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* BIENVENUE */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">

          <h2 className="text-2xl font-bold text-gray-800">
            Bienvenue dans votre espace agence 👋
          </h2>

          <p className="text-gray-600 mt-2">
            Connecté avec :{" "}
            <strong>{email}</strong>
          </p>

        </div>

        {/* STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* TOTAL */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="text-4xl mb-3">
              🏠
            </div>

            <p className="text-gray-500">
              Total des biens
            </p>

            <p className="text-3xl font-bold text-gray-800 mt-2">
              {totalBiens}
            </p>
          </div>

          {/* VENTE */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="text-4xl mb-3">
              💰
            </div>

            <p className="text-gray-500">
              Biens à vendre
            </p>

            <p className="text-3xl font-bold text-green-700 mt-2">
              {biensVente}
            </p>
          </div>

          {/* LOCATION */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="text-4xl mb-3">
              🔑
            </div>

            <p className="text-gray-500">
              Biens à louer
            </p>

            <p className="text-3xl font-bold text-blue-700 mt-2">
              {biensLocation}
            </p>
          </div>

        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* MES BIENS */}
          <div className="bg-white rounded-2xl shadow-sm p-6">

            <div className="text-4xl mb-4">
              🏠
            </div>

            <h3 className="text-xl font-bold text-gray-800">
              Mes biens
            </h3>

            <p className="text-gray-500 mt-2">
              Gérez vos maisons, appartements, terrains et autres biens.
            </p>

            <button
              onClick={() =>
                router.push("/agence/mes-biens")
              }
              className="mt-5 w-full bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-3 rounded-xl"
            >
              🏠 Voir mes biens
            </button>

          </div>

          {/* AJOUTER */}
          <div className="bg-white rounded-2xl shadow-sm p-6">

            <div className="text-4xl mb-4">
              ➕
            </div>

            <h3 className="text-xl font-bold text-gray-800">
              Ajouter un bien
            </h3>

            <p className="text-gray-500 mt-2">
              Publiez rapidement un nouveau bien immobilier.
            </p>

            <button
              onClick={() =>
                router.push("/agence/ajouter-bien")
              }
              className="mt-5 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
            >
              ➕ Ajouter un bien
            </button>

          </div>

          {/* AGENCE */}
          <div className="bg-white rounded-2xl shadow-sm p-6">

            <div className="text-4xl mb-4">
              🏢
            </div>

            <h3 className="text-xl font-bold text-gray-800">
              Mon agence
            </h3>

            <p className="text-gray-500 mt-2">
              Consultez et modifiez les informations de votre agence.
            </p>

            <button
              onClick={() =>
                router.push("/agence/mon-agence")
              }
              className="mt-5 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
            >
              🏢 Modifier mon agence
            </button>

          </div>

        </div>

      </div>
    </main>
  );
}