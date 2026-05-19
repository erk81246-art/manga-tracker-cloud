"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  Cloud,
  ExternalLink,
  Image as ImageIcon,
  Layers,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Star,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { supabase, isSupabaseReady } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type MangaStatus = "reading" | "waiting" | "finished" | "paused";
type MangaTier = "S" | "A" | "B" | "C" | "D";

type MangaItem = {
  id: string;
  title: string;
  cover: string;
  source_url: string;
  read_chapter: string;
  latest_chapter: string;
  status: MangaStatus;
  tier: MangaTier;
  note: string;
  user_id?: string;
};

const STORAGE_KEY = "manga-tracker-items-v2";

const emptyForm: Omit<MangaItem, "id" | "user_id"> = {
  title: "",
  cover: "",
  source_url: "",
  read_chapter: "",
  latest_chapter: "",
  status: "reading",
  tier: "A",
  note: "",
};

const statusMap: Record<MangaStatus, { label: string; badge: string }> = {
  reading: { label: "กำลังอ่าน", badge: "bg-blue-100 text-blue-700" },
  waiting: { label: "รอตอนใหม่", badge: "bg-amber-100 text-amber-700" },
  finished: { label: "อ่านจบ", badge: "bg-emerald-100 text-emerald-700" },
  paused: { label: "ดองไว้", badge: "bg-zinc-100 text-zinc-700" },
};

const tiers: MangaTier[] = ["S", "A", "B", "C", "D"];

const readingSources = [
  { name: "Go-Manga", short: "GO", url: "https://www.go-manga.com" },
  { name: "Slow-Manga", short: "SLOW", url: "https://www.slow-manga.com" },
  { name: "Dark-Manga", short: "DARK", url: "https://www.dark-manga.com" },
];

