// rack.js — new generation of the OSINT Rack frontend

const DATA_URL = "https://raw.githubusercontent.com/mariosantella/osint-resources/main/data/resources.json?v=" + Date.now();

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
    li.textContent = r.title;
    deadContainer.appendChild(li);
  });

  // Categories
  const grouped = {};
  resources.forEach(r => {
    if (!r.categories || r.categories.length === 0) return;
    const group = decodeHTMLEntities(r.categories[0]);
    const subgroup = decodeHTMLEntities(r.categories[1] || "Misc");

    if (!grouped[group]) grouped[group] = {};
    if (!grouped[group][subgroup]) grouped[group][subgroup] = [];

    grouped[group][subgroup].push(r);
  });

  const accContainer = document.getElementById("accordion-container");

  Object.entries(grouped).forEach(([group, subs]) => {
    const section = document.createElement("section");
    section.className = "bg-gray-100 rounded-lg p-4 mb-4 break-inside-avoid";

    const header = document.createElement("h3");
    header.className = "text-lg font-bold mb-2 text-gray-700";
    header.textContent = group;
    section.appendChild(header);

    Object.entries(subs).forEach(([sub, tools]) => {
      const subTitle = document.createElement("h4");
      subTitle.className = "font-semibold text-sm mb-1 mt-2 text-gray-600";
      subTitle.textContent = sub;
      section.appendChild(subTitle);

      const ul = document.createElement("ul");
      ul.className = "mb-2 space-y-1";

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
          ` : ""}`;

        ul.appendChild(li);
      });

      section.appendChild(ul);
    });

    accContainer.appendChild(section);
  });

  Macy({
    container: '#accordion-container',
    columns: 1,
    breakAt: {
      640: 1,
      768: 2,
      1024: 3,
      1280: 4,
    },
    margin: {
      x: 24,
      y: 24
    }
  });
}

function decodeHTMLEntities(str) {
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}
