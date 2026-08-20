"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function FavoriButton({
  bienId,
}: {
  bienId: string;
}) {
  const [user, setUser] = useState<any>(null);
  const [favori, setFavori] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    verifierFavori();
  }, []);

  async function verifierFavori() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

    if (!user) return;

    const { data } = await supabase
      .from("favoris")
      .select("id")
      .eq("user_id", user.id)
      .eq("bien_id", bienId)
      .maybeSingle();

    setFavori(!!data);
  }

  async function toggleFavori() {
    if (!user) {
      alert("Connectez-vous pour ajouter ce bien à vos favoris.");
      return;
    }

    setLoading(true);

    if (favori) {
      const { error } = await supabase
        .from("favoris")
        .delete()
        .eq("user_id", user.id)
        .eq("bien_id", bienId);

      if (error) {
        console.error("ERREUR SUPPRESSION FAVORI :", error);
        alert("Impossible de retirer ce bien des favoris.");
      } else {
        setFavori(false);
      }
    } else {
      const { error } = await supabase
        .from("favoris")
        .insert({
          user_id: user.id,
          bien_id: bienId,
        });

      if (error) {
        console.error("ERREUR AJOUT FAVORI :", error);
        alert("Impossible d'ajouter ce bien aux favoris.");
      } else {
        setFavori(true);
      }
    }

    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={toggleFavori}
      disabled={loading}
      className="flex-1 border border-green-600 text-green-700 hover:bg-green-50 font-bold py-4 rounded-xl disabled:opacity-50"
    >
      {loading
        ? "⏳..."
        : favori
        ? "❤️ Retirer des favoris"
        : "🤍 Ajouter aux favoris"}
    </button>
  );
}