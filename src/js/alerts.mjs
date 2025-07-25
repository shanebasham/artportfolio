export default async function loadAlerts() {
  // Check if it's Saturday (6) or Sunday (0)
  const today = new Date();
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;
  if (!isWeekend) return; // Exit early if not weekend

  try {
    const response = await fetch("/json/alerts.json");
    if (!response.ok) throw new Error("Failed to load alerts");
    const alerts = await response.json();

    if (!Array.isArray(alerts) || alerts.length === 0) return;

    const section = document.createElement("h1");
    section.classList.add("alert-list");

    alerts.forEach(alert => {
      const p = document.createElement("p");
      p.textContent = alert.message;
      p.style.background = alert.background || "black";
      p.style.color = alert.color || "white";
      p.style.position = "fixed";
      p.style.top = "0";
      p.style.left = "0";
      p.style.width = "100%";
      p.style.padding = "15px";
      p.style.margin = "0";
      section.appendChild(p);
    });

    const body = document.querySelector("body");
    if (body) {
      body.prepend(section);
    }
  } catch (err) {
    console.error("Error loading alerts:", err);
  }
}