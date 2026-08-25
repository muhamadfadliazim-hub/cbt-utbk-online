export type SupportingSubjectProfile = {
  group: string;
  subjects: string[];
};

const hasAny = (value: string, keywords: string[]) => keywords.some((keyword) => value.includes(keyword));

function educationSubject(major: string): SupportingSubjectProfile {
  const candidates: [string[], string][] = [
    [["MATEMATIKA"], "Matematika Tingkat Lanjut"],
    [["FISIKA"], "Fisika"],
    [["KIMIA"], "Kimia"],
    [["BIOLOGI", "IPA"], "Biologi"],
    [["EKONOMI", "AKUNTANSI"], "Ekonomi"],
    [["GEOGRAFI"], "Geografi"],
    [["SEJARAH"], "Sejarah"],
    [["SOSIOLOGI"], "Sosiologi"],
    [["PANCASILA", "KEWARGANEGARAAN", "PPKN"], "Pendidikan Pancasila"],
    [["BAHASA INGGRIS"], "Bahasa Inggris Tingkat Lanjut"],
    [["BAHASA INDONESIA", "SASTRA INDONESIA"], "Bahasa Indonesia Tingkat Lanjut"],
    [["JASMANI", "OLAHRAGA", "KEPELATIHAN"], "PJOK"],
    [["SENI"], "Seni Budaya"],
  ];
  const subject = candidates.find(([keywords]) => hasAny(major, keywords))?.[1] ?? "Mata pelajaran yang relevan";
  return { group: "Pendidikan", subjects: [subject] };
}

/**
 * Maps dataset program names to the official SNBP supporting-subject groups in
 * Kepmendikbudristek No. 345/M/2022 (Kurikulum Merdeka column).
 */
