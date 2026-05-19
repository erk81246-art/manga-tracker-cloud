"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
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

type UserFavorite = {
  user_id: string;
  manga_id: string;
  created_at?: string;
};

const STORAGE_KEY = "manga-tracker-items-v2";
const SOURCES_STORAGE_KEY = "manga-tracker-reading-sources-v1";

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

export default function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [items, setItems] = useState<MangaItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "updated" | "favorites" | MangaStatus>("all");
  const [tab, setTab] = useState<"collection" | "tier">("tier");
  const [form, setForm] = useState<Omit<MangaItem, "id" | "user_id">>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MangaItem | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
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
      if (!error && data) setItems(data as MangaItem[]);
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
      reading: items.filter((item) => item.status === "reading").length,
      finished: items.filter((item) => item.status === "finished").length,
      paused: items.filter((item) => item.status === "paused").length,
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

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950 xl:p-6">
      <div className={`app-shell mx-auto grid max-w-md gap-4 px-4 pb-28 pt-3 sm:max-w-xl md:max-w-3xl ${isWideLandscape ? "max-w-7xl px-0 pb-4 pt-0" : ""} xl:max-w-7xl xl:px-0 xl:pt-0`}>
        

        <section className="min-w-0">
          {!user && (
            <div className="mb-4">
              <AuthBox />
            </div>
          )}

          {user && (
            <>
              <div className="mb-3 flex items-center justify-between gap-2 md:mb-4">
                <button onClick={() => setMenuOpen(true)} className="flex items-center gap-2 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-bold text-white shadow-sm">
                  <Menu size={18} /> เมนู
                </button>
                <p className="text-sm font-bold text-zinc-400">ทั้งหมด {stats.total} เรื่อง</p>
              </div>
              <div className={`desktop-topbar mb-4 gap-3 ${isWideLandscape ? "grid grid-cols-[1fr_220px]" : "hidden"} xl:grid xl:grid-cols-[1fr_240px]`}>
              <Card className="p-5">
                <p className="text-sm font-bold text-zinc-400">Good evening,</p>
                <h2 className="mt-1 text-2xl font-black text-zinc-950">{user.email?.split("@")[0] || "Reader"}</h2>
                <p className="mt-1 text-sm text-zinc-500">ค้นหา จัดการ และเช็กตอนใหม่จากที่นี่</p>
              </Card>
              <SourceIconBar isGuest={!user} sources={readingSources} onAddSource={addReadingSource} onDeleteSource={deleteReadingSource} />
              </div>
            </>
          )}

          {syncing && <p className="mb-3 rounded-2xl bg-white p-3 text-center text-sm text-zinc-500">กำลัง sync ข้อมูล...</p>}

          <div className={`app-sticky-bar sticky z-20 bg-zinc-100/90 px-4 py-3 backdrop-blur ${isWideLandscape ? "top-4 mx-0 rounded-[2rem] bg-white px-3 shadow-sm" : "top-0 -mx-4"} xl:top-6 xl:mx-0 xl:rounded-[2rem] xl:bg-white xl:px-3 xl:shadow-sm`}>
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
              <div className="mb-4 mt-4 flex gap-2 overflow-x-auto pb-1 xl:hidden">
                {filters.map(([key, label]) => (
                  <button key={key} onClick={() => setFilter(key)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${filter === key ? "bg-zinc-950 text-white" : "bg-white text-zinc-500"}`}>
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-7 xl:grid-cols-6 2xl:grid-cols-7">
                <AnimatePresence>
                  {filtered.map((item) => (
                    <MangaTile key={item.id} item={item} onOpen={setSelectedItem} isFavorite={favoriteIds.includes(item.id)} />
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
                        <MangaTile key={item.id} item={item} onOpen={setSelectedItem} small isFavorite={favoriteIds.includes(item.id)} />
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
            isFavorite={selectedItem ? favoriteIds.includes(selectedItem.id) : false}
            onToggleFavorite={toggleFavorite}
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
