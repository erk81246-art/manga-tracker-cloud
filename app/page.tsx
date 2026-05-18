"use client";

import React,{useEffect,useMemo,useState}from"react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import{Bell,BookOpen,Cloud,ExternalLink,Image as ImageIcon,Layers,LogOut,Pencil,Plus,RefreshCw,Save,Search,Star,Trash2,Upload,User,X}from"lucide-react";
import{supabase,isSupabaseReady}from"@/lib/supabase";
import type{User as SupabaseUser}from"@supabase/supabase-js";

type MangaStatus="reading"|"waiting"|"finished"|"paused";
type MangaTier="S"|"A"|"B"|"C"|"D";
type MangaItem={id:string;title:string;cover:string;source_url:string;read_chapter:string;latest_chapter:string;status:MangaStatus;tier:MangaTier;note:string;user_id?:string};
const STORAGE_KEY="manga-tracker-items-v2";
const emptyForm:Omit<MangaItem,"id"|"user_id">={title:"",cover:"",source_url:"",read_chapter:"",latest_chapter:"",status:"reading",tier:"A",note:""};
const statusMap:Record<MangaStatus,{label:string;badge:string}>={reading:{label:"กำลังอ่าน",badge:"bg-blue-100 text-blue-700"},waiting:{label:"รอตอนใหม่",badge:"bg-amber-100 text-amber-700"},finished:{label:"อ่านจบ",badge:"bg-emerald-100 text-emerald-700"},paused:{label:"ดองไว้",badge:"bg-zinc-100 text-zinc-700"}};
const tiers:MangaTier[]=["S","A","B","C","D"];
function chapterNumber(v:string){const n=Number(String(v).replace(/[^0-9.]/g,""));return Number.isFinite(n)?n:0}
function makeId(){return typeof crypto!=="undefined"&&"randomUUID"in crypto?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`}
function Card({children,className=""}:{children:React.ReactNode;className?:string}){return <div className={`rounded-3xl bg-white shadow-sm ${className}`}>{children}</div>}

function AuthBox(){
 const[email,setEmail]=useState("");const[password,setPassword]=useState("");const[mode,setMode]=useState<"login"|"signup">("login");const[message,setMessage]=useState("");const[busy,setBusy]=useState(false);
 async function handleSubmit(){if(!supabase)return;setBusy(true);setMessage("");const{error}=mode==="login"?await supabase.auth.signInWithPassword({email,password}):await supabase.auth.signUp({email,password});if(error)setMessage(error.message);else setMessage(mode==="signup"?"สมัครแล้ว ถ้าระบบขอยืนยันอีเมล ให้ไปกดลิงก์ในอีเมลก่อน":"เข้าสู่ระบบแล้ว");setBusy(false)}
 async function googleLogin(){if(!supabase)return;await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:window.location.origin}})}
 if(!isSupabaseReady)return <Card className="p-5"><h2 className="text-xl font-black">ยังไม่ได้เชื่อม Supabase</h2><p className="mt-2 text-sm text-zinc-500">แอพยังใช้ได้แบบเก็บในเครื่อง แต่ Cloud Sync / Login / Upload รูป ต้องใส่ Environment Variables ใน Vercel ก่อน</p></Card>;
 return <Card className="p-5"><div className="mb-4 flex items-center gap-3"><div className="rounded-2xl bg-zinc-950 p-3 text-white"><User size={20}/></div><div><h2 className="text-xl font-black">{mode==="login"?"เข้าสู่ระบบ":"สมัครสมาชิก"}</h2><p className="text-sm text-zinc-500">ข้อมูลจะ sync ข้ามเครื่องหลัง login</p></div></div><div className="space-y-3"><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="อีเมล" className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-zinc-950"/><input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="รหัสผ่าน อย่างน้อย 6 ตัว" className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-zinc-950"/><button onClick={handleSubmit} disabled={busy} className="w-full rounded-2xl bg-zinc-950 px-4 py-3 font-bold text-white disabled:opacity-50">{busy?"กำลังทำงาน...":mode==="login"?"Login":"Sign up"}</button><button onClick={googleLogin} className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 font-bold text-zinc-800">Login ด้วย Google</button><button onClick={()=>setMode(mode==="login"?"signup":"login")} className="w-full text-sm font-semibold text-zinc-500">{mode==="login"?"ยังไม่มีบัญชี? สมัครสมาชิก":"มีบัญชีแล้ว? เข้าสู่ระบบ"}</button>{message&&<p className="rounded-2xl bg-zinc-100 p-3 text-sm text-zinc-600">{message}</p>}</div></Card>
}

function MangaTile({item,onOpen,small=false,isGuest=false}:{item:MangaItem;onOpen:(item:MangaItem)=>void;small?:boolean;isGuest?:boolean}){
 const hasUpdate=!isGuest&&chapterNumber(item.latest_chapter)>chapterNumber(item.read_chapter);
 return <motion.button layout onClick={()=>onOpen(item)} className="min-w-0 text-left" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}><div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-100">{item.cover?<img src={item.cover} alt={item.title} className="h-full w-full object-cover"/>:<div className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-300"><ImageIcon size={small?20:28}/></div>}<span className="absolute left-1.5 top-1.5 rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-black text-white">{item.tier}</span>{hasUpdate&&<span className="absolute right-1.5 top-1.5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-black text-white">NEW</span>}</div><p className={`${small?"text-[11px]":"text-xs"} mt-1.5 line-clamp-2 font-bold leading-tight text-zinc-800`}>{item.title||"ไม่มีชื่อเรื่อง"}</p></motion.button>
}

function DetailModal({
  item,
  onClose,
  onEdit,
  onDelete,
  onTierChange,
  onCheckLatest,
  isGuest,
  locked = false,
}: {
  item: MangaItem;
  onClose: () => void;
  onEdit: (item: MangaItem) => void;
  onDelete: (id: string) => void | Promise<void>;
  onTierChange: (id: string, tier: MangaTier) => void | Promise<void>;
  onCheckLatest?: (item: MangaItem) => void | Promise<void>;
  isGuest?: boolean;
  locked?: boolean;
}) {
  locked = locked || Boolean(isGuest);
  const hasUpdate = chapterNumber(item.latest_chapter) > chapterNumber(item.read_chapter);
  const newCount = Math.max(0, chapterNumber(item.latest_chapter) - chapterNumber(item.read_chapter));
  const dragY = useMotionValue(0);
  const sheetOpacity = useTransform(dragY, [0, 260], [1, 0.35]);

  const safeEdit = () => {
    if (locked) return;
    onEdit(item);
  };

  const safeDelete = () => {
    if (locked) return;
    onDelete(item.id);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end bg-black/50 p-0 md:items-center md:justify-center md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        style={{ opacity: sheetOpacity, y: dragY }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.28 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120 || info.velocity.y > 700) onClose();
        }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full overflow-hidden rounded-t-[2rem] bg-white shadow-2xl md:max-h-[90vh] md:max-w-3xl md:rounded-[2rem] lg:max-w-4xl"
        initial={{ y: 80, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 80, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      >
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-zinc-300 md:hidden" />

        <div className="relative">
          <div className="absolute inset-0 h-56 overflow-hidden">
            {item.cover && (
              <img src={item.cover} alt="" className="h-full w-full scale-110 object-cover blur-2xl opacity-35" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-white/80 to-white" />
          </div>

          <div className="relative max-h-[86vh] overflow-y-auto p-4 pt-4 md:max-h-[88vh] md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Manga Detail</p>
                {locked && <p className="mt-1 text-xs font-semibold text-zinc-500">Guest preview mode</p>}
              </div>
              <button onClick={onClose} className="rounded-full bg-white/80 p-2 text-zinc-700 shadow-sm backdrop-blur">
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-[180px_1fr]">
              <div className="mx-auto w-40 md:mx-0 md:w-full">
                <div className="aspect-[3/4] overflow-hidden rounded-[1.8rem] bg-zinc-100 shadow-xl ring-1 ring-black/5">
                  {item.cover ? (
                    <img src={item.cover} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-300"><ImageIcon size={36} /></div>
                  )}
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-3xl font-black leading-tight text-zinc-950 md:text-4xl">{item.title || "ไม่มีชื่อเรื่อง"}</h1>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-black text-white">Tier {item.tier}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusMap[item.status].badge}`}>
                        {statusMap[item.status].label}
                      </span>
                      {hasUpdate && !locked && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                          <Bell size={12} /> มีตอนใหม่ {newCount ? `+${newCount}` : ""}
                        </span>
                      )}
                      {locked && (
                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-500">Login เพื่อดูตอนและลิงก์อ่าน</span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="mt-4 rounded-3xl bg-white/75 p-4 text-sm leading-relaxed text-zinc-600 shadow-sm ring-1 ring-zinc-100">
                  {item.note || "ยังไม่มีโน้ต"}
                </p>

                {!locked && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-3xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
                      <p className="text-xs font-semibold text-zinc-400">อ่านถึง</p>
                      <p className="mt-1 text-2xl font-black text-zinc-950">ตอน {item.read_chapter || "-"}</p>
                    </div>
                    <div className="rounded-3xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
                      <p className="text-xs font-semibold text-zinc-400">ล่าสุด</p>
                      <p className="mt-1 text-2xl font-black text-zinc-950">ตอน {item.latest_chapter || "-"}</p>
                    </div>
                  </div>
                )}

                {!locked && (
                  <div className="mt-4 rounded-3xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
                    <p className="mb-3 text-sm font-black text-zinc-700">จัด Tier</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {tiers.map((tier) => (
                        <button
                          key={tier}
                          onClick={() => onTierChange(item.id, tier)}
                          className={`h-11 min-w-11 rounded-2xl text-sm font-black transition ${item.tier === tier ? "bg-zinc-950 text-white shadow-md" : "bg-white text-zinc-500"}`}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2 md:flex">
                  {onCheckLatest && !locked && (
                    <button
                      onClick={() => onCheckLatest(item)}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-amber-100 px-4 py-3 text-sm font-bold text-amber-800"
                    >
                      <Bell size={16} /> เช็กตอนล่าสุด
                    </button>
                  )}
                  {item.source_url && !locked && (
                    <a href={item.source_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-zinc-100 px-4 py-3 text-sm font-bold text-zinc-700">
                      <ExternalLink size={16} /> เปิดเว็บ
                    </a>
                  )}
                  <button
                    onClick={safeEdit}
                    disabled={locked}
                    className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold ${locked ? "bg-zinc-100 text-zinc-400" : "bg-zinc-950 text-white"}`}
                  >
                    <Pencil size={16} /> แก้ไข
                  </button>
                  <button
                    onClick={safeDelete}
                    disabled={locked}
                    className={`rounded-2xl border px-4 py-3 ${locked ? "border-zinc-100 text-zinc-300" : "border-zinc-200 text-rose-600"}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {locked && (
                  <div className="mt-4 rounded-3xl bg-zinc-950 p-4 text-white">
                    <p className="font-black">เข้าสู่ระบบเพื่อใช้งานเต็ม</p>
                    <p className="mt-1 text-sm text-zinc-300">ดูตอนล่าสุด เปิดเว็บอ่าน เช็กตอนใหม่ และแก้ไขข้อมูลได้หลัง Login</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MangaForm({value,onChange,onSave,onClose,editing,user}:{value:Omit<MangaItem,"id"|"user_id">;onChange:(next:Omit<MangaItem,"id"|"user_id">)=>void;onSave:()=>void;onClose:()=>void;editing:boolean;user:SupabaseUser|null}){
 const[uploading,setUploading]=useState(false);const set=(key:keyof Omit<MangaItem,"id"|"user_id">,next:string)=>onChange({...value,[key]:next});
 async function uploadCover(file:File|null){if(!file)return;if(!supabase||!user){alert("ต้อง Login และตั้งค่า Supabase ก่อน ถึงจะอัปโหลดรูปได้");return}setUploading(true);const ext=file.name.split(".").pop()||"jpg";const path=`${user.id}/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;const{error}=await supabase.storage.from("manga-covers").upload(path,file,{cacheControl:"3600",upsert:false});if(error)alert(error.message);else{const{data}=supabase.storage.from("manga-covers").getPublicUrl(path);set("cover",data.publicUrl)}setUploading(false)}
 return <motion.div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center bg-black/40 p-3 md:p-6" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><motion.div className="max-h-[92vh] w-full md:max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-4 md:p-6 shadow-xl" initial={{y:40}} animate={{y:0}} exit={{y:40}}><div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-black text-zinc-950">{editing?"แก้ไขมังงะ":"เพิ่มมังงะ"}</h2><p className="text-sm text-zinc-500">เพิ่มรูปจากมือถือได้</p></div><button onClick={onClose} className="rounded-full bg-zinc-100 p-2 text-zinc-600"><X size={20}/></button></div><div className="space-y-3"><label className="block"><span className="text-sm font-bold text-zinc-700">ชื่อเรื่อง</span><input value={value.title} onChange={e=>set("title",e.target.value)} placeholder="เช่น One Piece" className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-zinc-950"/></label><label className="block rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-center"><Upload className="mx-auto text-zinc-500"/><span className="mt-2 block text-sm font-bold text-zinc-700">{uploading?"กำลังอัปโหลด...":"เลือกรูปปกจากมือถือ"}</span><input type="file" accept="image/*" onChange={e=>uploadCover(e.target.files?.[0]||null)} className="hidden"/></label><label className="block"><span className="text-sm font-bold text-zinc-700">หรือวางลิงก์รูปปก</span><input value={value.cover} onChange={e=>set("cover",e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-zinc-950"/></label><label className="block"><span className="text-sm font-bold text-zinc-700">ลิงก์เว็บที่อ่าน</span><input value={value.source_url} onChange={e=>set("source_url",e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-zinc-950"/></label><div className="grid grid-cols-2 gap-3"><label className="block"><span className="text-sm font-bold text-zinc-700">อ่านถึงตอน</span><input inputMode="decimal" value={value.read_chapter} onChange={e=>set("read_chapter",e.target.value)} placeholder="12" className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-zinc-950"/></label><label className="block"><span className="text-sm font-bold text-zinc-700">ล่าสุดตอน</span><input inputMode="decimal" value={value.latest_chapter} onChange={e=>set("latest_chapter",e.target.value)} placeholder="15" className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-zinc-950"/></label></div><div className="grid grid-cols-2 gap-3"><label className="block"><span className="text-sm font-bold text-zinc-700">สถานะ</span><select value={value.status} onChange={e=>set("status",e.target.value as MangaStatus)} className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-zinc-950"><option value="reading">กำลังอ่าน</option><option value="waiting">รอตอนใหม่</option><option value="finished">อ่านจบ</option><option value="paused">ดองไว้</option></select></label><label className="block"><span className="text-sm font-bold text-zinc-700">Tier</span><select value={value.tier} onChange={e=>set("tier",e.target.value as MangaTier)} className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-zinc-950">{tiers.map(t=><option key={t} value={t}>{t}</option>)}</select></label></div><label className="block"><span className="text-sm font-bold text-zinc-700">โน้ต</span><textarea value={value.note} onChange={e=>set("note",e.target.value)} rows={3} placeholder="โน้ตส่วนตัว" className="mt-1 w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-zinc-950"/></label></div><button onClick={onSave} className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-zinc-950 text-base font-bold text-white"><Save size={18} className="mr-2"/> บันทึก</button></motion.div></motion.div>
}

export default function App(){
 const[user,setUser]=useState<SupabaseUser|null>(null);const[items,setItems]=useState<MangaItem[]>([]);const[loaded,setLoaded]=useState(false);const[query,setQuery]=useState("");const[filter,setFilter]=useState<"all"|"updated"|MangaStatus>("all");const[tab,setTab]=useState<"collection"|"tier">("tier");const[form,setForm]=useState<Omit<MangaItem,"id"|"user_id">>(emptyForm);const[editingId,setEditingId]=useState<string|null>(null);const[openForm,setOpenForm]=useState(false);const[selectedItem,setSelectedItem]=useState<MangaItem|null>(null);const[syncing,setSyncing]=useState(false);
 useEffect(()=>{if(!supabase){const saved=localStorage.getItem(STORAGE_KEY);setItems(saved?JSON.parse(saved):[]);setLoaded(true);return}supabase.auth.getUser().then(({data})=>setUser(data.user));const{data:listener}=supabase.auth.onAuthStateChange((_event,session)=>setUser(session?.user||null));setLoaded(true);return()=>listener.subscription.unsubscribe()},[]);
 useEffect(()=>{async function loadCloud(){if(!supabase)return;setSyncing(true);const{data,error}=await supabase.from("manga_items").select("*").order("created_at",{ascending:false});if(!error&&data)setItems(data as MangaItem[]);setSyncing(false)}if(loaded)loadCloud()},[user,loaded]);
 useEffect(()=>{if(!supabase&&loaded)localStorage.setItem(STORAGE_KEY,JSON.stringify(items))},[items,loaded]);
 useEffect(()=>{if(selectedItem){const updated=items.find(i=>i.id===selectedItem.id);if(updated&&updated!==selectedItem)setSelectedItem(updated)}},[items,selectedItem]);
 useEffect(()=>{if(!user&&tab==="collection")setTab("tier")},[user,tab]);
 const filtered=useMemo(()=>items.filter(item=>{const matchesQuery=item.title.toLowerCase().includes(query.toLowerCase());const hasUpdate=chapterNumber(item.latest_chapter)>chapterNumber(item.read_chapter);const matchesFilter=filter==="all"||(filter==="updated"&&hasUpdate)||item.status===filter;return matchesQuery&&matchesFilter}),[items,query,filter]);
 const stats=useMemo(()=>({total:items.length,updated:items.filter(item=>chapterNumber(item.latest_chapter)>chapterNumber(item.read_chapter)).length}),[items]);
 const requireLogin=()=>alert("ต้อง Login ก่อนถึงจะใช้ฟังก์ชันนี้ได้"); const openAdd=()=>{if(!user)return requireLogin();setEditingId(null);setForm(emptyForm);setOpenForm(true)};const openEdit=(item:MangaItem)=>{if(!user)return requireLogin();setSelectedItem(null);setEditingId(item.id);const{id,user_id,...rest}=item;setForm(rest);setOpenForm(true)};
 async function saveItem(){if(!user)return requireLogin();if(!form.title.trim())return;if(supabase&&user){if(editingId){const{data,error}=await supabase.from("manga_items").update({...form}).eq("id",editingId).select().single();if(error)return alert(error.message);setItems(prev=>prev.map(item=>item.id===editingId?data as MangaItem:item))}else{const{data,error}=await supabase.from("manga_items").insert({...form,user_id:user.id}).select().single();if(error)return alert(error.message);setItems(prev=>[data as MangaItem,...prev])}}else{if(editingId)setItems(prev=>prev.map(item=>item.id===editingId?{...form,id:editingId}:item));else setItems(prev=>[{...form,id:makeId()},...prev])}setOpenForm(false);setForm(emptyForm);setEditingId(null)}
 async function deleteItem(id:string){if(!user)return requireLogin();if(!confirm("ลบเรื่องนี้ใช่ไหม?"))return;if(supabase&&user){const{error}=await supabase.from("manga_items").delete().eq("id",id);if(error)return alert(error.message)}setItems(prev=>prev.filter(item=>item.id!==id));setSelectedItem(null)}
 async function changeTier(id:string,tier:MangaTier){if(!user)return requireLogin();setItems(prev=>prev.map(item=>item.id===id?{...item,tier}:item));if(supabase&&user)await supabase.from("manga_items").update({tier}).eq("id",id)}
 async function checkLatest(item:MangaItem){if(!user)throw new Error("ต้อง Login ก่อนถึงจะเช็กตอนล่าสุดได้");if(!item.source_url)throw new Error("เรื่องนี้ยังไม่มีลิงก์เว็บ");const res=await fetch("/api/check-latest",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:item.source_url})});const result=await res.json();if(!res.ok||!result.latestChapter)throw new Error(result.error||"ยังดึงตอนล่าสุดจากเว็บนี้ไม่ได้");const latest=String(result.latestChapter);if(supabase&&user){const{data,error}=await supabase.from("manga_items").update({latest_chapter:latest}).eq("id",item.id).select().single();if(error)throw new Error(error.message);setItems(prev=>prev.map(i=>i.id===item.id?data as MangaItem:i))}else{setItems(prev=>prev.map(i=>i.id===item.id?{...i,latest_chapter:latest}:i))}}
 async function logout(){if(supabase)await supabase.auth.signOut();setUser(null);setItems([]);setSelectedItem(null)}
 return <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-200 text-zinc-950"><div className="mx-auto max-w-md md:max-w-4xl lg:max-w-7xl md:max-w-4xl lg:max-w-6xl px-4 md:px-6 pb-24 pt-5"><header className="mb-4 rounded-[2rem] bg-zinc-950 p-5 text-white shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="flex items-center gap-1 text-sm font-semibold text-zinc-400"><Cloud size={14}/>{user?"Cloud Sync เปิดอยู่":"Manga Tracker"}</p><h1 className="mt-1 text-3xl font-black leading-tight">คลังมังงะของฉัน</h1>{!user&&<p className="mt-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/90">Guest Mode: ดู Tier List ได้ ต้อง Login เพื่อเข้า Collection/เปิดอ่าน/เช็กตอน/แก้ไข</p>}</div><div className="flex gap-2">{user&&<button onClick={logout} className="rounded-2xl bg-white/10 p-3 text-white"><LogOut size={20}/></button>}{user?<button onClick={openAdd} className="rounded-2xl bg-white p-3 text-zinc-950 shadow-sm"><Plus size={22}/></button>:<button onClick={()=>document.getElementById("login-box")?.scrollIntoView({behavior:"smooth"})} className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-zinc-950 shadow-sm">Login</button>}</div></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-3xl bg-white/10 p-4"><p className="text-xs text-zinc-400">ทั้งหมด</p><p className="text-2xl font-black">{stats.total}</p></div><div className="rounded-3xl bg-white/10 p-4"><p className="text-xs text-zinc-400">มีตอนใหม่</p><p className="text-2xl font-black">{stats.updated}</p></div></div></header>{!user&&<div id="login-box" className="mb-4"><AuthBox/></div>}<div className="sticky top-0 z-20 -mx-4 bg-zinc-100/90 px-4 py-3 backdrop-blur"><div className="grid grid-cols-2 overflow-hidden rounded-3xl bg-white p-1 shadow-sm ring-1 ring-zinc-100">{user&&<button onClick={()=>setTab("collection")} className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold transition ${tab==="collection"?"bg-zinc-950 text-white":"text-zinc-500"}`}><BookOpen size={16}/> Collection</button>}<button onClick={()=>setTab("tier")} className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold transition ${tab==="tier"||!user?"bg-zinc-950 text-white":"text-zinc-500"}`}><Layers size={16}/> Tier List</button></div></div>{syncing&&<p className="mb-3 rounded-2xl bg-white p-3 text-center text-sm text-zinc-500">กำลัง sync ข้อมูล...</p>}{user&&tab==="collection"?<><div className="mb-3 flex items-center gap-2 rounded-3xl bg-white px-4 py-3 shadow-sm"><Search size={18} className="text-zinc-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ค้นหาชื่อมังงะ..." className="w-full bg-transparent text-sm outline-none"/></div><div className="mb-4 flex gap-2 overflow-x-auto pb-1">{[["all","ทั้งหมด"],["updated","มีตอนใหม่"],["reading","กำลังอ่าน"],["waiting","รอ"],["finished","จบแล้ว"],["paused","ดองไว้"]].map(([key,label])=><button key={key} onClick={()=>setFilter(key as typeof filter)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${filter===key?"bg-zinc-950 text-white":"bg-white text-zinc-500"}`}>{label}</button>)}</div><div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-x-3 md:gap-x-4 gap-y-5"><AnimatePresence>{filtered.map(item=><MangaTile key={item.id} item={item} onOpen={setSelectedItem} isGuest={!user}/>)}</AnimatePresence></div>{filtered.length===0&&<div className="mt-4 rounded-[2rem] bg-white p-8 text-center shadow-sm"><Star className="mx-auto text-zinc-300" size={36}/><h3 className="mt-3 font-black">ยังไม่มีรายการ</h3><p className="mt-1 text-sm text-zinc-500">กดเพิ่มมังงะเพื่อเริ่มใช้งาน</p></div>}</>:<div className="space-y-4">{tiers.map(t=>{const tierItems=items.filter(item=>item.tier===t);return <Card key={t} className="p-4"><div className="mb-3 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-xl font-black text-white">{t}</div><div><h2 className="font-black">Tier {t}</h2><p className="text-sm text-zinc-500">{tierItems.length} เรื่อง</p></div></div><div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 md:gap-3">{tierItems.map(item=><MangaTile key={item.id} item={item} onOpen={setSelectedItem} small isGuest={!user}/>)}{tierItems.length===0&&<p className="col-span-4 text-sm text-zinc-400">ยังไม่มีเรื่องใน Tier นี้</p>}</div></Card>})}</div>}</div>{user?<button onClick={openAdd} className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-zinc-950 px-6 py-4 font-bold text-white shadow-xl"><Plus size={20}/> เพิ่มมังงะ</button>:<button onClick={()=>document.getElementById("login-box")?.scrollIntoView({behavior:"smooth"})} className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-zinc-950 px-6 py-4 font-bold text-white shadow-xl"><User size={20}/> Login เพื่อใช้งานเต็ม</button>}<AnimatePresence>{selectedItem&&<DetailModal item={selectedItem} onClose={()=>setSelectedItem(null)} onEdit={openEdit} onDelete={deleteItem} onTierChange={changeTier} onCheckLatest={checkLatest} isGuest={!user}/>} {openForm&&<MangaForm value={form} onChange={setForm} onSave={saveItem} onClose={()=>setOpenForm(false)} editing={Boolean(editingId)} user={user}/>}</AnimatePresence></main>
}
