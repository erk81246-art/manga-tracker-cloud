import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "./register-sw";
export const metadata: Metadata = { title:"Manga Tracker", description:"Cloud sync manga tracker", manifest:"/manifest.webmanifest", appleWebApp:{capable:true,statusBarStyle:"black-translucent",title:"Manga Tracker"} };
export const viewport: Viewport = { themeColor:"#09090b", width:"device-width", initialScale:1, maximumScale:1 };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="th"><body><RegisterSW />{children}</body></html>}
