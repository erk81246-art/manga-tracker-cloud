# Manga Tracker Update Select Fix

แก้ปัญหา:
- กดบันทึกแล้วขึ้น 406
- Network ยังเห็น PATCH /manga_items?...&select=*
- Alert: Cannot coerce the result to a single JSON object

แก้แล้ว:
- ลบ .select(...) ทุกแบบที่ต่อหลัง update manga_items
- ไม่ให้ Supabase PATCH ขอผลลัพธ์กลับมาเป็น single JSON object
- ไม่ต้องรัน SQL ใหม่

ถ้ายังขึ้นอีก ให้ส่งรูป Network > Response ของ request สีแดงมา
จำนวน update chain ที่ยังมี .select เหลือ: 1

.from("manga_items").update(next).eq("id", editingId);
        if (error) return alert(error.message);
        setItems((prev) => prev.map((item) => (item.id === editingId ? (data as MangaItem) : item)));
      } else {
        const next = { ...form, user_id: user.id };
        const { data, error } = await supabase.from("manga_items").insert(next).select().single();
        if (error) return alert(error.message);
        setItems((prev) => [data as MangaItem, ...prev]);
      }
    } else {
      if (editingId) setItems((prev) => prev.map((item) => (item.id === editingId ? { ...form, id: editingId } : item)));
      else setItems((prev) => [{ ...form, id: makeId() }, ...prev]);
    }

    