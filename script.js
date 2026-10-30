const sampleData = [
  { area: "Westlands", drug: "Alcohol", count: 68, awareness: 0.62 },
  { area: "Westlands", drug: "Tobacco", count: 33, awareness: 0.56 },
  { area: "Westlands", drug: "Cannabis", count: 24, awareness: 0.49 },
  { area: "Westlands", drug: "Shisha", count: 20, awareness: 0.58 },
  { area: "Kibra", drug: "Alcohol", count: 78, awareness: 0.55 },
  { area: "Kibra", drug: "Tobacco", count: 42, awareness: 0.48 },
  { area: "Kibra", drug: "Cannabis", count: 38, awareness: 0.43 },
  { area: "Kibra", drug: "Shisha", count: 31, awareness: 0.52 },
  { area: "Embakasi", drug: "Alcohol", count: 83, awareness: 0.64 },
  { area: "Embakasi", drug: "Tobacco", count: 50, awareness: 0.57 },
  { area: "Embakasi", drug: "Cannabis", count: 45, awareness: 0.51 },
  { area: "Embakasi", drug: "Shisha", count: 33, awareness: 0.60 },
  { area: "Kasarani", drug: "Alcohol", count: 61, awareness: 0.67 },
  { area: "Kasarani", drug: "Tobacco", count: 43, awareness: 0.60 },
  { area: "Kasarani", drug: "Cannabis", count: 37, awareness: 0.54 },
  { area: "Kasarani", drug: "Shisha", count: 29, awareness: 0.62 },
  { area: "Langata", drug: "Alcohol", count: 55, awareness: 0.71 },
  { area: "Langata", drug: "Tobacco", count: 35, awareness: 0.63 },
  { area: "Langata", drug: "Cannabis", count: 28, awareness: 0.58 },
  { area: "Langata", drug: "Shisha", count: 21, awareness: 0.66 }
];

const areas = ["Westlands", "Kibra", "Embakasi", "Kasarani", "Langata"];
const drugs = ["Alcohol", "Tobacco", "Cannabis", "Shisha"];
const drugColors = ["#1685c3", "#20a677", "#37b9bb", "#8ebc3e"];
const areaColors = ["#1685c3", "#20a677", "#37b9bb", "#8ebc3e", "#e4ad43"];
const areaFilter = document.querySelector("#areaFilter");
const drugFilter = document.querySelector("#drugFilter");
let drugChart;
let areaChart;

function fillSelect(select, values) {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

fillSelect(areaFilter, areas);
fillSelect(drugFilter, drugs);

function getFilteredData() {
  return sampleData.filter((row) => {
    const areaMatches = areaFilter.value === "all" || row.area === areaFilter.value;
    const drugMatches = drugFilter.value === "all" || row.drug === drugFilter.value;
    return areaMatches && drugMatches;
  });
}

function sumBy(rows, key, values) {
  return values.map((value) => rows.reduce((total, row) => total + (row[key] === value ? row.count : 0), 0));
}

function makeChartOptions() {
  const dark = document.body.classList.contains("dark-mode");
  const textColor = dark ? "#9aabad" : "#819196";
  const gridColor = dark ? "rgba(218,233,234,.09)" : "rgba(62,95,103,.10)";
  return { dark, textColor, gridColor };
}

function createCharts() {
  if (!window.Chart) {
    document.querySelectorAll(".chart-wrap").forEach((wrap) => {
      wrap.insertAdjacentHTML("beforeend", '<p class="chart-fallback">Charts require an internet connection to load.</p>');
    });
    return;
  }

  const options = makeChartOptions();
  drugChart = new Chart(document.querySelector("#drugChart"), {
    type: "bar",
    data: {
      labels: drugs,
      datasets: [{ data: drugs.map(() => 0), backgroundColor: drugColors, borderRadius: 4, borderSkipped: false, maxBarThickness: 42 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 650, easing: "easeOutQuart" },
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => ` ${context.parsed.y} responses` } } },
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { color: options.textColor, font: { family: "DM Sans", size: 10 } } },
        y: { beginAtZero: true, border: { display: false, dash: [3, 4] }, grid: { color: options.gridColor }, ticks: { color: options.textColor, precision: 0, font: { family: "DM Sans", size: 9 }, padding: 8 } }
      }
    }
  });

  areaChart = new Chart(document.querySelector("#areaChart"), {
    type: "doughnut",
    data: {
      labels: areas,
      datasets: [{ data: areas.map(() => 0), backgroundColor: areaColors, borderColor: getComputedStyle(document.body).getPropertyValue("--surface").trim(), borderWidth: 3, hoverOffset: 5 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "72%",
      animation: { duration: 650, easing: "easeOutQuart" },
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => ` ${context.label}: ${context.parsed} responses` } } }
    }
  });
}

