// src/main.js
import { initSeed, getSeedData } from "./data/seedData.js";

// ---------- Estado ----------
const state = { data: [], q: "", category: "all", markers: [], map: null, layer: null };

// ---------- Adaptador: seed -> formato UI ----------
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
    desc: "" // opcional; tu seed no trae descripción
  };
}

// ---------- Utilidades ----------
function cryptoRandomId(){ return (crypto.randomUUID?.() ?? `id-${Math.random().toString(36).slice(2,10)}`); }
function phoneLink(p){ if(!p) return null; return `tel:${p.replace(/[^\d+]/g,'')}`; }
function mapsLink(lat,lng){ return `https://www.google.com/maps?q=${lat},${lng}`; }
function iconEmoji(category){
  return { "Alojamientos":"🏡","Restaurantes":"🍽️","Abastecimiento":"🛒","Actividades Outdoor":"🛶","Parques":"🌲" }[category] || "📍";
}
function colorByCategory(category){
  return { "Alojamientos":"#80ffdb","Restaurantes":"#ffd166","Abastecimiento":"#cdb4db","Actividades Outdoor":"#90e0ef","Parques":"#a0ffa0","default":"#9db0ff" }[category] || "#9db0ff";
}
function escapeHTML(s){ return (s??"").toString().replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

// ---------- Carga de datos desde seed ----------
async function loadDataFromSeed(){
  const status = await initSeed();        // aplica autoreset + lanza geocoder en background
  console.info("[seed] init:", status);

  const raw = getSeedData();              // lee array del localStorage
  state.data = raw
    .map(adaptSeedItem)
    .filter(x => Number.isFinite(x.lat) && Number.isFinite(x.lng));
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
    list.innerHTML = `<div class="empty">No hay resultados. Prueba con otra búsqueda o categoría.</div>`;
  } else {
    results.sort((a,b)=> a.name.localeCompare(b.name, 'es')).forEach(it=>{
      const card = document.createElement("article");
      card.className = "card";
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
            <a class="chip" target="_blank" href="${mapsLink(it.lat,it.lng)}">Cómo llegar</a>
            ${it.phone ? `<a class="chip ghost" href="${phoneLink(it.phone)}">Llamar</a>` : ""}
            ${it.url ? `<a class="chip ghost" target="_blank" href="${it.url}">Sitio / RRSS</a>` : ""}
            <button class="chip ghost" data-focus="${it.id}">Ver en mapa</button>
          </div>
        </div>`;
      card.querySelector('[data-focus]')?.addEventListener('click', ()=>{
        focusOn(it.id);
        window.scrollTo({top:0, behavior:"smooth"});
      });
      list.appendChild(card);
    });
  }

  drawMarkers(results);
}

// ---------- Mapa ----------
function initMap(){
  const ready = () => typeof L !== "undefined";
  if (!ready()) { const t = setInterval(()=>{ if (ready()){ clearInterval(t); initMap(); } }, 50); return; }

  state.map = L.map('map', { zoomControl: true, scrollWheelZoom: true })
    .setView([-39.2, -71.81], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; OpenStreetMap'
  }).addTo(state.map);

  state.layer = L.layerGroup().addTo(state.map);
  drawMarkers(applyFilters());
  flyToFirst();
}

function drawMarkers(items){
  state.layer.clearLayers();
  state.markers = [];
  items.forEach(it=>{
    const html = `
      <div style="min-width:220px">
        <strong>${escapeHTML(it.name)}</strong><br/>
        <small>${it.category}${it.address? " • "+escapeHTML(it.address):""}</small>
        ${it.desc ? `<p style="margin:.5rem 0">${escapeHTML(it.desc)}</p>`:""}
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px">
          <a href="${mapsLink(it.lat,it.lng)}" target="_blank">Cómo llegar</a>
          ${it.phone ? `• <a href="${phoneLink(it.phone)}">Llamar</a>`:""}
          ${it.url ? `• <a href="${it.url}" target="_blank">Web/RRSS</a>`:""}
        </div>
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
  const items = applyFilters();
  if(items.length){ state.map.flyTo([items[0].lat, items[0].lng], 14, {duration:.7}); }
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

  const addModal = document.getElementById("addModal");
  document.getElementById("btnAdd").addEventListener("click", ()=> addModal.showModal());
  document.getElementById("closeModal").addEventListener("click", ()=> addModal.close());
  document.getElementById("cancelAdd").addEventListener("click", ()=> addModal.close());
  document.getElementById("btnReset").addEventListener("click", ()=>{
    localStorage.clear(); location.reload();
  });

  document.getElementById("addForm").addEventListener("submit", (e)=>{
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
    state.data.push(item);
    updateCount();
    render();
    addModal.close();
    focusOn(item.id);
  });
}

// ---------- Boot ----------
window.addEventListener("DOMContentLoaded", async ()=>{
  await loadDataFromSeed();
  setupUI();
  initMap();
  render();

  // Si el geocoder del seed completa coords faltantes, refrescamos
  window.addEventListener("seed:geocoded", () => { loadDataFromSeed().then(render); });
});
