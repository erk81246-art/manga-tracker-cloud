# Manga Tracker Safe Update Fix

แก้ใหม่จากไฟล์ admin-email โดยไม่แก้ destructuring กว้าง ๆ:
- ลบเฉพาะ .select().single() หลัง update manga_items
- ลดโอกาส runtime crash หลังบันทึก
- ไม่ต้องรัน SQL ใหม่

ถ้ายังขึ้น error:
- เปิด DevTools > Console แล้วส่ง error สีแดงมา
- หรือ Network > request สีแดง > Response

จำนวน update snippets ที่พบ: 3

.from("manga_items").update(next).eq("id", editingId).select().single();
        if (error) return alert(error.message);
        setItems((prev) => prev.map((item) => (item.id === editingId ? (data as MangaItem) : item)));
      } else {
        const next = { ...form, user_id: user.id };
        const { data, error } = await supabase.from("manga_items").insert(next).select().single();
        if (error) return alert(error.message);
        setIt

---

.from("manga_items").update({ tier }).eq("id", id);
  }


  async function toggleFavorite(item: MangaItem) {
    if (!supabase || !user) {
      alert("ต้อง Login ก่อนถึงจะ Favorite ได้");
      return;
    }

    const isFavorite = favoriteIds.includes(item.id);

    if (isFavorite) {
      const { error } = await supabase.from("user_favorites").delete().eq("manga_id", item.id);
      if (error) return alert(error.message);
      setFavoriteIds(

---

.from("manga_items").update({ latest_chapter: latest }).eq("id", item.id);
      if (error) throw new Error(error.message);
    }
  }

  async function logout() {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setItems([]);
    setSelectedItem(null);
  }

  const filters: Array<["all" | "updated" | "favorites" | MangaStatus, string]> = [
    ["all", "ทั้งหมด"],
    ["updated", "มีตอนใหม่"],
    ["favorites", "Favorite"],
