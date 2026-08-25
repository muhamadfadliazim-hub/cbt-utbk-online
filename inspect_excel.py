import pandas as pd

def inspect(file):
    print(f"--- {file} ---")
    try:
        xl = pd.ExcelFile(file)
        print("Sheets:", xl.sheet_names)
        for sheet in xl.sheet_names:
            df = pd.read_excel(file, sheet_name=sheet, nrows=5)
            print(f"Sheet '{sheet}' columns:", list(df.columns))
    except Exception as e:
        print(e)

inspect("SNBT_Per_Prodi_Prediksi_v3_Selektivitas.xlsx")
inspect("Keketatan_SNBP_2026_Lengkap_146_PTN.xlsx")