function chapterNumber(value: string) {
  const num = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(num) ? num : 0;
}

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-3xl bg-white shadow-sm ${className}`}>{children}</div>;
}

function AuthBox() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    if (!supabase) return;
    setBusy(true);
    setMessage("");

    const { error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (error) setMessage(error.message);
    else setMessage(mode === "signup" ? "สมัครแล้ว ถ้าระบบขอยืนยันอีเมล ให้ไปกดลิงก์ในอีเมลก่อน" : "เข้าสู่ระบบแล้ว");

    setBusy(false);
  }

  async function googleLogin() {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }

  if (!isSupabaseReady) {
    return (
      <Card className="p-5">
        <h2 className="text-xl font-black">ยังไม่ได้เชื่อม Supabase</h2>
        <p className="mt-2 text-sm text-zinc-500">
          แอพยังใช้ได้แบบเก็บในเครื่อง แต่ Cloud Sync / Login / Upload รูป ต้องใส่ Environment Variables ใน Vercel ก่อน
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-2xl bg-zinc-950 p-3 text-white">
          <User size={20} />
        </div>
        <div>
          <h2 className="text-xl font-black">{mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</h2>
          <p className="text-sm text-zinc-500">ข้อมูลจะ sync ข้ามเครื่องหลัง login</p>
        </div>
      </div>

      <div className="space-y-3">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="อีเมล"
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-zinc-950"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="รหัสผ่าน อย่างน้อย 6 ตัว"
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-zinc-950"
        />

        <button onClick={handleSubmit} disabled={busy} className="w-full rounded-2xl bg-zinc-950 px-2 py-2 text-xs font-bold text-white disabled:opacity-50">
          {busy ? "กำลังทำงาน..." : mode === "login" ? "Login" : "Sign up"}
        </button>

        <button onClick={googleLogin} className="w-full rounded-2xl border border-zinc-200 bg-white px-2 py-2 text-xs font-bold text-zinc-800">
          Login ด้วย Google
        </button>

        <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="w-full text-sm font-semibold text-zinc-500">
          {mode === "login" ? "ยังไม่มีบัญชี? สมัครสมาชิก" : "มีบัญชีแล้ว? เข้าสู่ระบบ"}
        </button>

        {message && <p className="rounded-2xl bg-zinc-100 p-3 text-sm text-zinc-600">{message}</p>}
      </div>
    </Card>
  );
}


function SourceIconBar({ isGuest = false }: { isGuest?: boolean }) {
  const [open, setOpen] = useState(false);

  function guard(e: React.MouseEvent<HTMLAnchorElement>) {
    if (isGuest) {
      e.preventDefault();
      alert("Login ก่อนถึงจะเปิดเว็บอ่านได้");
    }
  }

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-zinc-800">แหล่งอ่านหลัก</p>
            <p className="text-xs font-semibold text-zinc-400">Go / Slow / Dark</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="rounded-2xl bg-zinc-950 px-3 py-2.5 text-xs font-bold text-white active:scale-95"
          >
            เปิดรายการ
          </button>
        </div>
      </Card>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end bg-black/40 p-3 md:items-center md:justify-center md:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full rounded-[2rem] bg-white p-4 shadow-xl md:max-w-md"
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">แหล่งอ่านหลัก</h2>
                  <p className="text-sm text-zinc-500">{isGuest ? "Login ก่อนถึงจะเปิดเว็บอ่านได้" : "เลือกเว็บที่ต้องการเปิด"}</p>
                </div>
                <button onClick={() => setOpen(false)} className="rounded-full bg-zinc-100 p-2 text-zinc-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2">
                {readingSources.map((src) => (
                  <a
                    key={src.name}
                    href={src.url}
                    onClick={guard}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-3xl bg-zinc-950 p-3 text-white active:scale-[0.99]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-xs font-black text-zinc-950">
                      {src.short}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-black">{src.name}</p>
                      <p className="truncate text-xs text-white/60">{src.url}</p>
                    </div>
                    <ExternalLink size={18} className="text-white/70" />
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MangaTile({
  item,
  onOpen,
  small = false,
}: {
  item: MangaItem;
  onOpen: (item: MangaItem) => void;
  small?: boolean;
}) {
  const hasUpdate = chapterNumber(item.latest_chapter) > chapterNumber(item.read_chapter);

  return (
    <motion.button
      layout
      onClick={() => onOpen(item)}
      className="group min-w-0 text-left"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className={`relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-100 ${small ? "aspect-[3/4]" : "aspect-[3/4]"}`}>
        {item.cover ? (
          <img loading="lazy" src={item.cover} alt={item.title} className="h-full w-full object-cover transition group-active:scale-95" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-300">
            <ImageIcon size={26} />
          </div>
        )}

        {hasUpdate && <div className="absolute right-1.5 top-1.5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-black text-white">NEW</div>}
        <div className="absolute left-1.5 top-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-black text-white">{item.tier}</div>
      </div>
      <p className="mt-1.5 line-clamp-2 text-xs font-bold leading-tight text-zinc-800">{item.title || "ไม่มีชื่อเรื่อง"}</p>
    </motion.button>
  );
}

function DetailModal({
  item,
  onClose,
  onEdit,
  onDelete,
  onTierChange,
  onCheckLatest,
  isGuest = false,
}: {
  item: MangaItem;
  onClose: () => void;
  onEdit: (item: MangaItem) => void;
  onDelete: (id: string) => void;
  onTierChange: (id: string, tier: MangaTier) => void;
  onCheckLatest: (item: MangaItem) => Promise<void>;
  isGuest?: boolean;
}) {
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const hasUpdate = chapterNumber(item.latest_chapter) > chapterNumber(item.read_chapter);
  const newCount = Math.max(0, chapterNumber(item.latest_chapter) - chapterNumber(item.read_chapter));

  async function handleCheckLatest() {
    setChecking(true);
    setMessage("");
    try {
      await onCheckLatest(item);
      setMessage("เช็กและอัปเดตตอนล่าสุดแล้ว");
    } catch (error: any) {
      setMessage(error?.message || "เช็กไม่สำเร็จ");
    }
    setChecking(false);
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end bg-black/50 p-3 md:items-center md:justify-center md:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="max-h-[92vh] w-full overflow-y-auto rounded-[2rem] bg-white p-4 shadow-xl md:max-w-3xl md:p-6" initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-black text-zinc-950">รายละเอียด</h2>
          <button onClick={onClose} className="rounded-full bg-zinc-100 p-2 text-zinc-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-4">
          <div className="h-44 w-32 shrink-0 overflow-hidden rounded-3xl bg-zinc-100">
            {item.cover ? (
              <img loading="lazy" src={item.cover} alt={item.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-300">
                <ImageIcon size={32} />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-2xl font-black leading-tight text-zinc-950">{item.title || "ไม่มีชื่อเรื่อง"}</h1>
              <span className="rounded-full bg-zinc-950 px-3 py-1 text-sm font-black text-white">{item.tier}</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusMap[item.status].badge}`}>{statusMap[item.status].label}</span>
              {hasUpdate && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                  <Bell size={12} /> มีตอนใหม่ {newCount ? `+${newCount}` : ""}
                </span>
              )}
            </div>

            <p className="mt-3 text-sm text-zinc-500">{item.note || "ยังไม่มีโน้ต"}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-zinc-50 p-4">
            <p className="text-xs font-semibold text-zinc-400">อ่านถึง</p>
            <p className="mt-1 text-xl font-black text-zinc-950">ตอน {item.read_chapter || "-"}</p>
          </div>
          <div className="rounded-3xl bg-zinc-50 p-4">
            <p className="text-xs font-semibold text-zinc-400">ล่าสุด</p>
            <p className="mt-1 text-xl font-black text-zinc-950">ตอน {item.latest_chapter || "-"}</p>
          </div>
        </div>

        <div className="mt-4 rounded-3xl bg-zinc-50 p-4">
          <button
            onClick={handleCheckLatest}
            disabled={checking || !item.source_url || isGuest}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-3 py-2.5 text-xs font-bold text-white disabled:opacity-50"
          >
            <RefreshCw size={16} className={checking ? "animate-spin" : ""} />
            {isGuest ? "Login เพื่อเช็กตอนล่าสุด" : checking ? "กำลังเช็ก..." : "เช็กตอนล่าสุดจากเว็บ"}
          </button>
          {message && <p className="mt-2 text-center text-xs font-semibold text-zinc-500">{message}</p>}
        </div>

        <div className="mt-4 rounded-3xl bg-zinc-50 p-4">
          <p className="mb-3 text-sm font-black text-zinc-700">จัด Tier</p>
          <div className="flex gap-2 overflow-x-auto">
            {tiers.map((tier) => (
              <button
                key={tier}
                onClick={() => !isGuest && onTierChange(item.id, tier)}
                disabled={isGuest}
                className={`h-10 min-w-10 rounded-2xl text-sm font-black ${item.tier === tier ? "bg-zinc-950 text-white" : "bg-white text-zinc-500"}`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {isGuest ? (
            <div className="w-full rounded-2xl bg-zinc-100 px-4 py-3 text-center text-sm font-bold text-zinc-500">
              Login เพื่อเปิดเว็บอ่าน / แก้ไข / ลบ
            </div>
          ) : (
            <>
              {item.source_url && (
                <a href={item.source_url} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-100 px-4 py-3 text-sm font-bold text-zinc-700">
                  <ExternalLink size={16} /> เปิดเว็บ
                </a>
              )}
              <button onClick={() => onEdit(item)} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-3 py-2.5 text-xs font-bold text-white">
                <Pencil size={16} /> แก้ไข
              </button>
              <button onClick={() => onDelete(item.id)} className="rounded-2xl border border-zinc-200 px-4 py-3 text-rose-600">
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function MangaForm({
  value,
  onChange,
  onSave,
  onClose,
  editing,
  user,
}: {
  value: Omit<MangaItem, "id" | "user_id">;
  onChange: (next: Omit<MangaItem, "id" | "user_id">) => void;
  onSave: () => void;
  onClose: () => void;
  editing: boolean;
  user: SupabaseUser | null;
}) {
  const [uploading, setUploading] = useState(false);
  const set = (key: keyof Omit<MangaItem, "id" | "user_id">, next: string) => onChange({ ...value, [key]: next });

  async function uploadCover(file: File | null) {
    if (!file) return;
    if (!supabase || !user) {
      alert("ต้อง Login และตั้งค่า Supabase ก่อน ถึงจะอัปโหลดรูปได้");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("manga-covers").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) alert(error.message);
    else {
      const { data } = supabase.storage.from("manga-covers").getPublicUrl(path);
      set("cover", data.publicUrl);
    }
    setUploading(false);
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end bg-black/40 p-3 md:items-center md:justify-center md:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="max-h-[92vh] w-full overflow-y-auto rounded-[2rem] bg-white p-4 shadow-xl md:max-w-2xl md:p-6" initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-zinc-950">{editing ? "แก้ไขมังงะ" : "เพิ่มมังงะ"}</h2>
            <p className="text-sm text-zinc-500">เพิ่มรูปจากมือถือได้</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-zinc-100 p-2 text-zinc-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-bold text-zinc-700">ชื่อเรื่อง</span>
            <input value={value.title} onChange={(e) => set("title", e.target.value)} placeholder="เช่น One Piece" className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-zinc-950" />
          </label>

          <label className="block rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-center">
            <Upload className="mx-auto text-zinc-500" />
            <span className="mt-2 block text-sm font-bold text-zinc-700">{uploading ? "กำลังอัปโหลด..." : "เลือกรูปปกจากมือถือ"}</span>
            <input type="file" accept="image/*" onChange={(e) => uploadCover(e.target.files?.[0] || null)} className="hidden" />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-zinc-700">หรือวางลิงก์รูปปก</span>
            <input value={value.cover} onChange={(e) => set("cover", e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-zinc-950" />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-zinc-700">ลิงก์เว็บที่อ่าน</span>
            <input value={value.source_url} onChange={(e) => set("source_url", e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-zinc-950" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-bold text-zinc-700">อ่านถึงตอน</span>
              <input inputMode="decimal" value={value.read_chapter} onChange={(e) => set("read_chapter", e.target.value)} placeholder="12" className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-zinc-950" />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-zinc-700">ล่าสุดตอน</span>
              <input inputMode="decimal" value={value.latest_chapter} onChange={(e) => set("latest_chapter", e.target.value)} placeholder="15" className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-zinc-950" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-bold text-zinc-700">สถานะ</span>
              <select value={value.status} onChange={(e) => set("status", e.target.value as MangaStatus)} className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-zinc-950">
                <option value="reading">กำลังอ่าน</option>
                <option value="waiting">รอตอนใหม่</option>
                <option value="finished">อ่านจบ</option>
                <option value="paused">ดองไว้</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-bold text-zinc-700">Tier</span>
              <select value={value.tier} onChange={(e) => set("tier", e.target.value as MangaTier)} className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-zinc-950">
                {tiers.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-bold text-zinc-700">โน้ต</span>
            <textarea value={value.note} onChange={(e) => set("note", e.target.value)} rows={3} placeholder="โน้ตส่วนตัว" className="mt-1 w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-zinc-950" />
          </label>
        </div>

        <button onClick={onSave} className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-zinc-950 text-base font-bold text-white">
          <Save size={18} className="mr-2" /> บันทึก
        </button>
      </motion.div>
    </motion.div>
  );
}

function Sidebar({
  user,
  stats,
  filter,
  setFilter,
  tab,
  setTab,
  onAdd,
  onLogout,
  isWideLandscape,
}: {
  user: SupabaseUser | null;
  stats: { total: number; updated: number; reading: number; finished: number; paused: number };
  filter: "all" | "updated" | MangaStatus;
  setFilter: (filter: "all" | "updated" | MangaStatus) => void;
  tab: "collection" | "tier";
  setTab: (tab: "collection" | "tier") => void;
  onAdd: () => void;
  onLogout: () => void;
  isWideLandscape: boolean;
}) {
  const filters: Array<["all" | "updated" | MangaStatus, string]> = [
    ["all", "ทั้งหมด"],
    ["updated", "มีตอนใหม่"],
    ["reading", "กำลังอ่าน"],
    ["waiting", "รอ"],
    ["finished", "จบแล้ว"],
    ["paused", "ดองไว้"],
  ];

  return (
    <aside className={`app-sidebar rounded-[2rem] bg-zinc-950 p-3 text-white shadow-sm ${isWideLandscape ? "sticky top-4 block h-[calc(100vh-2rem)] overflow-y-auto" : "hidden"} xl:sticky xl:top-6 xl:block xl:h-[calc(100vh-3rem)] xl:overflow-y-auto`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1 text-sm font-semibold text-zinc-400">
            <Cloud size={14} />
            {user ? "Cloud Sync เปิดอยู่" : "Manga Tracker"}
          </p>
          <h1 className="mt-1 text-base font-black leading-tight">คลังมังงะ</h1>
        </div>
        <div className="flex gap-2 xl:hidden">
          {user && (
            <button onClick={onLogout} className="rounded-2xl bg-white/10 p-3 text-white">
              <LogOut size={20} />
            </button>
          )}
          <button onClick={onAdd} className="rounded-2xl bg-white p-3 text-zinc-950 shadow-sm">
            <Plus size={22} />
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-3xl bg-white/10 p-3">
        <p className="text-xs text-zinc-400">ทั้งหมด</p>
        <p className="text-2xl font-black">{stats.total}</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 rounded-3xl bg-white/10 p-1">
        <button onClick={() => user && setTab("collection")} disabled={!user} className={`flex items-center justify-center gap-2 rounded-2xl px-2 py-2 text-xs font-bold ${tab === "collection" ? "bg-white text-zinc-950" : "text-zinc-400"}`}>
          <BookOpen size={16} /> Collection
        </button>
        <button onClick={() => setTab("tier")} className={`flex items-center justify-center gap-2 rounded-2xl px-2 py-2 text-xs font-bold ${tab === "tier" ? "bg-white text-zinc-950" : "text-zinc-400"}`}>
          <Layers size={16} /> Tier
        </button>
      </div>

      {tab === "collection" && (
        <div className="mt-4 hidden space-y-2 md:block">
          <p className="px-1 text-xs font-bold uppercase tracking-widest text-zinc-500">Filter</p>
          {filters.map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} className={`w-full rounded-2xl px-3 py-2.5 text-left text-xs font-bold ${filter === key ? "bg-white text-zinc-950" : "bg-white/10 text-zinc-300"}`}>
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 hidden space-y-2 md:block">
        <button onClick={onAdd} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-2 py-2 text-xs font-bold text-zinc-950">
          <Plus size={18} /> เพิ่มมังงะ
        </button>
        {user && (
          <button onClick={onLogout} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-2 py-2 text-xs font-bold text-white">
            <LogOut size={18} /> Logout
          </button>
        )}
      </div>
    </aside>
  );
}

export default function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [items, setItems] = useState<MangaItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "updated" | MangaStatus>("all");
  const [tab, setTab] = useState<"collection" | "tier">("tier");
  const [form, setForm] = useState<Omit<MangaItem, "id" | "user_id">>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MangaItem | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [isWideLandscape, setIsWideLandscape] = useState(false);

  useEffect(() => {
    if (!supabase) {
      const saved = localStorage.getItem(STORAGE_KEY);
      setItems(saved ? JSON.parse(saved) : []);
      setLoaded(true);
      return;
    }

    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    setLoaded(true);
    return () => listener.subscription.unsubscribe();
  }, []);


  useEffect(() => {
    if (user) setTab("collection");
    else setTab("tier");
  }, [user]);


  useEffect(() => {
    function updateLayoutMode() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsWideLandscape(width >= 900 && width > height);
    }

    updateLayoutMode();
    window.addEventListener("resize", updateLayoutMode);
    window.addEventListener("orientationchange", updateLayoutMode);
    return () => {
      window.removeEventListener("resize", updateLayoutMode);
      window.removeEventListener("orientationchange", updateLayoutMode);
    };
  }, []);

  useEffect(() => {
    async function loadCloud() {
      if (!supabase) return;
      setSyncing(true);
      const { data, error } = await supabase.from("manga_items").select("*").order("created_at", { ascending: false });
      if (!error && data) setItems(data as MangaItem[]);
      setSyncing(false);
    }
    loadCloud();
  }, [user]);

  useEffect(() => {
    if (!supabase && loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  useEffect(() => {
    if (selectedItem) {
      const updated = items.find((item) => item.id === selectedItem.id);
      if (updated) setSelectedItem(updated);
    }
  }, [items, selectedItem]);

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase());
        const hasUpdate = chapterNumber(item.latest_chapter) > chapterNumber(item.read_chapter);
        const matchesFilter = filter === "all" || (filter === "updated" && hasUpdate) || item.status === filter;
        return matchesQuery && matchesFilter;
      }),
    [items, query, filter]
  );

  const stats = useMemo(
    () => ({
      total: items.length,
      updated: items.filter((item) => chapterNumber(item.latest_chapter) > chapterNumber(item.read_chapter)).length,
      reading: items.filter((item) => item.status === "reading").length,
      finished: items.filter((item) => item.status === "finished").length,
      paused: items.filter((item) => item.status === "paused").length,
    }),
    [items]
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpenForm(true);
  };

  const openEdit = (item: MangaItem) => {
    setSelectedItem(null);
    setEditingId(item.id);
    const { id, user_id, ...rest } = item;
    setForm(rest);
    setOpenForm(true);
  };

  async function saveItem() {
    if (!form.title.trim()) return;

    if (supabase && user) {
      if (editingId) {
        const next = { ...form };
        const { data, error } = await supabase.from("manga_items").update(next).eq("id", editingId).select().single();
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

    setOpenForm(false);
    setForm(emptyForm);
    setEditingId(null);
  }

  async function deleteItem(id: string) {
    if (!confirm("ลบเรื่องนี้ใช่ไหม?")) return;
    if (supabase && user) {
      const { error } = await supabase.from("manga_items").delete().eq("id", id);
      if (error) return alert(error.message);
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItem(null);
  }

  async function changeTier(id: string, tier: MangaTier) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, tier } : item)));
    if (supabase && user) await supabase.from("manga_items").update({ tier }).eq("id", id);
  }

  async function checkLatest(item: MangaItem) {
    if (!item.source_url) throw new Error("เรื่องนี้ยังไม่มีลิงก์เว็บ");

    const response = await fetch("/api/check-latest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: item.source_url }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "เช็กไม่สำเร็จ");

    const latest = String(result.latestChapter);
    setItems((prev) => prev.map((manga) => (manga.id === item.id ? { ...manga, latest_chapter: latest } : manga)));

    if (supabase && user) {
      const { error } = await supabase.from("manga_items").update({ latest_chapter: latest }).eq("id", item.id);
      if (error) throw new Error(error.message);
    }
  }

  async function logout() {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setItems([]);
    setSelectedItem(null);
  }

  const filters: Array<["all" | "updated" | MangaStatus, string]> = [
    ["all", "ทั้งหมด"],
    ["updated", "มีตอนใหม่"],
    ["reading", "กำลังอ่าน"],
    ["waiting", "รอ"],
    ["finished", "จบแล้ว"],
    ["paused", "ดองไว้"],
  ];

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950 xl:p-6">
      <div className={`app-shell mx-auto grid gap-4 ${isWideLandscape ? "max-w-7xl grid-cols-[170px_1fr] px-0 pb-4 pt-0" : "max-w-md px-4 pb-28 pt-3"} xl:max-w-7xl xl:grid-cols-[170px_1fr] xl:px-0 xl:pt-0`}>
        <Sidebar
          user={user}
          stats={stats}
          filter={filter}
          setFilter={setFilter}
          tab={tab}
          setTab={setTab}
          onAdd={openAdd}
          onLogout={logout}
          isWideLandscape={isWideLandscape}
        />

        <section className="min-w-0">
          {!user && (
            <div className="mb-4">
              <AuthBox />
            </div>
          )}

          {user && (
            <div className={`desktop-topbar mb-4 gap-3 ${isWideLandscape ? "grid grid-cols-[1fr_220px]" : "hidden"} xl:grid xl:grid-cols-[1fr_240px]`}>
              <Card className="p-5">
                <p className="text-sm font-bold text-zinc-400">Good evening,</p>
                <h2 className="mt-1 text-xl font-black text-zinc-950">{user.email?.split("@")[0] || "Reader"}</h2>
                <p className="mt-1 text-sm text-zinc-500">ค้นหา จัดการ และเช็กตอนใหม่จากที่นี่</p>
              </Card>
              <SourceIconBar isGuest={!user} />
            </div>
          )}

          {syncing && <p className="mb-3 rounded-2xl bg-white p-3 text-center text-sm text-zinc-500">กำลัง sync ข้อมูล...</p>}

          <div className={`app-sticky-bar sticky z-20 bg-zinc-100/90 px-4 py-3 backdrop-blur ${isWideLandscape ? "top-4 mx-0 rounded-[2rem] bg-white px-3 shadow-sm" : "top-0 -mx-4"} xl:top-6 xl:mx-0 xl:rounded-[2rem] xl:bg-white xl:px-3 xl:shadow-sm`}>
            <div className="hidden rounded-3xl bg-white p-1 shadow-sm">
              <button onClick={() => user && setTab("collection")} disabled={!user} className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-2 py-2 text-xs font-bold ${tab === "collection" ? "bg-zinc-950 text-white" : "text-zinc-500"}`}>
                <BookOpen size={16} /> Collection
              </button>
              <button onClick={() => setTab("tier")} className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-2 py-2 text-xs font-bold ${tab === "tier" ? "bg-zinc-950 text-white" : "text-zinc-500"}`}>
                <Layers size={16} /> Tier List
              </button>
            </div>

            {tab === "collection" && (
              <div className="mt-3 flex items-center gap-2 rounded-3xl bg-white px-4 py-3 shadow-sm xl:mt-0 xl:bg-zinc-50 xl:shadow-none">
                <Search size={18} className="text-zinc-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาชื่อมังงะ..." className="w-full bg-transparent text-sm outline-none" />
              </div>
            )}
          </div>

          {tab === "collection" ? (
            <>
              <div className="mb-4 mt-4 flex gap-2 overflow-x-auto pb-1 xl:hidden">
                {filters.map(([key, label]) => (
                  <button key={key} onClick={() => setFilter(key)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${filter === key ? "bg-zinc-950 text-white" : "bg-white text-zinc-500"}`}>
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-6 2xl:grid-cols-7">
                <AnimatePresence>
                  {filtered.map((item) => (
                    <MangaTile key={item.id} item={item} onOpen={setSelectedItem} />
                  ))}
                </AnimatePresence>
              </div>

              {filtered.length === 0 && (
                <div className="mt-4 rounded-[2rem] bg-white p-8 text-center shadow-sm">
                  <Star className="mx-auto text-zinc-300" size={36} />
                  <h3 className="mt-3 font-black">ยังไม่มีรายการ</h3>
                  <p className="mt-1 text-sm text-zinc-500">กดเพิ่มมังงะเพื่อเริ่มใช้งาน</p>
                </div>
              )}
            </>
          ) : (
            <div className="mt-4 space-y-4">
              {tiers.map((tier) => {
                const tierItems = items.filter((item) => item.tier === tier);
                return (
                  <Card key={tier} className="p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-xl font-black text-white">{tier}</div>
                      <div>
                        <h2 className="font-black">Tier {tier}</h2>
                        <p className="text-sm text-zinc-500">{tierItems.length} เรื่อง</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-10">
                      {tierItems.map((item) => (
                        <MangaTile key={item.id} item={item} onOpen={setSelectedItem} small />
                      ))}
                      {tierItems.length === 0 && <p className="col-span-4 text-sm text-zinc-400">ยังไม่มีเรื่องใน Tier นี้</p>}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <div className={`mobile-bottom-nav fixed bottom-4 left-1/2 z-30 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between gap-2 rounded-[2rem] bg-zinc-950 p-2 text-white shadow-xl ${isWideLandscape ? "hidden" : "flex"} xl:hidden`}>
        <button onClick={() => setTab("collection")} className={`flex flex-1 flex-col items-center justify-center rounded-3xl px-2 py-2 text-[11px] font-bold ${tab === "collection" ? "bg-white text-zinc-950" : "text-zinc-400"}`}>
          <BookOpen size={18} />
          Collection
        </button>
        <button onClick={() => setTab("tier")} className={`flex flex-1 flex-col items-center justify-center rounded-3xl px-2 py-2 text-[11px] font-bold ${tab === "tier" ? "bg-white text-zinc-950" : "text-zinc-400"}`}>
          <Layers size={18} />
          Tier
        </button>
        <button onClick={() => setSourcesOpen(true)} className="flex flex-1 flex-col items-center justify-center rounded-3xl px-2 py-2 text-[11px] font-bold text-zinc-400">
          <ExternalLink size={18} />
          เว็บอ่าน
        </button>
        {user && (
          <button onClick={openAdd} className="flex flex-1 flex-col items-center justify-center rounded-3xl bg-white px-2 py-2 text-[11px] font-black text-zinc-950">
            <Plus size={20} />
            เพิ่ม
          </button>
        )}
      </div>

      <AnimatePresence>

        {sourcesOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end bg-black/40 p-3 md:items-center md:justify-center md:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full rounded-[2rem] bg-white p-4 shadow-xl md:max-w-md"
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">แหล่งอ่านหลัก</h2>
                  <p className="text-sm text-zinc-500">{!user ? "Login ก่อนถึงจะเปิดเว็บอ่านได้" : "เลือกเว็บที่ต้องการเปิด"}</p>
                </div>
                <button onClick={() => setSourcesOpen(false)} className="rounded-full bg-zinc-100 p-2 text-zinc-600">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-2">
                {readingSources.map((src) => (
                  <a
                    key={src.name}
                    href={src.url}
                    onClick={(e) => {
                      if (!user) {
                        e.preventDefault();
                        alert("Login ก่อนถึงจะเปิดเว็บอ่านได้");
                      }
                    }}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-3xl bg-zinc-950 p-3 text-white active:scale-[0.99]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-xs font-black text-zinc-950">
                      {src.short}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-black">{src.name}</p>
                      <p className="truncate text-xs text-white/60">{src.url}</p>
                    </div>
                    <ExternalLink size={18} className="text-white/70" />
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {selectedItem && (
          <DetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onEdit={openEdit}
            onDelete={deleteItem}
            onTierChange={changeTier}
            onCheckLatest={checkLatest}
            isGuest={!user}
          />
        )}
        {openForm && (
          <MangaForm
            value={form}
            onChange={setForm}
            onSave={saveItem}
            onClose={() => setOpenForm(false)}
            editing={Boolean(editingId)}
            user={user}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