function getRawSupportingSubjects(majorName: string, category = "UMUM"): SupportingSubjectProfile {
  const major = majorName.toUpperCase().replaceAll("&", "DAN");

  // Rumpun Ilmu Terapan (Kesehatan)
  if (hasAny(major, ["KEDOKTERAN GIGI", "DOKTER GIGI"])) return { group: "Kedokteran Gigi", subjects: ["Biologi", "Kimia"] };
  if (hasAny(major, ["KEDOKTERAN", "PENDIDIKAN DOKTER"])) return { group: "Kedokteran", subjects: ["Biologi", "Kimia"] };
  if (hasAny(major, ["VETERINER", "DOKTER HEWAN", "KEDOKTERAN HEWAN"])) return { group: "Veteriner", subjects: ["Biologi", "Kimia"] };
  if (hasAny(major, ["FARMASI", "FARMASI KLINIS"])) return { group: "Farmasi", subjects: ["Biologi", "Kimia"] };
  if (hasAny(major, ["GIZI"])) return { group: "Gizi", subjects: ["Biologi", "Kimia"] };
  if (hasAny(major, ["KESEHATAN MASYARAKAT", "KESEHATAN LINGKUNGAN"])) return { group: "Kesehatan Masyarakat", subjects: ["Biologi"] };
  if (hasAny(major, ["KEBIDANAN"])) return { group: "Kebidanan", subjects: ["Biologi"] };
  if (hasAny(major, ["KEPERAWATAN"])) return { group: "Keperawatan", subjects: ["Biologi"] };
  if (hasAny(major, ["KESEHATAN", "FISIOTERAPI", "ANESTESIOLOGI", "RADIOLOGI", "TERAPI OKUPASI", "OPTOMETRI", "TEKNOLOGI LABORATORIUM MEDIK", "REKAM MEDIS"])) return { group: "Kesehatan Terapan", subjects: ["Biologi"] };

  // Rumpun Ilmu Terapan (Pendidikan)
  if (hasAny(major, ["PENDIDIKAN", "KEGURUAN", "PGSD", "PGPAUD"])) return educationSubject(major);

  // Rumpun Ilmu Formal
  if (hasAny(major, ["SAINS DATA", "DATA SAINS", "STATISTIKA", "AKTUARIA", "MATEMATIKA"])) return { group: "Matematika/Statistika", subjects: ["Matematika Tingkat Lanjut"] };
  if (hasAny(major, ["ILMU KOMPUTER", "TEKNIK INFORMATIKA", "INFORMATIKA", "SISTEM INFORMASI", "TEKNOLOGI INFORMASI", "REKAYASA PERANGKAT LUNAK", "KECERDASAN ARTIFISIAL", "KEAMANAN SIBER", "SAINS INFORMASI"])) return { group: "Komputer/Sistem Informasi", subjects: ["Matematika Tingkat Lanjut"] };

  // Rumpun Ilmu Alam
  if (hasAny(major, ["ASTRONOMI"])) return { group: "Astronomi", subjects: ["Fisika", "Matematika Tingkat Lanjut"] };
  if (hasAny(major, ["GEOFISIKA", "KEBUMIAN", "GEOLOGI", "METEOROLOGI", "OSEANOGRAFI"])) return { group: "Ilmu Kebumian", subjects: ["Fisika", "Matematika Tingkat Lanjut"] };
  if (hasAny(major, ["FISIKA", "BIOFISIKA"])) return { group: "Fisika/Biofisika", subjects: ["Fisika"] };
  if (hasAny(major, ["KIMIA"])) return { group: "Kimia", subjects: ["Kimia"] };
  if (hasAny(major, ["BIOLOGI", "BIOINFORMATIKA", "BIOTEKNOLOGI"])) return { group: "Biologi/Bioteknologi", subjects: ["Biologi"] };
  if (hasAny(major, ["ILMU KELAUTAN", "SAINS KELAUTAN"])) return { group: "Sains Kelautan", subjects: ["Biologi"] };

  // Rumpun Ilmu Terapan (Arsitektur & Desain)
  if (hasAny(major, ["ARSITEKTUR"])) return { group: "Arsitektur", subjects: ["Matematika Tingkat Lanjut", "Fisika"] };
  if (hasAny(major, ["PERENCANAAN WILAYAH", "PERENCANAAN KOTA", "PLANOLOGI"])) return { group: "Perencanaan Wilayah", subjects: ["Ekonomi", "Matematika Tingkat Lanjut"] };
  if (hasAny(major, ["DESAIN", "KRIYA"])) return { group: "Desain", subjects: ["Seni Budaya", "Matematika Tingkat Lanjut"] };

  // Rumpun Ilmu Terapan (Teknik/Rekayasa)
  if (hasAny(major, ["TEKNIK KIMIA", "REKAYASA KIMIA"])) return { group: "Teknik Kimia", subjects: ["Kimia", "Matematika Tingkat Lanjut"] };
  if (hasAny(major, ["TEKNOLOGI PANGAN", "HASIL PERTANIAN", "HASIL PERIKANAN", "HASIL PETERNAKAN", "ANALIS FARMASI DAN MAKANAN"])) return { group: "Teknologi Pertanian/Pangan", subjects: ["Kimia", "Biologi"] };
  if (hasAny(major, ["TEKNIK", "REKAYASA", "MEKATRONIKA", "METALURGI", "TEKNOLOGI INDUSTRI", "MATERIAL", "PERKAPALAN", "PERMINYAKAN", "PERTAMBANGAN", "GEOMATIKA"])) return { group: "Teknik/Rekayasa", subjects: ["Fisika", "Matematika Tingkat Lanjut"] };

  // Rumpun Ilmu Terapan (Pertanian & Lingkungan)
  if (hasAny(major, ["PERTANIAN", "AGRONOMI", "AGROTEKNOLOGI", "AGROEKOTEKNOLOGI", "HORTIKULTURA", "ILMU TANAH", "PROTEKSI TANAMAN"])) return { group: "Pertanian", subjects: ["Biologi"] };
  if (hasAny(major, ["PETERNAKAN"])) return { group: "Peternakan", subjects: ["Biologi"] };
  if (hasAny(major, ["PERIKANAN", "AKUAKULTUR", "BUDIDAYA PERAIRAN"])) return { group: "Perikanan", subjects: ["Biologi"] };
  if (hasAny(major, ["KEHUTANAN", "KONSERVASI", "SUMBER DAYA ALAM"])) return { group: "Kehutanan", subjects: ["Biologi"] };
  if (hasAny(major, ["LINGKUNGAN"])) return { group: "Ilmu Lingkungan", subjects: ["Biologi"] };

  // Rumpun Ilmu Terapan (Bisnis, Ekonomi, Logistik)
  if (hasAny(major, ["AKUNTANSI", "PERPAJAKAN", "KEUANGAN", "PERBANKAN", "MANAJEMEN", "LOGISTIK", "ADMINISTRASI BISNIS", "ADMINISTRASI NIAGA", "BISNIS", "KEWIRAUSAHAAN", "EKONOMI PEMBANGUNAN", "ILMU EKONOMI", "EKONOMI ISLAM", "AGRIBISNIS"])) return { group: "Ekonomi/Bisnis/Manajemen", subjects: ["Ekonomi", "Matematika Tingkat Lanjut"] };
  
  // Rumpun Ilmu Sosial & Humaniora
  if (hasAny(major, ["KOMUNIKASI", "HUBUNGAN MASYARAKAT", "PENYIARAN", "JURNALISTIK", "PERIKLANAN"])) return { group: "Ilmu Komunikasi", subjects: ["Sosiologi"] };
  if (hasAny(major, ["PSIKOLOGI"])) return { group: "Psikologi", subjects: ["Sosiologi", "Matematika Tingkat Lanjut"] };
  if (hasAny(major, ["HUKUM"])) return { group: "Hukum", subjects: ["Sosiologi", "Pendidikan Pancasila"] };
  if (hasAny(major, ["PERTAHANAN", "MILITER"])) return { group: "Pertahanan/Militer", subjects: ["Pendidikan Pancasila", "Sosiologi"] };
  if (hasAny(major, ["ADMINISTRASI PUBLIK", "ADMINISTRASI NEGARA", "PEMERINTAHAN", "KEBIJAKAN PUBLIK"])) return { group: "Urusan Publik", subjects: ["Sosiologi"] };
  if (hasAny(major, ["SOSIOLOGI", "ANTROPOLOGI", "KESEJAHTERAAN SOSIAL", "HUBUNGAN INTERNASIONAL", "ILMU POLITIK", "KRIMINOLOGI"])) return { group: "Ilmu Sosial", subjects: ["Sosiologi"] };

  // Rumpun Ilmu Terapan Lainnya
  if (hasAny(major, ["PARIWISATA", "PERHOTELAN", "PERJALANAN WISATA"])) return { group: "Pariwisata", subjects: ["Ekonomi", "Bahasa Inggris Tingkat Lanjut"] };
  if (hasAny(major, ["TRANSPORTASI", "PENERBANGAN", "PERKERETAAPIAN", "LALU LINTAS", "NAUTIKA"])) return { group: "Transportasi", subjects: ["Matematika Tingkat Lanjut"] };
  if (hasAny(major, ["GEOGRAFI", "INFORMASI GEOSPASIAL", "PENGINDERAAN JAUH"])) return { group: "Geografi/Informasi Geografis", subjects: ["Geografi", "Matematika Tingkat Lanjut"] };
  if (hasAny(major, ["OLAHRAGA", "KEPELATIHAN", "JASMANI"])) return { group: "Keolahragaan", subjects: ["PJOK", "Biologi"] };

  // Rumpun Humaniora
  if (hasAny(major, ["LINGUISTIK", "BAHASA", "SASTRA"])) return { group: "Bahasa dan Sastra", subjects: ["Bahasa Indonesia Tingkat Lanjut", "Bahasa Inggris Tingkat Lanjut"] };
  if (hasAny(major, ["SEJARAH", "ARKEOLOGI"])) return { group: "Sejarah", subjects: ["Sejarah"] };
  if (hasAny(major, ["FILSAFAT"])) return { group: "Filsafat", subjects: ["Sosiologi"] };
  if (hasAny(major, ["SENI", "MUSIK", "TARI", "TEATER", "KARAWITAN", "ETNOMUSIKOLOGI", "FOTOGRAFI", "FILM", "PEDALANGAN"])) return { group: "Seni", subjects: ["Seni Budaya"] };

  // Fallback mapel pendukung berdasarkan kategori SNPMB
  if (category === "SAINTEK") return { group: "Sains/Teknik (pemetaan umum)", subjects: ["Matematika Tingkat Lanjut", "Fisika"] };
  if (category === "SOSHUM") return { group: "Sosial/Humaniora (pemetaan umum)", subjects: ["Sosiologi"] };
  if (category === "SENI/OLAHRAGA") return { group: "Seni/Olahraga (pemetaan umum)", subjects: ["Seni Budaya"] };
  
  return { group: "Pemetaan umum", subjects: ["Mata pelajaran yang relevan"] };
}

