export default function ParentSNBPPrediction() {
  // In a real app, we'd fetch this data from the DB for the specific child
  const childData = {
    name: "Budi Santoso",
    average: 83.8,
    trend: "NAIK",
    chance: "SEDANG",
    target: "Teknik Sipil - ITB"
  };

  return (
    <div className="flex-col gap-4">
      <div className="card">
        <h2 className="card-title">Laporan Rasionalisasi SNBP - {childData.name}</h2>
        <p className="text-muted">Estimasi internal berdasarkan rapor, mapel pendukung spesifik prodi, prestasi, validator TKA 2026, dan keketatan.</p>
        
        <div style={{ marginTop: "20px", padding: "20px", backgroundColor: "var(--background)", borderRadius: "8px" }}>
          <h3>Target: {childData.target}</h3>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
            <div>
              <p>Rata-rata Nilai Rapor (Sem 1-5):</p>
              <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{childData.average}</p>
              <p style={{ color: "var(--success)" }}>Tren: {childData.trend} ↗</p>
            </div>
            
            <div style={{ textAlign: "right" }}>
              <p>Status Rasionalisasi:</p>
              <p style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--warning)" }}>{childData.chance}</p>
            </div>
          </div>
          
          <div style={{ marginTop: "20px", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
            <h4>Rekomendasi AZ Academy:</h4>
            <p>Status estimasi Ananda Budi berada di tingkat SEDANG. Ini bukan peluang resmi PTN. Pertahankan tren nilai, selaraskan mapel pilihan TKA dengan prodi, dan pertimbangkan pilihan kedua yang tingkat persaingannya lebih sesuai.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
