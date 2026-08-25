import Link from "next/link";
import { ReactNode } from "react";

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <h2>AZ Parents</h2>
        <ul className="sidebar-nav">
          <li><Link href="/parent">Ringkasan Anak</Link></li>
          <li><Link href="/parent/report">Rapor Akademik</Link></li>
          <li><Link href="/parent/snbp-prediction">Prediksi SNBP</Link></li>
        </ul>
      </aside>
      <main className="main-content">
        <header className="dashboard-header">
          <h1>Portal Orang Tua</h1>
          <div>Profil Orang Tua</div>
        </header>
        {children}
      </main>
    </div>
  );
}
