import pandas as pd
import json
import math
from datetime import datetime

# Read SNBT
df_snbt = pd.read_excel('SNBT_Per_Prodi_Prediksi_v3_Selektivitas.xlsx', sheet_name='Prediksi_Utama_v3', header=2)
# Ensure clean string for matching
df_snbt['Nama PTN'] = df_snbt['Nama PTN'].astype(str).str.strip().str.upper()
df_snbt['Program Studi'] = df_snbt['Program Studi'].astype(str).str.strip().str.upper()

# Read SNBP
df_snbp = pd.read_excel('Keketatan_SNBP_2026_Lengkap_146_PTN.xlsx', sheet_name='Data SNBP 2026', header=4)
df_snbp['PTN'] = df_snbp['PTN'].astype(str).str.strip().str.upper()
df_snbp['Program Studi'] = df_snbp['Program Studi'].astype(str).str.strip().str.upper()
df_snbp['Kode Prodi'] = df_snbp['Kode Prodi'].astype(str).str.strip()
df_snbp['Kode PTN'] = df_snbp['Kode PTN'].astype(str).str.strip()

majors = []
matched_count = 0

def clean_float(val):
    if pd.isna(val) or math.isnan(val) or val == '' or val == '-':
        return None
    return float(val)

def clean_int(val):
    if pd.isna(val) or val == '' or val == '-':
        return None
    return int(float(val))

def clean_str(val):
    if pd.isna(val) or val == '':
        return ""
    return str(val).strip()

# Create a mapping of (PTN, Prodi) to SNBT row to join by Name because SNBT doesn't have Kode Prodi
snbt_map = {}
for idx, row in df_snbt.iterrows():
    ptn = row['Nama PTN']
    prodi = row['Program Studi']
    if pd.notna(ptn) and pd.notna(prodi) and ptn != 'NAN':
        snbt_map[(ptn, prodi)] = row

# Since SNBP has all prodi codes, we will iterate SNBP as the base.
# If a prodi is only in SNBT, we will append it later.

processed_snbt = set()

for idx, row in df_snbp.iterrows():
    prodi_id = row['Kode Prodi']
    if prodi_id == 'nan' or not prodi_id: continue
    
    ptn = row['PTN']
    prodi = row['Program Studi']
    
    snbp_data = None
    rank = clean_int(row.get('Rank Nasional*'))
    if rank is not None:
        snbp_data = {
            "rank": rank,
            "capacity": clean_int(row.get('Daya Tampung 2026')),
            "applicants": clean_int(row.get('Peminat 2025')),
            "tightnessPct": clean_float(row.get('Keketatan %')),
            "applicantsPerSeat": clean_float(row.get('Peminat per Kursi')),
            "competitionRatio": clean_str(row.get('Rasio Persaingan')),
            "class": clean_str(row.get('Kategori Keketatan'))
        }
    
    snbt_row = snbt_map.get((ptn, prodi))
    snbt_data = None
    if snbt_row is not None:
        processed_snbt.add((ptn, prodi))
        if pd.notna(snbt_row.get('Prediksi Target v3')):
            snbt_data = {
                "target": clean_int(snbt_row.get('Prediksi Target v3')),
                "safeTarget": clean_int(snbt_row.get('Target Aman v3')),
                "selectivityIndex": clean_float(snbt_row.get('Indeks Selektivitas')),
                "selectivityClass": clean_str(snbt_row.get('Kelas Selektivitas')),
                "confidence": clean_str(snbt_row.get('Confidence')),
                "campusTier": clean_str(snbt_row.get('Tier Kampus')),
                "programClass": clean_str(snbt_row.get('Kelas Prodi v3')),
                "capacity": clean_int(snbt_row.get('Daya Tampung 2025')),
                "applicants": clean_int(snbt_row.get('Peminat 2024')),
                "ratio": clean_float(snbt_row.get('Rasio'))
            }
    
    if snbp_data or snbt_data:
        matched_count += 1
        
    major_obj = {
        "id": prodi_id,
        "ptn": ptn,
        "ptnCode": clean_str(row.get('Kode PTN')),
        "ptnCategory": clean_str(row.get('Kategori PTN')),
        "major": prodi,
        "level": clean_str(row.get('Jenjang')),
        "category": "UMUM", # Fallback, SNBT has Rumpun
        "province": clean_str(row.get('Provinsi')),
        "city": clean_str(row.get('Kab/Kota')),
        "portfolio": clean_str(row.get('Portofolio')),
        "snbp": snbp_data,
        "snbt": snbt_data
    }
    
    if snbt_row is not None:
        rumpun = clean_str(snbt_row.get('Rumpun'))
        if rumpun: major_obj['category'] = rumpun
        if major_obj['level'] == "" or major_obj['level'] == "nan":
             major_obj['level'] = clean_str(snbt_row.get('Jenjang'))

    majors.append(major_obj)

# Append remaining SNBT that wasn't in SNBP
snbt_counter = 1000
for (ptn, prodi), snbt_row in snbt_map.items():
    if (ptn, prodi) not in processed_snbt:
        if pd.notna(snbt_row.get('Prediksi Target v3')):
            snbt_data = {
                "target": clean_int(snbt_row.get('Prediksi Target v3')),
                "safeTarget": clean_int(snbt_row.get('Target Aman v3')),
                "selectivityIndex": clean_float(snbt_row.get('Indeks Selektivitas')),
                "selectivityClass": clean_str(snbt_row.get('Kelas Selektivitas')),
                "confidence": clean_str(snbt_row.get('Confidence')),
                "campusTier": clean_str(snbt_row.get('Tier Kampus')),
                "programClass": clean_str(snbt_row.get('Kelas Prodi v3')),
                "capacity": clean_int(snbt_row.get('Daya Tampung 2025')),
                "applicants": clean_int(snbt_row.get('Peminat 2024')),
                "ratio": clean_float(snbt_row.get('Rasio'))
            }
            majors.append({
                "id": f"snbt-{snbt_counter}",
                "ptn": ptn,
                "ptnCode": "",
                "ptnCategory": clean_str(snbt_row.get('Kategori')),
                "major": prodi,
                "level": clean_str(snbt_row.get('Jenjang')),
                "category": clean_str(snbt_row.get('Rumpun')),
                "province": "",
                "city": "",
                "portfolio": clean_str(snbt_row.get('Portofolio')),
                "snbp": None,
                "snbt": snbt_data
            })
            snbt_counter += 1
            matched_count += 1

output_data = {
    "meta": {
        "generatedAt": datetime.now().strftime("%Y-%m-%d"),
        "snbpSource": "Keketatan_SNBP_2026_Lengkap_146_PTN.xlsx",
        "snbtSource": "SNBT_Per_Prodi_Prediksi_v3_Selektivitas.xlsx",
        "snbpStatus": "Data daya tampung 2026 dan peminat 2025",
        "snbtStatus": "Prediksi model selektivitas v3.0; bukan passing grade resmi SNPMB",
        "totalPrograms": len(majors),
        "matchedPrograms": matched_count
    },
    "majors": majors
}

with open('public/data/majors-2026.json', 'w') as f:
    json.dump(output_data, f, separators=(',', ':'))

print(f"Generated majors-2026.json with {len(majors)} programs. Matched: {matched_count}")