export function getSupportingSubjects(majorName: string, category = "UMUM"): SupportingSubjectProfile {
  const result = getRawSupportingSubjects(majorName, category);
  
  if (result.subjects.length === 1) {
    const s = result.subjects[0];
    let secondSubject = "";
    if (s === "Biologi") secondSubject = "Kimia";
    else if (s === "Matematika Tingkat Lanjut") secondSubject = "Fisika";
    else if (s === "Fisika" || s === "Kimia") secondSubject = "Matematika Tingkat Lanjut";
    else if (s === "Sosiologi") secondSubject = "Sejarah";
    else if (s === "Sejarah") secondSubject = "Sosiologi";
    else if (s === "Seni Budaya") secondSubject = "Sosiologi";
    else if (s === "Ekonomi") secondSubject = "Sosiologi";
    else if (s === "Geografi") secondSubject = "Sosiologi";
    else if (s === "Pendidikan Pancasila") secondSubject = "Sejarah";
    else if (s === "Bahasa Inggris Tingkat Lanjut" || s === "Bahasa Indonesia Tingkat Lanjut") secondSubject = "Sosiologi";
    else if (s === "PJOK") secondSubject = "Biologi";
    else secondSubject = category === "SAINTEK" ? "Fisika" : "Sosiologi";
    
    result.subjects.push(secondSubject);
  }
  
  // Also fix cases where the fallback returns "Mata pelajaran yang relevan"
  if (result.subjects[0] === "Mata pelajaran yang relevan") {
    result.subjects = category === "SAINTEK" 
      ? ["Matematika Tingkat Lanjut", "Fisika"] 
      : category === "SOSHUM" 
        ? ["Sosiologi", "Sejarah"] 
        : ["Sosiologi", "Seni Budaya"];
  }

  return result;
}
