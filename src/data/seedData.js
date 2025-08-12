// ===================== src/data/seedData.js (FROZEN/ESM) =====================
// Cambia esta versión cuando edites datos -> auto-reset del cache
export const SEED_VERSION = "2025-08-11-frozen-1";

// Esquema de item:
// { id, type: "alojamiento"|"restaurante"|"abastecimiento"|"outdoor"|"parque",
//   name, address?, coords?: { lat, lng }, phones?: string[],
//   social?: { web?, instagram?, facebook?, email? }, tags?: string[] }

export const SEED_DATA = [
  // ==================== ALOJAMIENTOS ====================
  { id: "cabanas-victoriano", type: "alojamiento", name: "Cabañas Victoriano", address: "Sector Playa Negra, Caburgua (S-905 km 22 aprox.)", phones: [], social: { web: "https://caburguaturismo.cl/alojamientos-en-caburgua/" }, tags: ["cabañas","domos","familiar"] },
  { id: "portal-costanera-caburgua", type: "alojamiento", name: "Cabañas Portal Costanera Caburgua", address: "Ribera sur-oriente del Lago Caburgua (Rucacura)", coords: { lat: -39.199722, lng: -71.791667 }, phones: [], social: { web: "https://caburguaturismo.cl/alojamientos-en-caburgua/" }, tags: ["cabañas","orilla de lago"] },
  { id: "villa-norma", type: "alojamiento", name: "Villa Norma", address: "Caburgua, Pucón (centro)", phones: [], social: { web: "https://caburguaturismo.cl/alojamientos-en-caburgua/" }, tags: ["cabañas"] },
  { id: "camping-los-coihues", type: "alojamiento", name: "Camping Los Coihues", address: "Caburgua (área urbana)", phones: [], social: { web: "https://caburguaturismo.cl/alojamientos-en-caburgua/" }, tags: ["camping","familiar"] },
  { id: "hostal-casona-caburgua", type: "alojamiento", name: "Hostal Casona Caburgua", address: "Camino Pucón–Caburgua (S-905), centro de Caburgua", phones: [], social: { web: "https://caburguaturismo.cl/alojamientos-en-caburgua/" }, tags: ["hostal"] },
  { id: "cabanas-luma-glo", type: "alojamiento", name: "Cabañas Luma-Glo", address: "Camino Pucón–Caburgua", phones: [], social: { web: "https://caburguaturismo.cl/alojamientos-en-caburgua/" }, tags: ["cabañas"] },

  // ==================== RESTAURANTES / CAFÉS ====================
  { id: "brisas-del-caburgua", type: "restaurante", name: "Restaurantes Brisas del Caburgua", address: "Playa Negra, Caburgua", coords: { lat: -39.198914, lng: -71.80795 }, phones: [], social: { web: "https://caburguaturismo.cl/donde-comer-en-caburgua/" }, tags: ["chilena","vista al lago"] },
  { id: "restaurant-playa-caburgua", type: "restaurante", name: "Restaurant Playa Caburgua", address: "Llegada al lago, Playa Caburgua (Playa Negra)", coords: { lat: -39.199024, lng: -71.80801 }, phones: [], social: { web: "https://caburguaturismo.cl/donde-comer-en-caburgua/" }, tags: ["típica","panorámica"] },
  { id: "cumbres-de-caburgua", type: "restaurante", name: "Restaurante Cumbres de Caburgua", address: "Camino Pucón–Caburgua", phones: [], social: { web: "https://caburguaturismo.cl/socios/restaurante-cumbres-de-caburgua/" }, tags: ["gourmet","veg-friendly"] },
  { id: "amankay", type: "restaurante", name: "Amankay Café & Restaurant", address: "Ruta S905 km ~15 (Pucón → Caburgua)", phones: [], social: { web: "https://caburguaturismo.cl/socios/amankay/" }, tags: ["cafetería","panadería","comercio local"] },
  { id: "restaurant-los-castillos", type: "restaurante", name: "Restaurant Los Castillos", address: "Caburgua (área urbana)", phones: [], social: { web: "https://caburguaturismo.cl/socios/restaurant-los-castillos/" }, tags: ["típica","familiar"] },

  // ==================== ABASTECIMIENTOS ====================
  { id: "supermercado-caburgua", type: "abastecimiento", name: "Supermercado Caburgua", address: "Centro de Caburgua, Camino Pucón–Caburgua (S-905)", coords: { lat: -39.198712, lng: -71.8065431 }, phones: ["+56 9 9846 2223"], social: { web: "https://caburguaturismo.cl/socios/supermercado-caburgua/" }, tags: ["supermercado"] },
  { id: "supermercado-jobanos", type: "abastecimiento", name: "Supermercado Jobano's", address: "Km 22 aprox., Camino Pucón–Caburgua", phones: [], social: { web: "https://caburguaturismo.cl/socios/supermercado-jobanos/" }, tags: ["supermercado"] },
  { id: "provisiones-chepita", type: "abastecimiento", name: "Provisiones Chepita", address: "Centro de Caburgua, S905", phones: [], social: { web: "https://caburguaturismo.cl/socios/provisiones-chepita/" }, tags: ["almacén"] },
  { id: "provisiones-martita", type: "abastecimiento", name: "Provisiones Martita", address: "Caburgua (radio urbano)", phones: [], social: { web: "https://caburguaturismo.cl/socios/provisiones-martita/" }, tags: ["almacén"] },
  { id: "kiosko-dona-isaura", type: "abastecimiento", name: "Kiosko Doña Isaura", address: "Caburgua", phones: [], social: { web: "https://caburguaturismo.cl/project-type/abastecimiento/" }, tags: ["kiosko"] },
  { id: "delicias-de-luisa", type: "abastecimiento", name: "Delicias de Luisa", address: "Caburgua", phones: [], social: { web: "https://caburguaturismo.cl/donde-comer-en-caburgua/" }, tags: ["comida preparada","dulces"] },
  { id: "suenos-de-huerquehue-la-pulguita", type: "abastecimiento", name: "Sueños de Huerquehue - La Pulguita", address: "Camino a Huerquehue", phones: [], social: { web: "https://caburguaturismo.cl/donde-comer-en-caburgua/" }, tags: ["almacén"] },
  { id: "el-gustazo", type: "abastecimiento", name: "El Gustazo", address: "Camino a Playa Blanca 1640, Caburgua", phones: [], social: { web: "https://caburguaturismo.cl/socios/el-gustazo/" }, tags: ["empanadas","pizzas","comida preparada"] },

  // ==================== OUTDOOR / PARQUES ====================
  { id: "ojos-del-caburgua", type: "outdoor", name: "Ojos del Caburgua", address: "Ruta S919, Carhuello/Pucón", coords: { lat: -39.233572, lng: -71.8446 }, phones: [], social: { web: "https://caburguaturismo.cl/que-hacer-en-caburgua/" }, tags: ["cascadas","miradores"] },
  { id: "parque-nacional-huerquehue", type: "parque", name: "Parque Nacional Huerquehue (acceso Tinquilco)", address: "Desvío desde ruta a Caburgua → Lago Tinquilco", coords: { lat: -39.138611, lng: -71.666389 }, phones: [], social: { web: "https://caburguaturismo.cl/que-hacer-en-caburgua/" }, tags: ["senderismo","lagunas","araucanías"] },
  { id: "laguna-verde", type: "outdoor", name: "Laguna Verde (Caburgua)", address: "Sector norte de Caburgua", phones: [], social: { web: "https://caburguaturismo.cl/laguna-verde/" }, tags: ["laguna","naturaleza"] },
  { id: "santuario-el-cani", type: "outdoor", name: "Santuario El Cañi", address: "Acceso por S-907 (Pucón–Huife)", phones: [], social: { web: "https://caburguaturismo.cl/que-hacer-en-caburgua/" }, tags: ["reserva privada","trekking"] },
  { id: "rio-trancura", type: "outdoor", name: "Río Trancura (sector alto)", address: "Camino Internacional Pucón–Curarrehue", phones: [], social: { web: "https://caburguaturismo.cl/rio-trancura/" }, tags: ["rafting","río"] },
  { id: "salto-los-copihues", type: "outdoor", name: "Salto Los Copihues", address: "Cercanías de Caburgua", phones: [], social: { web: "https://caburguaturismo.cl/que-hacer-en-caburgua/" }, tags: ["cascada"] },
  { id: "playa-negra", type: "outdoor", name: "Playa Negra (Lago Caburgua)", address: "Caburgua - playa principal", coords: { lat: -39.195833, lng: -71.801944 }, phones: [], social: {}, tags: ["playa pública","bañarse"] },
  { id: "playa-blanca", type: "outdoor", name: "Playa Blanca (Lago Caburgua)", address: "Camino a Playas Blancas (S-909)", phones: [], social: {}, tags: ["arena blanca","familiar"] }
];

