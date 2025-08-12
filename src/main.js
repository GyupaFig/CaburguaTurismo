// src/main.js — con switch ADMIN y mejoras de UX
import { initSeed, getSeedData } from "./data/seedData.js";

// ======= SWITCH PRODUCCIÓN =======
const ADMIN = false; // <- pon true si quieres ver botones admin y "Ubicar en mapa"
// =================================

// ---------- Estado ----------
const state = {
  data: [],
  q: "",
  category: "all",
  markers: [],
  map: null,
  layer: null,
  locatingId: null,
  mapClickHandler: null
};

// ---------- Adaptador seed -> UI ----------
const CAT_MAP = {
  alojamiento: "Alojamientos",
  restaurante: "Restaurantes",
  abastecimiento: "Abastecimiento",
  outdoor: "Actividades Outdoor",
  parque: "Parques"
};
function adaptSeedItem(s) {
  const cat = CAT_MAP[s.type] || "Alojamientos";
  const lat = s.coords?.lat ?? null;
  const lng = s.coords?.lng ?? null;
  return {
    id: s.id || cryptoRandomId(),
    name: s.name,
    category: cat,
    address: s.address || "",
    lat, lng,
    phone: (s.phones && s.phones[0]) || "",
    url: s.social?.web || s.social?.instagram || s.social?.facebook || "",
    tags: s.tags || [],
    desc: "" // opcional
  };
}

