"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Cloud,
  ExternalLink,
  Heart,
  Image as ImageIcon,
  Layers,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Play,
  RefreshCw,
  Save,
  Scissors,
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
  last_read_url?: string;
  last_read_chapter?: string;
  last_read_at?: string;
  user_id?: string;
};

type UserFavorite = {
  user_id: string;
  manga_id: string;
  created_at?: string;
};

const STORAGE_KEY = "manga-tracker-items-v2";
const SOURCES_STORAGE_KEY = "manga-tracker-reading-sources-v1";
const PASS_STORAGE_KEY = "manga-tracker-pass-cache-v1";
const PASS_INDEX_KEY = "manga-tracker-pass-index-v1";
const HISTORY_STORAGE_KEY = "manga-tracker-reading-history-v1";
const ADMIN_EMAILS = ["erk81246@gmail.com"];

const emptyForm: Omit<MangaItem, "id" | "user_id"> = {
  title: "",
  cover: "",
  source_url: "",
  read_chapter: "",
  latest_chapter: "",
  status: "reading",
  tier: "A",
  note: "",
  last_read_url: "",
  last_read_chapter: "",
  last_read_at: "",
};

const statusMap: Record<MangaStatus, { label: string; badge: string }> = {
  reading: { label: "กำลังอ่าน", badge: "bg-blue-100 text-blue-700" },
  waiting: { label: "รอตอนใหม่", badge: "bg-amber-100 text-amber-700" },
  finished: { label: "อ่านจบ", badge: "bg-emerald-100 text-emerald-700" },
  paused: { label: "ดองไว้", badge: "bg-zinc-100 text-zinc-700" },
};

const tiers: MangaTier[] = ["S", "A", "B", "C", "D"];

