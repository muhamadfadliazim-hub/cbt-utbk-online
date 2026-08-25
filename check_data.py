import pandas as pd

df_snbt = pd.read_excel('SNBT_Per_Prodi_Prediksi_v3_Selektivitas.xlsx', sheet_name='Prediksi_Utama_v3', header=None, nrows=5)
print("SNBT:")
for i, row in df_snbt.iterrows():
    print(i, row.tolist())

df_snbp = pd.read_excel('Keketatan_SNBP_2026_Lengkap_146_PTN.xlsx', sheet_name='Data SNBP 2026', header=None, nrows=5)
print("SNBP:")
for i, row in df_snbp.iterrows():
    print(i, row.tolist())