function animateNumber(element, target, suffix = "") {
  const start = Number(element.dataset.current || 0);
  const duration = 550;
  const startTime = performance.now();
  element.dataset.current = String(target);

  function frame(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(start + (target - start) * eased);
    element.textContent = `${value.toLocaleString()}${suffix}`;
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function renderLegend(container, labels, values, colors, showValues = false) {
  container.replaceChildren();
  labels.forEach((label, index) => {
    const item = document.createElement("span");
    item.className = "legend-item";
    const swatch = document.createElement("i");
    swatch.className = "legend-swatch";
    swatch.style.backgroundColor = colors[index];
    const name = document.createElement("span");
    name.textContent = label;
    item.append(swatch, name);
    if (showValues) {
      const value = document.createElement("strong");
      value.className = "legend-value";
      value.textContent = values[index].toLocaleString();
      item.append(value);
    }
    container.append(item);
  });
}

function updateDashboard() {
  const rows = getFilteredData();
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const aware = rows.reduce((sum, row) => sum + row.count * row.awareness, 0);
  const awarenessRate = total ? Math.round((aware / total) * 100) : 0;
  const drugCounts = sumBy(rows, "drug", drugs);
  const areaCounts = sumBy(rows, "area", areas);
  const coveredAreas = areas.filter((area, index) => areaCounts[index] > 0);
  const mostCommonIndex = drugCounts.indexOf(Math.max(...drugCounts));
  const leadingDrug = total && drugCounts[mostCommonIndex] ? drugs[mostCommonIndex] : "—";
  const highestAreaIndex = areaCounts.indexOf(Math.max(...areaCounts));
  const highestArea = total && areaCounts[highestAreaIndex] ? areas[highestAreaIndex] : "—";

  animateNumber(document.querySelector("#peopleKpi"), total);
  animateNumber(document.querySelector("#areasKpi"), coveredAreas.length);
  animateNumber(document.querySelector("#awarenessKpi"), awarenessRate, "%");
  document.querySelector("#commonKpi").textContent = leadingDrug;
  document.querySelector("#commonFoot").textContent = total ? `${drugCounts[mostCommonIndex].toLocaleString()} responses in this view` : "No responses in this view";
  document.querySelector("#donutTotal").textContent = total.toLocaleString();
  document.querySelector("#summaryResponses").textContent = total.toLocaleString();
  document.querySelector("#summaryLeading").textContent = leadingDrug;
  document.querySelector("#summaryArea").textContent = highestArea;
  document.querySelector("#filterNote").textContent = `Showing ${total.toLocaleString()} sample responses`;

  const insight = total
    ? `${leadingDrug} is the most reported substance in this filtered sample. Awareness of support options is ${awarenessRate}%.`
    : "No responses match the selected filters.";
  document.querySelector("#summaryInsight").textContent = insight;

  if (drugChart && areaChart) {
    drugChart.data.datasets[0].data = drugCounts;
    drugChart.update();
    areaChart.data.datasets[0].data = areaCounts;
    areaChart.data.datasets[0].borderColor = getComputedStyle(document.body).getPropertyValue("--surface").trim();
    areaChart.update();
    const chartOptions = makeChartOptions();
    drugChart.options.scales.x.ticks.color = chartOptions.textColor;
    drugChart.options.scales.y.ticks.color = chartOptions.textColor;
    drugChart.options.scales.y.grid.color = chartOptions.gridColor;
    drugChart.update("none");
  }
  renderLegend(document.querySelector("#drugLegend"), drugs, drugCounts, drugColors);
  renderLegend(document.querySelector("#areaLegend"), areas, areaCounts, areaColors, true);
}

function downloadCsv() {
  const rows = getFilteredData();
  const lines = ["Area,Drug Type,Responses,Awareness Rate", ...rows.map((row) => [row.area, row.drug, row.count, `${Math.round(row.awareness * 100)}%`].join(","))];
  const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "nairobi-drug-prevention-sample-data.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark-mode");
  const toggle = document.querySelector("#themeToggle");
  toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  toggle.title = isDark ? "Switch to light mode" : "Switch to dark mode";
  localStorage.setItem("nairobi-dashboard-theme", isDark ? "dark" : "light");
  if (drugChart && areaChart) {
    const options = makeChartOptions();
    drugChart.options.scales.x.ticks.color = options.textColor;
    drugChart.options.scales.y.ticks.color = options.textColor;
    drugChart.options.scales.y.grid.color = options.gridColor;
    areaChart.data.datasets[0].borderColor = getComputedStyle(document.body).getPropertyValue("--surface").trim();
    drugChart.update();
    areaChart.update();
  }
}

const savedTheme = localStorage.getItem("nairobi-dashboard-theme");
if (savedTheme === "dark") document.body.classList.add("dark-mode");

areaFilter.addEventListener("change", updateDashboard);
drugFilter.addEventListener("change", updateDashboard);
document.querySelector("#clearFilters").addEventListener("click", () => {
  areaFilter.value = "all";
  drugFilter.value = "all";
  updateDashboard();
});
document.querySelector("#themeToggle").addEventListener("click", toggleTheme);
document.querySelector("#downloadCsv").addEventListener("click", downloadCsv);
document.querySelector("#exportPdf").addEventListener("click", () => window.print());

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  });
});

createCharts();
updateDashboard();