const defaultReadingSources = [
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

        <button onClick={handleSubmit} disabled={busy} className="w-full rounded-2xl bg-zinc-950 px-3 py-2.5 text-sm font-bold text-white disabled:opacity-50">
          {busy ? "กำลังทำงาน..." : mode === "login" ? "Login" : "Sign up"}
        </button>

        <button onClick={googleLogin} className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-bold text-zinc-800">
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


function SourceIconBar({
  isGuest = false,
  sources,
  onAddSource,
  onDeleteSource,
}: {
  isGuest?: boolean;
  sources: typeof defaultReadingSources;
  onAddSource: (source: { name: string; short: string; url: string }) => void;
  onDeleteSource: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  function guard(e: React.MouseEvent<HTMLAnchorElement>) {
    if (isGuest) {
      e.preventDefault();
      alert("Login ก่อนถึงจะเปิดเว็บอ่านได้");
    }
  }

  function addSource() {
    const cleanName = name.trim();
    let cleanUrl = url.trim();
    if (!cleanName || !cleanUrl) return;
    if (!/^https?:\/\//i.test(cleanUrl)) cleanUrl = `https://${cleanUrl}`;
    const short = cleanName.replace(/[^a-z0-9]/gi, "").slice(0, 5).toUpperCase() || "WEB";
    onAddSource({ name: cleanName, short, url: cleanUrl });
    setName("");
    setUrl("");
    setShowAdd(false);
  }

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-zinc-800">แหล่งอ่านหลัก</p>
            <p className="text-xs font-semibold text-zinc-400">{sources.length} เว็บ</p>
          </div>
          <button onClick={() => setOpen(true)} className="rounded-2xl bg-zinc-950 px-3 py-2.5 text-xs font-bold text-white active:scale-95">
            เปิดรายการ
          </button>
        </div>
      </Card>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[60] flex items-end bg-black/40 p-3 md:items-center md:justify-center md:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full rounded-[2rem] bg-white p-4 shadow-xl md:max-w-md" initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">แหล่งอ่านหลัก</h2>
                  <p className="text-sm text-zinc-500">{isGuest ? "Login ก่อนถึงจะเปิดเว็บอ่านได้" : "เพิ่มเว็บอ่านเองได้"}</p>
                </div>
                <button onClick={() => setOpen(false)} className="rounded-full bg-zinc-100 p-2 text-zinc-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2">
                {sources.map((src) => (
                  <div key={src.url} className="flex items-center gap-2">
                    <a href={src.url} onClick={guard} target="_blank" rel="noreferrer" className="flex min-w-0 flex-1 items-center gap-3 rounded-3xl bg-zinc-950 p-3 text-white active:scale-[0.99]">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-xs font-black text-zinc-950">
                        {src.short}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-black">{src.name}</p>
                        <p className="truncate text-xs text-white/60">{src.url}</p>
                      </div>
                      <ExternalLink size={18} className="text-white/70" />
                    </a>
                    {!isGuest && (
                      <button onClick={() => onDeleteSource(src.url)} className="rounded-2xl bg-zinc-100 p-3 text-rose-600">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {!isGuest && (
                <div className="mt-4 rounded-3xl bg-zinc-50 p-3">
                  <button onClick={() => setShowAdd(!showAdd)} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-bold text-white">
                    <Plus size={16} /> เพิ่มเว็บอ่าน
                  </button>
                  {showAdd && (
                    <div className="mt-3 space-y-2">
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อเว็บ เช่น Manga ABC" className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-950" />
                      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL เช่น https://example.com" className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-950" />
                      <button onClick={addSource} className="w-full rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white">
                        บันทึกเว็บ
                      </button>
                    </div>
                  )}
                </div>
              )}
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
  isFavorite = false,
}: {
  item: MangaItem;
  onOpen: (item: MangaItem) => void;
  small?: boolean;
  isFavorite?: boolean;
}) {
  const hasUpdate = chapterNumber(item.latest_chapter) > chapterNumber(item.read_chapter);
  const continueUrl = item.last_read_url || item.source_url;

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
        <div className="absolute left-1.5 top-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-black text-white">{item.tier}</div>{isFavorite && <div className="absolute bottom-1.5 right-1.5 rounded-full bg-rose-500 p-1 text-white"><Heart size={12} fill="currentColor" /></div>}
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
  isFavorite = false,
  onToggleFavorite,
  canManage = false,
}: {
  item: MangaItem;
  onClose: () => void;
  onEdit: (item: MangaItem) => void;
  onDelete: (id: string) => void;
  onTierChange: (id: string, tier: MangaTier) => void;
  onCheckLatest: (item: MangaItem) => Promise<void>;
  isGuest?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (item: MangaItem) => void;
  canManage?: boolean;
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
              <div className="flex shrink-0 items-center gap-2">
                {!isGuest && (
                  <button
                    onClick={() => onToggleFavorite?.(item)}
                    className={`rounded-full p-2 ${isFavorite ? "bg-rose-100 text-rose-600" : "bg-zinc-100 text-zinc-500"}`}
                    title={isFavorite ? "เลิก Favorite" : "Favorite"}
                  >
                    <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                  </button>
                )}
                <span className="rounded-full bg-zinc-950 px-3 py-1 text-sm font-black text-white">{item.tier}</span>
              </div>
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
            <p className="mt-1 text-2xl font-black text-zinc-950">ตอน {item.read_chapter || "-"}</p>
          </div>
          <div className="rounded-3xl bg-zinc-50 p-4">
            <p className="text-xs font-semibold text-zinc-400">ล่าสุด</p>
            <p className="mt-1 text-2xl font-black text-zinc-950">ตอน {item.latest_chapter || "-"}</p>
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
                onClick={() => canManage && onTierChange(item.id, tier)}
                disabled={!canManage}
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
              {(item.last_read_url || item.source_url) && (
                <button onClick={() => window.open(item.last_read_url || item.source_url, "_blank", "noopener,noreferrer")} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-100 px-4 py-3 text-sm font-bold text-zinc-700">
                  <ExternalLink size={16} /> อ่านต่อ
                </button>
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

          <label className="block">
            <span className="text-sm font-bold text-zinc-700">อ่านต่อ URL</span>
            <input value={value.last_read_url || ""} onChange={(e) => set("last_read_url" as any, e.target.value)} placeholder="เช่น https://speed-manga.net/manga/solo-leveling/chapter-124" className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-zinc-950" />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-zinc-700">อ่านล่าสุดถึงตอน</span>
            <input value={value.last_read_chapter || ""} onChange={(e) => set("last_read_chapter" as any, e.target.value)} placeholder="เช่น 124" className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-zinc-950" />
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


function HeroCarousel({
  items,
  activeIndex,
  setActiveIndex,
  onOpen,
  favoriteIds,
  onToggleFavorite,
  onRead,
  user,
}: {
  items: MangaItem[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  onOpen: (item: MangaItem) => void;
  favoriteIds: string[];
  onToggleFavorite: (item: MangaItem) => void;
  onRead: (item: MangaItem) => void;
  user: SupabaseUser | null;
}) {
  const featured = items.slice(0, 8);
  if (featured.length === 0) return null;

  const index = Math.min(activeIndex, featured.length - 1);
  const active = featured[index];
  const prev = featured[(index - 1 + featured.length) % featured.length];
  const next = featured[(index + 1) % featured.length];
  const hasUpdate = chapterNumber(active.latest_chapter) > chapterNumber(active.read_chapter);
  const isFavorite = favoriteIds.includes(active.id);

  function move(step: number) {
    setActiveIndex((index + step + featured.length) % featured.length);
  }

  return (
    <section className="hero-showcase mb-6 overflow-hidden rounded-[2.2rem] bg-zinc-950 p-3 text-white shadow-sm md:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-purple-300">Featured</p>
          <h2 className="mt-1 text-xl font-black md:text-3xl">Collection Highlight</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => move(-1)} className="rounded-2xl bg-white/10 p-3 text-white active:scale-95">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => move(1)} className="rounded-2xl bg-white/10 p-3 text-white active:scale-95">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="relative min-h-[560px] md:min-h-[430px]">
        {featured.length > 1 && (
          <button onClick={() => move(-1)} className="absolute left-0 top-12 hidden h-[310px] w-[170px] overflow-hidden rounded-[1.7rem] opacity-45 md:block">
            {prev.cover ? <img src={prev.cover} alt={prev.title} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-zinc-800" />}
            <div className="absolute inset-0 bg-black/45" />
            <p className="absolute bottom-4 left-4 right-4 line-clamp-2 text-left text-xl font-black">{prev.title}</p>
          </button>
        )}

        {featured.length > 1 && (
          <button onClick={() => move(1)} className="absolute right-0 top-12 hidden h-[310px] w-[170px] overflow-hidden rounded-[1.7rem] opacity-45 md:block">
            {next.cover ? <img src={next.cover} alt={next.title} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-zinc-800" />}
            <div className="absolute inset-0 bg-black/45" />
            <p className="absolute bottom-4 left-4 right-4 line-clamp-2 text-left text-xl font-black">{next.title}</p>
          </button>
        )}

        <motion.div
          key={active.id}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => {
            if (info.offset.x < -80) move(1);
            if (info.offset.x > 80) move(-1);
          }}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative z-10 mx-auto min-h-[540px] overflow-hidden rounded-[2rem] border border-purple-400/40 bg-zinc-900 shadow-[0_0_32px_rgba(168,85,247,0.25)] md:min-h-[410px] md:w-[72%]"
        >
          {active.cover ? <img src={active.cover} alt={active.title} className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 bg-zinc-800" />}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          <div className="relative z-10 flex min-h-[540px] flex-col justify-end p-5 md:min-h-[410px] md:p-8">
            <div className="mb-auto flex items-center justify-between">
              <span className="rounded-full bg-purple-500 px-4 py-2 text-xs font-black text-white">
                {hasUpdate ? "NEW CHAPTER" : `TIER ${active.tier}`}
              </span>
              {user && (
                <button onClick={() => onToggleFavorite(active)} className={`rounded-full p-3 ${isFavorite ? "bg-rose-500 text-white" : "bg-white/10 text-white"}`}>
                  <Heart size={22} fill={isFavorite ? "currentColor" : "none"} />
                </button>
              )}
            </div>

            <h1 className="max-w-xl text-5xl font-black leading-none tracking-tight md:text-6xl">{active.title}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">อ่านถึง {active.read_chapter || "-"}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">ล่าสุด {active.latest_chapter || "-"}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">Tier {active.tier}</span>
            </div>
            <p className="mt-4 line-clamp-2 max-w-xl text-sm font-medium text-white/75">{active.note || "กดรายละเอียดเพื่อดูข้อมูลและจัดการเรื่องนี้"}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => onOpen(active)} className="flex items-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-purple-600/25 active:scale-95">
                <BookOpen size={18} /> รายละเอียด
              </button>
              {(active.last_read_url || active.source_url) && (
                <button onClick={() => onRead(active)} className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white active:scale-95">
                  <Play size={18} /> อ่านต่อ
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-3 flex justify-center gap-2">
        {featured.map((item, i) => (
          <button key={item.id} onClick={() => setActiveIndex(i)} className={`h-2 rounded-full transition-all ${i === index ? "w-8 bg-purple-500" : "w-2 bg-white/20"}`} aria-label={`go to ${item.title}`} />
        ))}
      </div>
    </section>
  );
}



function ReadingHistoryRow({
  items,
  historyIds,
  onOpen,
  onRead,
}: {
  items: MangaItem[];
  historyIds: string[];
  onOpen: (item: MangaItem) => void;
  onRead?: (item: MangaItem) => void;
}) {
  const list = historyIds
    .map((id) => items.find((item) => item && item.id === id))
    .filter(Boolean)
    .slice(0, 8) as MangaItem[];

  function openReadingUrl(item: MangaItem) {
    if (onRead) {
      onRead(item);
      return;
    }
    const url = (item.last_read_url || item.source_url || "").trim();
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    else onOpen(item);
  }

  if (list.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-400">History</p>
          <h2 className="text-xl font-black text-zinc-950">อ่านล่าสุด</h2>
        </div>
        <span className="text-sm font-bold text-zinc-400">{list.length} เรื่อง</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {list.map((item, index) => {
          const directUrl = (item.last_read_url || "").trim();
          const fallbackUrl = (item.source_url || "").trim();
          const usingLastReadUrl = Boolean(directUrl);

          return (
            <div key={item.id} className="min-w-[230px] rounded-3xl bg-white p-3 shadow-sm md:min-w-[260px]">
              <button onClick={() => openReadingUrl(item)} className="flex w-full gap-3 text-left active:scale-[0.99]">
                <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
                  {item.cover ? <img src={item.cover} alt={item.title} className="h-full w-full object-cover" /> : null}
                  <div className="absolute left-1 top-1 rounded-full bg-black/75 px-1.5 py-0.5 text-[10px] font-black text-white">#{index + 1}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-black text-zinc-950">{item.title}</p>
                  <p className="mt-1 text-xs font-bold text-purple-600">อ่านถึง {item.last_read_chapter || item.read_chapter || "-"}</p>
                  <p className="text-xs text-zinc-400">ล่าสุด {item.latest_chapter || "-"}</p>
                  <p className={`mt-2 text-[11px] font-bold ${usingLastReadUrl ? "text-emerald-600" : "text-amber-600"}`}>
                    {usingLastReadUrl ? "แตะเพื่อเปิดหน้าตอนที่อ่านค้างไว้" : "ยังไม่มี URL ตอนล่าสุด ใช้หน้าหลักของเรื่องแทน"}
                  </p>
                </div>
              </button>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={() => onOpen(item)} className="rounded-2xl bg-zinc-100 px-3 py-2 text-xs font-black text-zinc-700 active:scale-95">
                  รายละเอียด
                </button>
                <button onClick={() => openReadingUrl(item)} className="flex items-center justify-center gap-1 rounded-2xl bg-zinc-950 px-3 py-2 text-xs font-black text-white active:scale-95">
                  <ExternalLink size={14} /> อ่านต่อ
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


function ContinueReadingRow({ items, onOpen }: { items: MangaItem[]; onOpen: (item: MangaItem) => void }) {
  const list = items.filter((item) => item.read_chapter || chapterNumber(item.latest_chapter) > chapterNumber(item.read_chapter)).slice(0, 6);
  if (list.length === 0) return null;
  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-black text-zinc-950">อ่านต่อ</h2>
        <span className="text-sm font-bold text-zinc-400">{list.length} เรื่อง</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {list.map((item) => {
          const read = chapterNumber(item.read_chapter);
          const latest = Math.max(chapterNumber(item.latest_chapter), read);
          const percent = latest ? Math.min(100, Math.round((read / latest) * 100)) : 0;
          return (
            <button key={item.id} onClick={() => onOpen(item)} className="min-w-[230px] rounded-3xl bg-white p-3 text-left shadow-sm active:scale-[0.99]">
              <div className="flex gap-3">
                <div className="h-20 w-14 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
                  {item.cover ? <img src={item.cover} alt={item.title} className="h-full w-full object-cover" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-black">{item.title}</p>
                  <p className="mt-1 text-xs font-bold text-purple-600">ตอนที่ {item.read_chapter || "-"}</p>
                  <p className="text-xs text-zinc-400">ล่าสุด {item.latest_chapter || "-"}</p>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full rounded-full bg-purple-600" style={{ width: `${percent}%` }} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function NewChapterRow({ items, onOpen }: { items: MangaItem[]; onOpen: (item: MangaItem) => void }) {
  const list = items.filter((item) => chapterNumber(item.latest_chapter) > chapterNumber(item.read_chapter)).slice(0, 6);
  if (list.length === 0) return null;
  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-black text-zinc-950">ตอนใหม่มาแล้ว</h2>
        <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-black text-rose-600">{list.length}</span>
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {list.map((item) => (
          <button key={item.id} onClick={() => onOpen(item)} className="flex items-center gap-3 rounded-3xl bg-white p-3 text-left shadow-sm active:scale-[0.99]">
            <div className="h-16 w-12 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
              {item.cover ? <img src={item.cover} alt={item.title} className="h-full w-full object-cover" /> : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 font-black">{item.title}</p>
              <p className="text-sm font-bold text-rose-600">ใหม่ถึงตอน {item.latest_chapter}</p>
              <p className="text-xs text-zinc-400">อ่านถึง {item.read_chapter || "-"}</p>
            </div>
            <span className="rounded-full bg-rose-500 px-2 py-1 text-[10px] font-black text-white">NEW</span>
          </button>
        ))}
      </div>
    </section>
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
  stats: { total: number; updated: number; reading: number; finished: number; paused: number; favorites?: number };
  filter: "all" | "updated" | "favorites" | MangaStatus;
  setFilter: (filter: "all" | "updated" | "favorites" | MangaStatus) => void;
  tab: "collection" | "tier";
  setTab: (tab: "collection" | "tier") => void;
  onAdd: () => void;
  onLogout: () => void;
  isWideLandscape: boolean;
}) {
  const filters: Array<["all" | "updated" | "favorites" | MangaStatus, string]> = [
    ["all", "ทั้งหมด"],
    ["updated", "มีตอนใหม่"],
    ["favorites", "Favorite"],
    ["reading", "กำลังอ่าน"],
    ["waiting", "รอ"],
    ["finished", "จบแล้ว"],
    ["paused", "ดองไว้"],
  ];

  return (
    <aside className={`app-sidebar rounded-[2rem] bg-zinc-950 p-3.5 text-white shadow-sm ${isWideLandscape ? "sticky top-4 block h-[calc(100vh-2rem)] w-[200px] overflow-y-auto" : "hidden"} xl:sticky xl:top-6 xl:block xl:h-[calc(100vh-3rem)] xl:w-[220px] xl:overflow-y-auto`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1 text-xs font-semibold text-zinc-400">
            <Cloud size={14} />
            {user ? "Sync" : "Manga"}
          </p>
          <h1 className="mt-1 text-2xl font-black leading-tight">Library</h1>
        </div>
        <div className="flex gap-2 xl:hidden">
          {user && (
            <button onClick={onLogout} className="rounded-[1.1rem] bg-white/10 p-2.5 text-white">
              <LogOut size={20} />
            </button>
          )}
          <button onClick={onAdd} className="rounded-[1.1rem] bg-white p-2.5 text-zinc-950 shadow-sm">
            <Plus size={22} />
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-[1.4rem] bg-white/10 p-3">
        <p className="text-xs text-zinc-400">ทั้งหมด</p>
        <p className="text-3xl font-black">{stats.total}</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-1.5 rounded-[1.4rem] bg-white/10 p-1">
        <button onClick={() => user && setTab("collection")} disabled={!user} className={`flex items-center justify-center gap-2 rounded-[1.1rem] px-3 py-2 text-sm font-bold ${tab === "collection" ? "bg-white text-zinc-950" : "text-zinc-400"}`}>
          <BookOpen size={16} /> Collection
        </button>
        <button onClick={() => setTab("tier")} className={`flex items-center justify-center gap-2 rounded-[1.1rem] px-3 py-2 text-sm font-bold ${tab === "tier" ? "bg-white text-zinc-950" : "text-zinc-400"}`}>
          <Layers size={16} /> Tier
        </button>
      </div>

      {tab === "collection" && (
        <div className="mt-4 hidden space-y-1.5 md:block">
          <p className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">FILTER</p>
          {filters.map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} className={`w-full rounded-[1.1rem] px-3 py-2 text-left text-sm font-bold ${filter === key ? "bg-white text-zinc-950" : "bg-white/10 text-zinc-300"}`}>
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 hidden space-y-1.5 md:block">
        <button onClick={onAdd} className="flex w-full items-center justify-center gap-2 rounded-[1.1rem] bg-white px-3 py-2.5 text-sm font-bold text-zinc-950">
          <Plus size={18} /> เพิ่มมังงะ
        </button>
        {user && (
          <button onClick={onLogout} className="flex w-full items-center justify-center gap-2 rounded-[1.1rem] bg-white/10 px-3 py-2.5 text-sm font-bold text-white">
            <LogOut size={18} /> Logout
          </button>
        )}
      </div>
    </aside>
  );
}



type PassCache = {
  title: string;
  cover: string;
};

function MangaPassIntro({
  user,
  items,
  favoriteIds,
  loaded,
  onEnter,
}: {
  user: SupabaseUser | null;
  items: MangaItem[];
  favoriteIds: string[];
  loaded: boolean;
  onEnter: () => void;
}) {
  const [cachedPass, setCachedPass] = useState<PassCache | null>(null);
  const [displayPass, setDisplayPass] = useState<PassCache>({ title: "Manga Library", cover: "" });

  const username = user?.email?.split("@")[0] || "Guest";

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PASS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as PassCache;
        if (parsed?.cover) {
          setCachedPass(parsed);
          setDisplayPass(parsed);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!items.length) return;

    const favoriteItems = items.filter((item) => favoriteIds.includes(item.id) && item.cover);
    const candidates = favoriteItems.length ? favoriteItems : items.filter((item) => item.cover);
    if (!candidates.length) return;

    let nextIndex = 0;
    try {
      const savedIndex = Number(localStorage.getItem(PASS_INDEX_KEY) || "0");
      nextIndex = Number.isFinite(savedIndex) ? savedIndex % candidates.length : 0;
    } catch {}

    const selected = candidates[nextIndex] || candidates[0];
    const nextPass = { title: selected.title || "Manga Library", cover: selected.cover || "" };

    const img = new Image();
    img.onload = () => {
      setDisplayPass(nextPass);
      try {
        localStorage.setItem(PASS_STORAGE_KEY, JSON.stringify(nextPass));
        localStorage.setItem(PASS_INDEX_KEY, String((nextIndex + 1) % candidates.length));
      } catch {}
    };
    img.onerror = () => {
      if (!cachedPass && nextPass.cover) setDisplayPass(nextPass);
    };
    img.src = nextPass.cover;
  }, [items, favoriteIds, cachedPass]);

  const cover = displayPass.cover;
  const title = displayPass.title || "Manga Library";

  function tryEnter(offset: number) {
    if (!loaded) return;
    if (Math.abs(offset) > 80) onEnter();
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-zinc-950 p-4 text-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.45 }}
    >
      {cover && <motion.img key={`bg-${cover}`} src={cover} alt={title} className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-2xl" initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} />}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950/90 to-purple-950/40" />

      <motion.div
        className="relative w-full max-w-[430px] md:max-w-[900px]"
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55 }}
      >
        <div className="md:hidden">
          <div className="relative overflow-hidden rounded-[2.2rem] bg-white text-zinc-950 shadow-2xl">
            <div className="relative h-[62vh] min-h-[500px] overflow-hidden">
              {cover ? (
                <motion.img key={`portrait-${cover}`} src={cover} alt={title} className="absolute inset-0 h-full w-full object-cover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }} />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-zinc-900 to-zinc-950" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
              <div className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-2 text-xs font-black text-zinc-950">MANGA PASS</div>
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-sm font-bold text-white/70">ADMIT ONE</p>
                <h1 className="mt-1 line-clamp-2 text-4xl font-black leading-none">{title}</h1>
                <p className="mt-2 text-sm font-semibold text-white/80">for {username}</p>
              </div>
            </div>

            <div className="bg-white px-5 py-5">
              <div className="mb-3 flex items-center justify-between text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
                <span>Collection</span>
                <span>{loaded ? "Ready" : "Loading"}</span>
              </div>
              <div className="relative flex items-center gap-3">
                <div className={`h-px flex-1 border-t-2 border-dashed ${loaded ? "border-purple-500" : "border-zinc-300"}`} />
                <motion.button
                  drag="x"
                  dragConstraints={{ left: -135, right: 135 }}
                  onDragEnd={(_, info) => tryEnter(info.offset.x)}
                  onClick={() => loaded && onEnter()}
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-lg ${loaded ? "bg-purple-600 shadow-purple-600/30" : "bg-zinc-400"}`}
                  whileTap={{ scale: 0.92 }}
                >
                  <Scissors size={22} />
                </motion.button>
                <div className={`h-px flex-1 border-t-2 border-dashed ${loaded ? "border-purple-500" : "border-zinc-300"}`} />
              </div>
              <p className="mt-4 text-center text-sm font-bold text-zinc-500">{loaded ? "ลากตรงเส้นปะ หรือแตะกรรไกรเพื่อเข้าสู่คลัง" : "กำลังโหลดข้อมูลข้างใน..."}</p>
            </div>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white text-zinc-950 shadow-2xl">
            <div className="grid min-h-[430px] grid-cols-[1fr_180px]">
              <div className="relative overflow-hidden">
                {cover ? (
                  <motion.img key={`landscape-${cover}`} src={cover} alt={title} className="absolute inset-0 h-full w-full object-cover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }} />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-zinc-900 to-zinc-950" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />
                <div className="relative z-10 flex h-full flex-col justify-between p-8 text-white">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.35em] text-purple-300">Manga Pass</p>
                    <h1 className="mt-4 max-w-xl text-6xl font-black leading-none">{title}</h1>
                    <p className="mt-4 text-lg font-semibold text-white/75">Collection access for {username}</p>
                  </div>
                  <div className="max-w-md">
                    <div className="mb-3 flex items-center justify-between text-xs font-black uppercase tracking-[0.25em] text-white/55">
                      <span>Tear here</span>
                      <span>{loaded ? "Ready" : "Loading"}</span>
                    </div>
                    <div className="relative flex items-center gap-3">
                      <div className={`h-px flex-1 border-t-2 border-dashed ${loaded ? "border-purple-400" : "border-white/30"}`} />
                      <motion.button
                        drag="x"
                        dragConstraints={{ left: -160, right: 160 }}
                        onDragEnd={(_, info) => tryEnter(info.offset.x)}
                        onClick={() => loaded && onEnter()}
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-lg ${loaded ? "bg-purple-600 shadow-purple-600/30" : "bg-white/20"}`}
                        whileTap={{ scale: 0.92 }}
                      >
                        <Scissors size={22} />
                      </motion.button>
                      <div className={`h-px flex-1 border-t-2 border-dashed ${loaded ? "border-purple-400" : "border-white/30"}`} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative flex flex-col items-center justify-between border-l-2 border-dashed border-zinc-300 bg-zinc-50 p-6">
                <div className="text-center">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Admit</p>
                  <p className="mt-2 text-4xl font-black [writing-mode:vertical-rl]">ONE</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  {[1,2,3,4].map((dot) => <div key={dot} className="h-3 w-3 rounded-full bg-zinc-300" />)}
                </div>
                <p className="rotate-90 whitespace-nowrap text-xs font-black tracking-[0.25em] text-zinc-400">MANGA TRACKER</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}


export default function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [items, setItems] = useState<MangaItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [heroIndex, setHeroIndex] = useState(0);
  const [showMangaPass, setShowMangaPass] = useState(true);
  const [historyIds, setHistoryIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<"all" | "updated" | "favorites" | MangaStatus>("all");
  const [tab, setTab] = useState<"collection" | "tier">("tier");
  const [form, setForm] = useState<Omit<MangaItem, "id" | "user_id">>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MangaItem | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [sourceAddOpen, setSourceAddOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isWideLandscape, setIsWideLandscape] = useState(false);
  const [readingSources, setReadingSources] = useState(defaultReadingSources);

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
    try {
      const saved = localStorage.getItem(SOURCES_STORAGE_KEY);
      if (saved) setReadingSources(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify(readingSources));
  }, [readingSources]);

  function addReadingSource(source: { name: string; short: string; url: string }) {
    setReadingSources((prev) => {
      if (prev.some((item) => item.url === source.url)) {
        return prev.map((item) => (item.url === source.url ? source : item));
      }
      return [...prev, source];
    });
  }

  function deleteReadingSource(url: string) {
    setReadingSources((prev) => prev.filter((item) => item.url !== url));
  }

  useEffect(() => {
    async function loadCloud() {
      if (!supabase) return;
      setSyncing(true);
      const { data, error } = await supabase.from("manga_items").select("*").order("created_at", { ascending: false });
      if (!error && data) setItems((data as MangaItem[]).filter(Boolean));
      setSyncing(false);
    }
    loadCloud();
  }, [user]);


  useEffect(() => {
    async function loadFavorites() {
      if (!supabase || !user) {
        setFavoriteIds([]);
        return;
      }
      const { data, error } = await supabase.from("user_favorites").select("manga_id");
      if (!error && data) setFavoriteIds(data.map((row: any) => row.manga_id));
    }
    loadFavorites();
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
        if (!item) return false;
        const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase());
        const hasUpdate = chapterNumber(item.latest_chapter) > chapterNumber(item.read_chapter);
        const matchesFilter = filter === "all" || (filter === "updated" && hasUpdate) || (filter === "favorites" && favoriteIds.includes(item.id)) || item.status === filter;
        return matchesQuery && matchesFilter;
      }),
    [items, query, filter, favoriteIds]
  );

  const stats = useMemo(
    () => ({
      total: items.length,
      updated: items.filter((item) => chapterNumber(item.latest_chapter) > chapterNumber(item.read_chapter)).length,
      reading: items.filter((item) => item && item.status === "reading").length,
      finished: items.filter((item) => item && item.status === "finished").length,
      paused: items.filter((item) => item && item.status === "paused").length,
      favorites: favoriteIds.length,
    }),
    [items, favoriteIds]
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpenForm(true);
  };

  const openEdit = (item: MangaItem) => {
    if (!(ADMIN_EMAILS.includes(user?.email?.toLowerCase() ?? "") || item.user_id === user?.id)) return alert("บัญชีนี้ไม่มีสิทธิ์แก้ไขเรื่องนี้");
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
        const next = { ...form, last_read_at: form.last_read_url ? new Date().toISOString() : form.last_read_at };
        const { error } = await supabase.from("manga_items").update(next).eq("id", editingId);
        if (error) return alert(error.message);
        setItems((prev) => prev.map((item) => (item.id === editingId ? { ...item, ...next } : item)));
      } else {
        const next = { ...form, last_read_at: form.last_read_url ? new Date().toISOString() : form.last_read_at, user_id: user.id };
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
    const target = items.find((item) => item.id === id) || null;
    if (!(ADMIN_EMAILS.includes(user?.email?.toLowerCase() ?? "") || target?.user_id === user?.id)) return alert("บัญชีนี้ไม่มีสิทธิ์ลบเรื่องนี้");
    if (!confirm("ลบเรื่องนี้ใช่ไหม?")) return;
    if (supabase && user) {
      const { error } = await supabase.from("manga_items").delete().eq("id", id);
      if (error) return alert(error.message);
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItem(null);
  }

  async function changeTier(id: string, tier: MangaTier) {
    const target = items.find((item) => item.id === id) || null;
    if (!(ADMIN_EMAILS.includes(user?.email?.toLowerCase() ?? "") || target?.user_id === user?.id)) return alert("บัญชีนี้ไม่มีสิทธิ์เปลี่ยน Tier เรื่องนี้");
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, tier } : item)));
    if (supabase && user) await supabase.from("manga_items").update({ tier }).eq("id", id);
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
      setFavoriteIds((prev) => prev.filter((id) => id !== item.id));
    } else {
      const { error } = await supabase.from("user_favorites").insert({ user_id: user.id, manga_id: item.id });
      if (error) return alert(error.message);
      setFavoriteIds((prev) => [...prev, item.id]);
    }
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

  const filters: Array<["all" | "updated" | "favorites" | MangaStatus, string]> = [
    ["all", "ทั้งหมด"],
    ["updated", "มีตอนใหม่"],
    ["favorites", "Favorite"],
    ["reading", "กำลังอ่าน"],
    ["waiting", "รอ"],
    ["finished", "จบแล้ว"],
    ["paused", "ดองไว้"],
  ];


  function submitNewReadingSource() {
    const cleanName = newSourceName.trim();
    let cleanUrl = newSourceUrl.trim();
    if (!cleanName || !cleanUrl) return;
    if (!/^https?:\/\//i.test(cleanUrl)) cleanUrl = `https://${cleanUrl}`;
    const short = cleanName.replace(/[^a-z0-9]/gi, "").slice(0, 5).toUpperCase() || "WEB";
    addReadingSource({ name: cleanName, short, url: cleanUrl });
    setNewSourceName("");
    setNewSourceUrl("");
    setSourceAddOpen(false);
  }


  useEffect(() => {
    try {
      const key = `${HISTORY_STORAGE_KEY}:${user?.id || "guest"}`;
      const saved = localStorage.getItem(key);
      if (saved) setHistoryIds(JSON.parse(saved));
      else setHistoryIds([]);
    } catch {
      setHistoryIds([]);
    }
  }, [user?.id]);

  function rememberHistory(item: MangaItem) {
    if (!item?.id) return;
    setHistoryIds((prev) => {
      const next = [item.id, ...prev.filter((id) => id !== item.id)].slice(0, 20);
      try {
        const key = `${HISTORY_STORAGE_KEY}:${user?.id || "guest"}`;
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function openDetail(item: MangaItem) {
    setSelectedItem(item);
  }

  function buildChapterUrl(item: MangaItem) {
    const directUrl = (item.last_read_url || "").trim();
    if (directUrl) return directUrl;

    const baseUrl = (item.source_url || "").trim().replace(/\/$/, "");
    if (!baseUrl) return "";

    const chapter = (item.last_read_chapter || item.read_chapter || "").trim();
    if (!chapter) return baseUrl;

    if (/\/chapter[-/]/i.test(baseUrl)) return baseUrl;

    const cleanChapter = chapter.replace(/^chapter[-\s]*/i, "");
    return `${baseUrl}/chapter-${cleanChapter}`;
  }

  function openReading(item: MangaItem) {
    const url = buildChapterUrl(item) || item.source_url || "";
    rememberHistory(item);

    const updatePayload = {
      last_read_url: url || item.last_read_url || item.source_url || "",
      last_read_chapter: item.last_read_chapter || item.read_chapter || "",
      last_read_at: new Date().toISOString(),
    };

    setItems((prev) => prev.map((manga) => (manga.id === item.id ? { ...manga, ...updatePayload } : manga)));

    if (supabase && user && item.id) {
      supabase.from("manga_items").update(updatePayload).eq("id", item.id).then(({ error }) => {
        if (error) console.warn("save reading history failed", error.message);
      });
    }

    if (url) window.open(url, "_blank", "noopener,noreferrer");
    else setSelectedItem(item);
  }


  const isAdmin = ADMIN_EMAILS.includes(user?.email?.toLowerCase() ?? "");
  const canManageItem = (item: MangaItem | null) => Boolean(item && (isAdmin || item.user_id === user?.id));
  const passLoaded = loaded && (!supabase || !syncing);

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950 xl:p-6">
      <div className={`app-shell mx-auto grid gap-4 ${isWideLandscape ? "max-w-7xl px-0 pb-4 pt-0" : "max-w-md px-4 pb-28 pt-3 sm:max-w-xl md:max-w-3xl"} xl:max-w-7xl xl:px-0 xl:pt-0`}>

        <section className="min-w-0">
          {user && (
            <div className="mb-3 flex items-center justify-between gap-2 md:mb-4">
              <button onClick={() => setMenuOpen(true)} className="flex items-center gap-2 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-bold text-white shadow-sm">
                <Menu size={18} /> เมนู
              </button>
              <p className="text-sm font-bold text-zinc-400">{isAdmin ? "Admin" : "User"} · ทั้งหมด {stats.total} เรื่อง</p>
            </div>
          )}
          {!user && (
            <div className="mb-4">
              <AuthBox />
            </div>
          )}

          {user && (
            <div className="mb-4 hidden md:block">
              <SourceIconBar isGuest={!user} sources={readingSources} onAddSource={addReadingSource} onDeleteSource={deleteReadingSource} />
            </div>
          )}

          {syncing && <p className="mb-3 rounded-2xl bg-white p-3 text-center text-sm text-zinc-500">กำลัง sync ข้อมูล...</p>}

          <div className={`app-sticky-bar sticky z-20 bg-zinc-100/90 px-4 py-3 backdrop-blur ${tab === "collection" && !isWideLandscape ? "hidden md:block" : ""} ${isWideLandscape ? "top-4 mx-0 rounded-[2rem] bg-white px-3 shadow-sm" : "top-0 -mx-4"} xl:top-6 xl:mx-0 xl:rounded-[2rem] xl:bg-white xl:px-3 xl:shadow-sm`}>
            <div className="hidden rounded-3xl bg-white p-1 shadow-sm">
              <button onClick={() => user && setTab("collection")} disabled={!user} className={`flex flex-1 items-center justify-center gap-2 rounded-[1.1rem] px-3 py-2 text-sm font-bold ${tab === "collection" ? "bg-zinc-950 text-white" : "text-zinc-500"}`}>
                <BookOpen size={16} /> Collection
              </button>
              <button onClick={() => setTab("tier")} className={`flex flex-1 items-center justify-center gap-2 rounded-[1.1rem] px-3 py-2 text-sm font-bold ${tab === "tier" ? "bg-zinc-950 text-white" : "text-zinc-500"}`}>
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
              <HeroCarousel
                items={filtered.length ? filtered : items}
                activeIndex={heroIndex}
                setActiveIndex={setHeroIndex}
                onOpen={openDetail}
                favoriteIds={favoriteIds}
                onToggleFavorite={toggleFavorite}
                    onRead={openReading}
                user={user}
              />
              <ReadingHistoryRow items={items} historyIds={historyIds} onOpen={openDetail} onRead={openReading} />
              <div className="hidden md:block"><NewChapterRow items={items} onOpen={openDetail} /></div>
              <div className="mb-4 mt-4 flex gap-2 overflow-x-auto pb-1 xl:hidden">
                {filters.map(([key, label]) => (
                  <button key={key} onClick={() => setFilter(key)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${filter === key ? "bg-zinc-950 text-white" : "bg-white text-zinc-500"}`}>
                    {label}
                  </button>
                ))}
              </div>

              <div className="mb-3 mt-2 flex items-center justify-between"><h2 className="text-2xl font-black text-zinc-950">All Collections <span className="text-zinc-400">({filtered.length})</span></h2></div>
              <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-7 xl:grid-cols-6 2xl:grid-cols-7">
                <AnimatePresence>
                  {filtered.map((item) => (
                    <MangaTile key={item.id} item={item} onOpen={openDetail} isFavorite={favoriteIds.includes(item.id)} />
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
                        <MangaTile key={item.id} item={item} onOpen={openDetail} small isFavorite={favoriteIds.includes(item.id)} />
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
          <>
            <button onClick={openAdd} className="flex flex-1 flex-col items-center justify-center rounded-3xl bg-white px-2 py-2 text-[11px] font-black text-zinc-950">
              <Plus size={20} />
              เพิ่ม
            </button>
            <button onClick={logout} className="flex flex-1 flex-col items-center justify-center rounded-3xl px-2 py-2 text-[11px] font-bold text-zinc-400">
              <LogOut size={18} />
              Logout
            </button>
          </>
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

              {user && (
                <div className="mt-4 rounded-3xl bg-zinc-50 p-3">
                  <button
                    onClick={() => setSourceAddOpen(!sourceAddOpen)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-bold text-white"
                  >
                    <Plus size={16} /> เพิ่มเว็บอ่าน
                  </button>

                  {sourceAddOpen && (
                    <div className="mt-3 space-y-2">
                      <input
                        value={newSourceName}
                        onChange={(e) => setNewSourceName(e.target.value)}
                        placeholder="ชื่อเว็บ เช่น Manga ABC"
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-950"
                      />
                      <input
                        value={newSourceUrl}
                        onChange={(e) => setNewSourceUrl(e.target.value)}
                        placeholder="URL เช่น https://example.com"
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-950"
                      />
                      <button
                        onClick={submitNewReadingSource}
                        className="w-full rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white"
                      >
                        บันทึกเว็บ
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[70] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          >
            <motion.aside
              className="h-full w-[min(86vw,340px)] overflow-y-auto rounded-r-[2rem] bg-zinc-950 p-4 text-white shadow-2xl"
              initial={{ x: -360 }}
              animate={{ x: 0 }}
              exit={{ x: -360 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1 text-xs font-semibold text-zinc-400">
                    <Cloud size={14} /> {user ? "Sync" : "Manga"}
                  </p>
                  <h2 className="mt-1 text-3xl font-black leading-tight">Library</h2>
                  {user && <p className="mt-1 text-xs font-semibold text-zinc-400">บัญชี: {user.email}</p>}
                </div>
                <button onClick={() => setMenuOpen(false)} className="rounded-2xl bg-white/10 p-3 text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="rounded-[1.5rem] bg-white/10 p-4">
                <p className="text-xs text-zinc-400">ทั้งหมด</p>
                <p className="text-4xl font-black">{stats.total}</p>
                {user && <p className="mt-1 text-xs font-semibold text-zinc-400">Favorite {stats.favorites || 0}</p>}
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-[1.4rem] bg-white/10 px-4 py-3">
                <Search size={18} className="text-zinc-400" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setTab("collection");
                  }}
                  placeholder="ค้นหามังงะ..."
                  className="w-full bg-transparent text-sm font-semibold text-white placeholder:text-zinc-500 outline-none"
                />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 rounded-[1.5rem] bg-white/10 p-1">
                <button onClick={() => { setTab("collection"); setMenuOpen(false); }} className={`flex items-center justify-center gap-2 rounded-[1.2rem] px-3 py-3 text-sm font-bold ${tab === "collection" ? "bg-white text-zinc-950" : "text-zinc-400"}`}>
                  <BookOpen size={16} /> Collection
                </button>
                <button onClick={() => { setTab("tier"); setMenuOpen(false); }} className={`flex items-center justify-center gap-2 rounded-[1.2rem] px-3 py-3 text-sm font-bold ${tab === "tier" ? "bg-white text-zinc-950" : "text-zinc-400"}`}>
                  <Layers size={16} /> Tier
                </button>
              </div>

              {tab === "collection" && (
                <div className="mt-5 space-y-2">
                  <p className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">FILTER</p>
                  {filters.map(([key, label]) => (
                    <button key={key} onClick={() => { setFilter(key); setMenuOpen(false); }} className={`w-full rounded-[1.2rem] px-4 py-3 text-left text-sm font-bold ${filter === key ? "bg-white text-zinc-950" : "bg-white/10 text-zinc-300"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-5 space-y-2">
                {user && (
                  <button onClick={() => { openAdd(); setMenuOpen(false); }} className="flex w-full items-center justify-center gap-2 rounded-[1.2rem] bg-white px-4 py-3 font-bold text-zinc-950">
                    <Plus size={18} /> เพิ่มมังงะ
                  </button>
                )}
                {user && (
                  <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-[1.2rem] bg-white/10 px-4 py-3 font-bold text-white">
                    <LogOut size={18} /> Logout
                  </button>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}

        {showMangaPass && (
          <MangaPassIntro
            user={user}
            items={items}
            favoriteIds={favoriteIds}
            loaded={passLoaded}
            onEnter={() => setShowMangaPass(false)}
          />
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
            isFavorite={selectedItem ? favoriteIds.includes(selectedItem.id) : false}
            onToggleFavorite={toggleFavorite}
            canManage={canManageItem(selectedItem)}
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
