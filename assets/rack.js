// rack.js — frontend OSINT Rack renderer

const DATA_URL = "https://raw.githubusercontent.com/mariosantella/osint-resources/main/data/resources.json";

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

  // Accordion
  const grouped = {};
  resources.forEach(r => {
    if (r.categories.length === 0) return;
    const group = r.categories[0];
    const subgroup = r.categories[1] || "Misc";

    if (!grouped[group]) grouped[group] = {};
    if (!grouped[group][subgroup]) grouped[group][subgroup] = [];

    grouped[group][subgroup].push(r);
  });

  const accContainer = document.getElementById("accordion-container");
  Object.entries(grouped).forEach(([group, subs]) => {
    const wrapper = document.createElement("div");
    wrapper.className = "border rounded shadow-sm";

    const header = document.createElement("button");
    header.className = "w-full text-left font-bold p-4 bg-gray-100 hover:bg-gray-200";
    header.innerText = group;

    const subWrapper = document.createElement("div");
    subWrapper.className = "p-4 hidden";

    Object.entries(subs).forEach(([sub, tools]) => {
      const subTitle = document.createElement("h4");
      subTitle.className = "font-semibold mb-2 mt-4";
      subTitle.innerText = sub;

      const ul = document.createElement("ul");
      ul.className = "space-y-1";

      tools.forEach(t => {
        const li = document.createElement("li");
        const hasTooltip = t.tooltip && t.tooltip.length > 2;

        li.innerHTML = `
          <a href="${t.url}" target="_blank" class="text-blue-600 hover:underline">
            ${t.title}
          </a>
          ${hasTooltip ? `
            <span class="ml-1 text-gray-500 text-sm hidden sm:inline-block" title="${t.tooltip}">ⓘ</span>
            <button class="ml-1 text-gray-400 text-xs sm:hidden" onclick="alert('${t.tooltip.replace(/'/g, "\'")}')">ⓘ</button>
          ` : ""}
        `;
        ul.appendChild(li);
      });

      subWrapper.appendChild(subTitle);
      subWrapper.appendChild(ul);
    });

    header.addEventListener("click", () => {
      subWrapper.classList.toggle("hidden");
    });

    wrapper.appendChild(header);
    wrapper.appendChild(subWrapper);
    accContainer.appendChild(wrapper);
  });
}