// ==================== LocalStorage + Autoreset ====================
const LS_KEYS = { version: "app.seed.version", data: "app.seed.data" };

/** Aplica seed y limpia cache si cambia la versión */
export function applySeedWithVersioning(storage = window.localStorage) {
  const currentVersion = storage.getItem(LS_KEYS.version);
  const needsReset = currentVersion !== SEED_VERSION;

  if (needsReset) {
    storage.clear();
    storage.setItem(LS_KEYS.data, JSON.stringify(SEED_DATA));
    storage.setItem(LS_KEYS.version, SEED_VERSION);
    return { applied: true, reason: currentVersion ? "version_changed" : "first_seed" };
  }

  if (!storage.getItem(LS_KEYS.data)) {
    storage.setItem(LS_KEYS.data, JSON.stringify(SEED_DATA));
    return { applied: true, reason: "rehydrate_missing_data" };
  }

  return { applied: false, reason: "up_to_date" };
}

/** Inicializa el seed (sin geocodificador) */
export async function initSeed() {
  const status = applySeedWithVersioning();
  if (typeof window !== "undefined") {
    window.SEED_VERSION = SEED_VERSION;
    window.SEED_DATA = JSON.parse(localStorage.getItem(LS_KEYS.data) || "[]");
  }
  return status;
}

/** Lectura de datos */
export function getSeedData() {
  const raw = localStorage.getItem(LS_KEYS.data);
  return raw ? JSON.parse(raw) : [];
}
