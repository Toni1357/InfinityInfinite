// === Configuration ===
const baseElements = ["💧 Eau", "🔥 Feu", "🌍 Terre", "💨 Air"];
let selected = [];
let discovered = new Set();
let combinations = [];
let searchText = "";
let isDevMode = false;

// === Chargement des combinaisons ===
fetch("combinations.json")
  .then(res => res.json())
  .then(data => {
    combinations = data;
    loadDiscoveries();
    renderBaseElements();
    renderDiscoveryMenu();
  });

// === Fonctions principales ===
function selectElement(element) {
  if (selected.length < 2) {
    selected.push(element);
    renderBaseElements();
    renderCombination();
    if (selected.length === 2) checkCombination();
  }
}

function clearSelection() {
  selected = [];
  renderBaseElements();
  renderCombination();
}

function checkCombination() {
  const sorted = [...selected].sort();
  const combo = combinations.find(c =>
    [...c.elements].sort().join() === sorted.join()
  );

  if (combo) {
    showResult(combo.result);
    if (!discovered.has(combo.result)) {
      discovered.add(combo.result);
      saveDiscoveries();
      SoundManager.playSound("discover.mp3");
      showParticles();
    } else {
      SoundManager.playSound("success.mp3");
    }
  } else {
    showResult("❌ Aucune réaction");
    SoundManager.playSound("fail.mp3");
  }

  // Supprimer les éléments sélectionnés après chaque tentative
  selected = [];

  setTimeout(() => {
    showResult("");
    renderBaseElements();
    renderCombination();
    renderDiscoveryMenu();
  }, 1500);
}

function showResult(text) {
  document.getElementById("result").textContent = text;
}

function showParticles() {
  const left = document.getElementById("particles-left");
  const right = document.getElementById("particles-right");
  left.classList.add("active");
  right.classList.add("active");
  setTimeout(() => {
    left.classList.remove("active");
    right.classList.remove("active");
  }, 1500);
}

// === Découvertes ===
function saveDiscoveries() {
  localStorage.setItem("discoveries", JSON.stringify([...discovered]));
}

function loadDiscoveries() {
  const saved = JSON.parse(localStorage.getItem("discoveries") || "[]");
  discovered = new Set(saved);
}

function resetDiscoveries() {
  if (confirm("Voulez-vous vraiment réinitialiser les découvertes ?")) {
    discovered.clear();
    saveDiscoveries();
    renderDiscoveryMenu();
  }
}

// === Mode développeur ===
function toggleDevMode() {
  if (isDevMode) {
    showDevMenu();
  } else {
    const code = prompt("Entrez le code développeur");
    const encoded = btoa(code);
    if (encoded === "MTJTYXVjaXNzZXMzNA==") {
      isDevMode = true;
      showDevMenu();
    } else {
      alert("Code incorrect");
    }
  }
}

function showDevMenu() {
  const action = prompt("Mode développeur activé :\n1. Tout découvrir\n2. Désactiver");
  if (action === "1") {
    combinations.forEach(c => discovered.add(c.result));
    saveDiscoveries();
    renderDiscoveryMenu();
  } else if (action === "2") {
    isDevMode = false;
  }
}

// === Rendu HTML ===
function renderBaseElements() {
  const container = document.getElementById("base-elements");
  container.innerHTML = "";
  baseElements.forEach(el => {
    if (!selected.includes(el)) {
      const btn = document.createElement("button");
      btn.textContent = el;
      btn.className = selected.includes(el) ? "selected" : "";
      btn.onclick = () => selectElement(el);
      container.appendChild(btn);
    }
  });
}

function renderCombination() {
  const container = document.getElementById("selected-elements");
  container.innerHTML = "";
  selected.forEach(el => {
    const span = document.createElement("span");
    span.textContent = el;
    container.appendChild(span);
  });
}

function renderDiscoveryMenu() {
  const container = document.getElementById("discoveries");
  container.innerHTML = "";

  const filtered = [...discovered].filter(d =>
    d.toLowerCase().includes(searchText.toLowerCase())
  ).sort();

  if (filtered.length === 0) {
    container.textContent = searchText ? `Aucun résultat pour "${searchText}"` : "Aucune découverte encore";
    return;
  }

  filtered.forEach(item => {
    const btn = document.createElement("button");
    btn.textContent = item;
    btn.onclick = () => selectElement(item);
    container.appendChild(btn);
  });

  document.getElementById("total-combos").textContent = combinations.length;
}

// === Barre de recherche ===
document.getElementById("search").addEventListener("input", e => {
  searchText = e.target.value;
  renderDiscoveryMenu();
});

// === Boutons ===
document.getElementById("clear-btn").onclick = clearSelection;
document.getElementById("reset-btn").onclick = resetDiscoveries;
document.getElementById("dev-btn").onclick = toggleDevMode;

// === Sons ===
class SoundManager {
  static playSound(name) {
    const audio = new Audio(`sons/${name}`);
    audio.play().catch(() => {});
  }
}
