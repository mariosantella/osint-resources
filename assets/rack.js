// rack.js — frontend OSINT Rack renderer (inline category layout)

const DATA_URL = "https://raw.githubusercontent.com/mariosantella/osint-resources/main/data/resources.json?nocache=" + Date.now();

fetch(DATA_URL)
  .then(res => res.json())
  .then(renderRack)
  .catch(err => {
    console.error("Failed to load OSINT resources:", err);
    document.getElementById("accordion-container").innerText = "Failed to load tools.";
  });

function renderRack(resources) {
  const latest = resources.slice(0, 5);
  const dead = resources.filter(r => !r.url).slice(0, 5);

  // Latest
  const latestContainer = document.getElementById("latest-tools");
  latest.forEach(r => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${r.url}" target="_blank" class="text-blue-600 hover:underline">${r.title}</a>`;
    latestContainer.appendChild(li);
  });

  // Dead
  const deadContainer = document.getElementById("dead-tools");
  dead.forEach(r => {
    const li = document.createElement("li");
    li.innerText = r.title;
    deadContainer.appendChild(li);
  });

  // Inline Category Grid Rendering
  const grouped = {};
  resources.forEach(r => {
    if (r.categories.length === 0) return;
    const group = decodeHTMLEntities(r.categories[0]);
    const subgroup = decodeHTMLEntities(r.categories[1] || "Misc");

    if (!grouped[group]) grouped[group] = {};
    if (!grouped[group][subgroup]) grouped[group][subgroup] = [];

    grouped[group][subgroup].push(r);
  });

  const accContainer = document.getElementById("accordion-container");
  Object.entries(grouped).forEach(([group, subs]) => {
    const groupWrapper = document.createElement("div");
    groupWrapper.className = "mb-10";

    const groupTitle = document.createElement("h3");
    groupTitle.className = "text-xl font-bold mb-4 text-gray-800";
    groupTitle.innerText = group;
    groupWrapper.appendChild(groupTitle);

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

    Object.entries(subs).forEach(([sub, tools]) => {
      const card = document.createElement("div");
      card.className = "bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col";

      const cardTitle = document.createElement("h4");
      cardTitle.className = "font-semibold text-sm mb-2 text-gray-900";
      cardTitle.innerText = sub;

      const ul = document.createElement("ul");
      ul.className = "space-y-1 text-sm text-gray-700";

      tools.forEach(t => {
        const li = document.createElement("li");
        const hasTooltip = t.tooltip && t.tooltip.length > 2;

        li.innerHTML = `
          <a href="${t.url}" target="_blank" class="text-blue-600 hover:underline">
            ${t.title}
          </a>
          ${hasTooltip ? `
            <span class="ml-1 text-gray-500 text-xs hidden sm:inline-block" title="${t.tooltip}">ⓘ</span>
            <button class="ml-1 text-gray-400 text-xs sm:hidden" onclick="alert('${t.tooltip.replace(/'/g, "\'")}')">ⓘ</button>
          ` : ""}
        `;
        ul.appendChild(li);
      });

      card.appendChild(cardTitle);
      card.appendChild(ul);
      grid.appendChild(card);
    });

    groupWrapper.appendChild(grid);
    accContainer.appendChild(groupWrapper);
  });
}

function decodeHTMLEntities(str) {
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}
