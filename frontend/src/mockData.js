// --- DATA JURUSAN (Mockup Data Awal) ---
export const INITIAL_UNIVERSITY_DATA = [
    { id: 1, uni: "UNIVERSITAS SYIAH KUALA", prodi: "PENDIDIKAN DOKTER HEWAN", grade: 420.98 },
    { id: 2, uni: "UNIVERSITAS SYIAH KUALA", prodi: "TEKNIK SIPIL", grade: 480.60 },
    { id: 3, uni: "INSTITUT TEKNOLOGI BANDUNG", prodi: "STEI - KOMPUTASI", grade: 689.50 }
];

// --- STRUKTUR FOLDER LMS ---
export const SUBJECT_FOLDERS = {
    'UTBK': [
        { id: 'PU', name: 'Penalaran Umum', color: 'bg-orange-100 text-orange-600' },
        { id: 'PK', name: 'Pengetahuan Kuantitatif', color: 'bg-blue-100 text-blue-600' },
        { id: 'PPU', name: 'Pengetahuan & Pemahaman Umum', color: 'bg-yellow-100 text-yellow-600' },
        { id: 'PBM', name: 'Pemahaman Bacaan & Menulis', color: 'bg-teal-100 text-teal-600' },
        { id: 'LBi', name: 'Literasi B. Indonesia', color: 'bg-red-100 text-red-600' },
        { id: 'LBE', name: 'Literasi B. Inggris', color: 'bg-indigo-100 text-indigo-600' },
        { id: 'PM', name: 'Penalaran Matematika', color: 'bg-purple-100 text-purple-600' },
    ],
    'CPNS': [
        { id: 'TWK', name: 'Tes Wawasan Kebangsaan', color: 'bg-red-100 text-red-700' },
        { id: 'TIU', name: 'Tes Intelegensia Umum', color: 'bg-slate-100 text-slate-700' },
        { id: 'TKP', name: 'Tes Karakteristik Pribadi', color: 'bg-green-100 text-green-700' },
    ],
    'MANDIRI': [
        { id: 'TPA', name: 'Tes Potensi Akademik', color: 'bg-sky-100 text-sky-700' },
        { id: 'MAT', name: 'Matematika Dasar', color: 'bg-blue-100 text-blue-700' },
        { id: 'ENG', name: 'Bahasa Inggris', color: 'bg-indigo-100 text-indigo-700' },
        { id: 'SAINTEK', name: 'Kemampuan IPA', color: 'bg-emerald-100 text-emerald-700' },
        { id: 'SOSHUM', name: 'Kemampuan IPS', color: 'bg-orange-100 text-orange-700' },
    ],
    'TOEFL': [
        { id: 'LISTENING', name: 'Listening Comprehension', color: 'bg-rose-100 text-rose-700' },
        { id: 'STRUCTURE', name: 'Structure & Written', color: 'bg-amber-100 text-amber-700' },
        { id: 'READING', name: 'Reading Comprehension', color: 'bg-lime-100 text-lime-700' },
    ]
};

// --- MOCK MATERI ---
export const MOCK_MATERIALS = [
    { id: 1, category: 'UTBK', subject: 'PK', type: 'VIDEO', title: 'Trik Cepat Aljabar Dasar', url: '#' },
    { id: 2, category: 'CPNS', subject: 'TWK', type: 'PDF', title: 'Rangkuman UUD 1945 Lengkap', url: '#' },
    { id: 3, category: 'MANDIRI', subject: 'TPA', type: 'VIDEO', title: 'Logika Gambar & Deret', url: '#' },
];