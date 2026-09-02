"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
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
    router.refresh();
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />
            <p className="text-gray-600 mt-5 font-medium">
              Chargement de votre espace agence...
            </p>
          </div>
        </main>
      </>
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
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">

        {/* EN-TÊTE */}
        <section className="bg-green-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

              <div className="flex items-center gap-4">

                <div className="bg-white rounded-2xl p-3 shadow-lg">
                  <Image
                    src="/logo-fc-immo.png"
                    alt="FC Immo"
                    width={150}
                    height={70}
                    className="w-auto h-14 object-contain"
                  />
                </div>

                <div>
                  <p className="text-green-200 text-sm font-medium">
                    Espace professionnel
                  </p>

                  <h1 className="text-3xl sm:text-4xl font-bold mt-1">
                    Tableau de bord
                  </h1>

                  <p className="text-green-100 mt-2">
                    Gérez votre activité immobilière depuis FC Immo.
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={deconnexion}
                className="bg-white text-green-700 px-5 py-3 rounded-xl font-semibold hover:bg-green-50 transition shadow-sm"
              >
                Déconnexion
              </button>

            </div>

          </div>
        </section>

        {/* CONTENU */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* BIENVENUE */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div>
                <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                  Bienvenue
                </p>

                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                  Votre espace agence 👋
                </h2>

                <p className="text-gray-500 mt-2">
                  Connecté avec :
                </p>

                <p className="font-semibold text-gray-800 mt-1 break-all">
                  {email}
                </p>
              </div>

              <div className="bg-green-50 rounded-2xl px-5 py-4 border border-green-100">
                <p className="text-sm text-green-700 font-medium">
                  Votre activité
                </p>

                <p className="text-2xl font-bold text-green-900 mt-1">
                  {totalBiens} bien{totalBiens > 1 ? "s" : ""}
                </p>
              </div>

            </div>

          </section>

          {/* STATISTIQUES */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

            {/* TOTAL */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 font-medium">
                    Total des biens
                  </p>

                  <p className="text-4xl font-extrabold text-gray-900 mt-2">
                    {totalBiens}
                  </p>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-3xl">
                  🏠
                </div>
              </div>

              <p className="text-sm text-gray-400 mt-5">
                Ensemble de vos biens publiés.
              </p>

            </div>

            {/* VENTE */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 font-medium">
                    Biens à vendre
                  </p>

                  <p className="text-4xl font-extrabold text-green-700 mt-2">
                    {biensVente}
                  </p>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-3xl">
                  💰
                </div>
              </div>

              <p className="text-sm text-gray-400 mt-5">
                Annonces destinées à la vente.
              </p>

            </div>

            {/* LOCATION */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 font-medium">
                    Biens à louer
                  </p>

                  <p className="text-4xl font-extrabold text-blue-700 mt-2">
                    {biensLocation}
                  </p>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">
                  🔑
                </div>
              </div>

              <p className="text-sm text-gray-400 mt-5">
                Annonces destinées à la location.
              </p>

            </div>

          </section>

          {/* ACTIONS */}
          <section>

            <div className="mb-5">
              <h2 className="text-2xl font-bold text-gray-900">
                Gérer mon agence
              </h2>

              <p className="text-gray-500 mt-1">
                Accédez rapidement aux outils de votre espace professionnel.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* MES BIENS */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">

                <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-3xl">
                  🏠
                </div>

                <h3 className="text-xl font-bold text-gray-900 mt-5">
                  Mes biens
                </h3>

                <p className="text-gray-500 mt-2 leading-6">
                  Consultez, modifiez et gérez vos maisons, appartements,
                  terrains et autres biens.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/agence/mes-biens")
                  }
                  className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition"
                >
                  🏠 Voir mes biens
                </button>

              </div>

              {/* AJOUTER UN BIEN */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">

                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl">
                  ➕
                </div>

                <h3 className="text-xl font-bold text-gray-900 mt-5">
                  Ajouter un bien
                </h3>

                <p className="text-gray-500 mt-2 leading-6">
                  Publiez rapidement une nouvelle annonce immobilière sur
                  FC Immo.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/agence/ajouter-bien")
                  }
                  className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition"
                >
                  ➕ Ajouter un bien
                </button>

              </div>

              {/* MON AGENCE */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">

                <div className="w-14 h-14 rounded-2xl bg-yellow-50 flex items-center justify-center text-3xl">
                  🏢
                </div>

                <h3 className="text-xl font-bold text-gray-900 mt-5">
                  Mon agence
                </h3>

                <p className="text-gray-500 mt-2 leading-6">
                  Consultez et mettez à jour les informations de votre
                  agence.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/agence/mon-agence")
                  }
                  className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition"
                >
                  🏢 Modifier mon agence
                </button>

              </div>

            </div>

          </section>

        </div>
      </main>
    </>
  );
}