// ---------- Utils ----------
function cryptoRandomId(){ return (crypto.randomUUID?.() ?? `id-${Math.random().toString(36).slice(2,10)}`); }
function phoneLink(p){ if(!p) return null; return `tel:${p.replace(/[^\d+]/g,'')}`; }
function mapsLink(lat,lng){ return `https://www.google.com/maps?q=${lat},${lng}`; }
function iconEmoji(category){ return { "Alojamientos":"🏡","Restaurantes":"🍽️","Abastecimiento":"🛒","Actividades Outdoor":"🛶","Parques":"🌲" }[category] || "📍"; }
function colorByCategory(category){ return { "Alojamientos":"#80ffdb","Restaurantes":"#ffd166","Abastecimiento":"#cdb4db","Actividades Outdoor":"#90e0ef","Parques":"#a0ffa0","default":"#9db0ff" }[category] || "#9db0ff"; }
function escapeHTML(s){ return (s??"").toString().replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

// ---------- Carga de seed ----------
async function loadDataFromSeed(){
  const status = await initSeed();
  console.info("[seed] init:", status);
  const raw = getSeedData();
  state.data = raw.map(adaptSeedItem);
  updateCount();
}

// ---------- Filtros / render ----------
function applyFilters(){
  const q = state.q.trim().toLowerCase();
  const cat = state.category;
  return state.data.filter(it=>{
    const matchesCat = (cat==="all") || (it.category===cat);
    const haystack = [it.name, it.address, it.category, (it.desc||""), (it.tags||[]).join(" ")].join(" ").toLowerCase();
    const matchesQ = (!q) || haystack.includes(q);
    return matchesCat && matchesQ;
  });
}

function updateCount(){
  const pill = document.getElementById("countPill");
  const n = state.data.length;
  pill.textContent = `${n} lugar${n===1?"":"es"}`;
}

function render(){
  const list = document.getElementById("list");
  const results = applyFilters();
  list.innerHTML = "";

  if(!results.length){
    list.innerHTML = `<div class="empty">No hay resultados. Prueba otra búsqueda o categoría.</div>`;
  } else {
    results.sort((a,b)=> a.name.localeCompare(b.name, 'es')).forEach(it=>{
      const card = document.createElement("article");
      card.className = "card";
      const hasCoords = Number.isFinite(it.lat) && Number.isFinite(it.lng);

      const locateBtn = ADMIN && !hasCoords
        ? `<button class="chip" data-locate="${it.id}" title="Asignar ubicación">Ubicar en mapa</button>`
        : (!hasCoords ? `<span class="chip" style="background:#2a2f4d;border:1px solid #ffffff22">Sin coordenadas</span>` : "");

      const focusBtn = hasCoords
        ? `<button class="chip ghost" data-focus="${it.id}">Ver en mapa</button>`
        : "";

      const callBtn = it.phone ? `<a class="chip ghost" href="${phoneLink(it.phone)}">Llamar</a>` : "";
      const webBtn  = it.url ? `<a class="chip ghost" target="_blank" href="${it.url}">Sitio / RRSS</a>` : "";

      card.innerHTML = `
        <div class="avatar" style="border-color:${colorByCategory(it.category)}55">${iconEmoji(it.category)}</div>
        <div class="content">
          <h3>${escapeHTML(it.name)}</h3>
          <div class="meta">
            <span class="badge"><span class="dot" style="background:${colorByCategory(it.category)}"></span>${it.category}</span>
            ${it.address ? ` • ${escapeHTML(it.address)}` : ""}
          </div>
          ${it.desc ? `<p class="muted" style="margin:.4rem 0 .3rem">${escapeHTML(it.desc)}</p>` : ""}
          ${Array.isArray(it.tags) && it.tags.length ? `<div class="tags">${it.tags.slice(0,6).map(t=>`<span class="tag">#${escapeHTML(t)}</span>`).join("")}</div>` : ""}
          <div class="cta">
            ${hasCoords ? `<a class="chip" target="_blank" href="${mapsLink(it.lat,it.lng)}">Cómo llegar</a>` : ""}
            ${locateBtn}
            ${callBtn}
            ${webBtn}
            ${focusBtn}
          </div>
        </div>`;

      card.querySelector('[data-focus]')?.addEventListener('click', ()=>{
        focusOn(it.id);
        window.scrollTo({top:0, behavior:"smooth"});
      });
      card.querySelector('[data-locate]')?.addEventListener('click', ()=> startLocating(it.id));
      list.appendChild(card);
    });
  }

  drawMarkers(results);
}

// ---------- Mapa ----------
function initMap(){
  const ready = () => typeof L !== "undefined";
  if (!ready()) { const t = setInterval(()=>{ if (ready()){ clearInterval(t); initMap(); } }, 50); return; }

  state.map = L.map('map', { zoomControl: true, scrollWheelZoom: true }).setView([-39.2, -71.81], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(state.map);
  state.layer = L.layerGroup().addTo(state.map);
  drawMarkers(applyFilters());
  flyToFirst();
}

function drawMarkers(items){
  if (!state.layer) return;
  items = items.filter(i => Number.isFinite(i.lat) && Number.isFinite(i.lng));
  state.layer.clearLayers();
  state.markers = [];

  items.forEach(it=>{
    const html = `
      <div style="min-width:220px">
        <strong>${escapeHTML(it.name)}</strong><br/>
        <small>${it.category}${it.address? " • "+escapeHTML(it.address):""}</small>
      </div>`;
    const marker = L.circleMarker([it.lat, it.lng], {
      radius: 8, color: colorByCategory(it.category), fillColor: colorByCategory(it.category),
      fillOpacity: 0.85, weight: 2
    }).bindPopup(html);
    marker.addTo(state.layer);
    state.markers.push({id: it.id, marker});
  });

  if(items.length){
    const bounds = L.latLngBounds(items.map(i=>[i.lat,i.lng]));
    state.map.fitBounds(bounds, {padding:[24,24]});
  }
}

function focusOn(id){
  const hit = state.markers.find(m=>m.id===id);
  if(hit){
    hit.marker.openPopup();
    state.map.setView(hit.marker.getLatLng(), Math.max(state.map.getZoom(), 15), {animate:true});
  }
}
function flyToFirst(){
  const items = applyFilters().filter(i => Number.isFinite(i.lat) && Number.isFinite(i.lng));
  if(items.length){ state.map.flyTo([items[0].lat, items[0].lng], 14, {duration:.7}); }
}

// ---------- Modo “Ubicar en mapa” ----------
function startLocating(id){
  if (!ADMIN) return; // en producción no se usa
  state.locatingId = id;
  document.body.style.cursor = "crosshair";
  showLocatingUI(true);

  if (state.mapClickHandler) state.map.off('click', state.mapClickHandler);
  state.mapClickHandler = (e) => {
    const { lat, lng } = e.latlng;
    saveCoordsToSeed(id, lat, lng);
    stopLocating();
    render();
  };
  state.map.on('click', state.mapClickHandler);
}
function stopLocating(){
  state.locatingId = null;
  document.body.style.cursor = "default";
  if (state.mapClickHandler) { state.map.off('click', state.mapClickHandler); state.mapClickHandler = null; }
  showLocatingUI(false);
}
function showLocatingUI(on){
  const pill = document.getElementById("locatingPill");
  const hint = document.getElementById("hint");
  if (pill) pill.style.display = on ? "inline-block" : "none";
  if (hint) hint.style.display = on ? "inline-block" : "none";
}
function saveCoordsToSeed(id, lat, lng){
  const idx = state.data.findIndex(x => x.id === id);
  if (idx >= 0) { state.data[idx].lat = lat; state.data[idx].lng = lng; }
  const raw = JSON.parse(localStorage.getItem("app.seed.data") || "[]");
  const j = raw.findIndex(x => x.id === id);
  if (j >= 0) {
    raw[j].coords = { lat, lng };
    localStorage.setItem("app.seed.data", JSON.stringify(raw));
  }
}

// ---------- UI ----------
function setupUI(){
  const input = document.getElementById("q");
  input.addEventListener("input", (e)=>{ state.q = e.target.value; render(); });

  document.querySelectorAll(".chip[data-cat]").forEach(ch=>{
    ch.addEventListener("click", ()=>{
      document.querySelectorAll(".chip[data-cat]").forEach(c=>c.classList.remove("active"));
      ch.classList.add("active");
      state.category = ch.dataset.cat;
      render();
    });
  });

  // Admin buttons (se ocultan si ADMIN=false)
  setupAdminVisibility();

  // Eventos admin
  const addModal = document.getElementById("addModal");
  document.getElementById("btnAdd")?.addEventListener("click", ()=> addModal.showModal());
  document.getElementById("closeModal")?.addEventListener("click", ()=> addModal.close());
  document.getElementById("cancelAdd")?.addEventListener("click", ()=> addModal.close());
  document.getElementById("btnReset")?.addEventListener("click", ()=>{ if(!ADMIN) return; localStorage.clear(); location.reload(); });
  document.getElementById("btnExport")?.addEventListener("click", ()=>{ if(!ADMIN) return; exportFrozenSeed(); });

  // Cancelar “Ubicar” con ESC o clic en la píldora
  document.addEventListener("keydown", (e)=>{ if (e.key === "Escape") stopLocating(); });
  document.getElementById("locatingPill")?.addEventListener("click", stopLocating);

  // Submit del modal (solo si ADMIN)
  document.getElementById("addForm")?.addEventListener("submit", (e)=>{
    if (!ADMIN) return;
    e.preventDefault();
    const fd = new FormData(e.target);
    const item = {
      id: cryptoRandomId(),
      name: (fd.get("name")||"").toString().trim(),
      category: (fd.get("category")||"").toString(),
      address: (fd.get("address")||"").toString().trim(),
      lat: parseFloat(fd.get("lat")), lng: parseFloat(fd.get("lng")),
      phone: (fd.get("phone")||"").toString().trim(),
      url: (fd.get("url")||"").toString().trim(),
      tags: (fd.get("tags")||"").toString().split(",").map(t=>t.trim()).filter(Boolean),
      desc: (fd.get("desc")||"").toString().trim()
    };
    if(!item.name || !item.category || Number.isNaN(item.lat) || Number.isNaN(item.lng)){
      alert("Por favor completa nombre, categoría y coordenadas válidas."); return;
    }
    state.data.push(item); updateCount(); render(); addModal.close(); focusOn(item.id);

    // Guardar en seed original (app.seed.data)
    const TYPE_MAP = {
      "Alojamientos": "alojamiento",
      "Restaurantes": "restaurante",
      "Abastecimiento": "abastecimiento",
      "Actividades Outdoor": "outdoor",
      "Parques": "parque"
    };
    const raw = JSON.parse(localStorage.getItem("app.seed.data") || "[]");
    raw.push({
      id: item.id,
      type: TYPE_MAP[item.category] || "outdoor",
      name: item.name,
      address: item.address,
      coords: { lat: item.lat, lng: item.lng },
      phones: item.phone ? [item.phone] : [],
      social: item.url ? { web: item.url } : {},
      tags: item.tags
    });
    localStorage.setItem("app.seed.data", JSON.stringify(raw));
  });
}

function setupAdminVisibility(){
  const ids = ["btnAdd","btnExport","btnReset","hint","addModal"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = ADMIN ? "" : "none";
  });
  if (!ADMIN) showLocatingUI(false);
}

// ---------- Exportar seed congelado (solo ADMIN) ----------
function exportFrozenSeed(){
  const data = JSON.parse(localStorage.getItem("app.seed.data") || "[]");
  if (!Array.isArray(data) || !data.length) { alert("No hay datos en app.seed.data"); return; }

  const today = new Date();
  const ver = `frozen-${today.toISOString().slice(0,10)}`;

  const file = `// =================== seedData.js (FROZEN) ===================
export const SEED_VERSION = "${ver}";

export const SEED_DATA = ${JSON.stringify(data, null, 2)};

// LocalStorage + versioning (sin geocodificador)
const LS_KEYS = { version: "app.seed.version", data: "app.seed.data" };

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

export async function initSeed() {
  const status = applySeedWithVersioning();
  if (typeof window !== "undefined") {
    window.SEED_VERSION = SEED_VERSION;
    window.SEED_DATA = JSON.parse(localStorage.getItem(LS_KEYS.data) || "[]");
  }
  return status;
}

export function getSeedData() {
  const raw = localStorage.getItem(LS_KEYS.data);
  return raw ? JSON.parse(raw) : [];
}
`;
  const blob = new Blob([file], { type: "text/javascript" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "seedData.js";
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(a.href);
  a.remove();
}

// ---------- Boot ----------
window.addEventListener("DOMContentLoaded", async ()=>{
  await loadDataFromSeed();
  setupUI();
  initMap();
  render();
});

