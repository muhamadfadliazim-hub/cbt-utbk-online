// Store dan data helper khusus Beasiswa Santri BAZNAS (BSB)
import {
  AsnafCategory,
  StatusKelulusan,
  SantriBaznas,
  PesantrenProfile,
  LogbookBimbingan,
  DEFAULT_PESANTREN_SEED,
  DEFAULT_SANTRI_SEED,
  DEFAULT_LOGBOOK_SEED,
} from "./baznasSeed";

export type { AsnafCategory, StatusKelulusan, SantriBaznas, PesantrenProfile, LogbookBimbingan };

const DEFAULT_PESANTREN: PesantrenProfile = DEFAULT_PESANTREN_SEED[0];
const DEFAULT_SANTRI: SantriBaznas[] = DEFAULT_SANTRI_SEED;
const DEFAULT_LOGBOOK: LogbookBimbingan[] = DEFAULT_LOGBOOK_SEED;

const STORAGE_KEYS = {
  PESANTREN: "az_baznas_pesantren_profile",
  SANTRI: "az_baznas_santri_list",
  LOGBOOK: "az_baznas_logbook_list",
};

export function getPesantrenProfile(): PesantrenProfile {
  if (typeof window === "undefined") return DEFAULT_PESANTREN;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PESANTREN);
    return raw ? JSON.parse(raw) : DEFAULT_PESANTREN;
  } catch {
    return DEFAULT_PESANTREN;
  }
}

export function savePesantrenProfile(profile: PesantrenProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.PESANTREN, JSON.stringify(profile));
  } catch (e) {
    console.error("Gagal menyimpan profil pesantren", e);
  }
}

export function getSantriList(): SantriBaznas[] {
  if (typeof window === "undefined") return DEFAULT_SANTRI;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SANTRI);
    return raw ? JSON.parse(raw) : DEFAULT_SANTRI;
  } catch {
    return DEFAULT_SANTRI;
  }
}

export function saveSantriList(list: SantriBaznas[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.SANTRI, JSON.stringify(list));
  } catch (e) {
    console.error("Gagal menyimpan data santri", e);
  }
}

export function getLogbookList(): LogbookBimbingan[] {
  if (typeof window === "undefined") return DEFAULT_LOGBOOK;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGBOOK);
    return raw ? JSON.parse(raw) : DEFAULT_LOGBOOK;
  } catch {
    return DEFAULT_LOGBOOK;
  }
}

export function saveLogbookList(list: LogbookBimbingan[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.LOGBOOK, JSON.stringify(list));
  } catch (e) {
    console.error("Gagal menyimpan logbook", e);
  }
}
