import { loadHeaderFooter, getParam } from "./utils.mjs";
import { initLoginModal } from './login.js';
import loadAlerts from "./alerts.mjs";
import artworkDetails from "./artwork-details.mjs";

window.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadHeaderFooter();
    loadAlerts();
    initLoginModal();
  } catch (error) {
    console.error("Error during initial load:", error);
  }
});

const artworkId = getParam("art");
if (artworkId) {
  try {
    artworkDetails(artworkId);
  } catch (error) {
    console.error("Error loading artwork details:", error);
  }
}

function setupModal() {
  let modal = document.querySelector("#artworkModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "artworkModal";
    Object.assign(modal.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.8)",
      display: "none",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "1000",
    });

    modal.innerHTML = `
      <div style="
        color: white;
        padding: 20px; 
        max-width: 90vw; 
        max-height: 90vh; 
        overflow-y: auto; 
        position: relative;
        border: 1px solid white;
        animation-name: zoom;
        animation-duration: 0.6s;
        background-color: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(3px);
      ">
        <button id="modalCloseBtn" style="
          color: white;
          font-size: 18px;
          background: transparent;
          border: none;
          cursor: pointer;
        ">✕</button>
        <img id="modalImg" src="" alt="" style="max-width: 100%; height: auto; display: block; margin-bottom: 1em; border: 5px solid black;" />
        <h2 id="modalTitle" style="color: white;"></h2>
        <p id="modalDetails"></p>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal on button click
    const closeBtn = modal.querySelector("#modalCloseBtn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
      });
    } else {
      console.warn("setupModal: Close button not found");
    }

    // Close modal when clicking outside modal content
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });
  }
}

function openModal(artwork) {
  if (!artwork || typeof artwork !== "object") {
    console.warn("openModal: Invalid artwork object");
    return;
  }

  const modal = document.querySelector("#artworkModal");
  if (!modal) {
    console.warn("openModal: Modal element not found");
    return;
  }

  try {
    const modalImg = modal.querySelector("#modalImg");
    const modalTitle = modal.querySelector("#modalTitle");
    const modalDetails = modal.querySelector("#modalDetails");

    if (!modalImg || !modalTitle || !modalDetails) {
      console.warn("openModal: Modal sub-elements missing");
      return;
    }

    modalImg.src = artwork.src || "";
    modalImg.alt = artwork.name || "Artwork image";
    modalTitle.textContent = artwork.name || "Untitled";

    modalDetails.innerHTML = `
      <strong>Date:</strong> ${artwork.date || "Unknown"}<br>
      <strong>Medium:</strong> ${artwork.medium || "Unknown"}<br>
      <strong>Size:</strong> ${artwork.size || "Unknown"}<br>
      ${artwork.description ? `<strong>Description:</strong> ${artwork.description}` : ""}
    `;

    modal.style.display = "flex";
  } catch (error) {
    console.error("openModal: Error displaying modal content", error);
  }
}

async function loadAllArtworks() {
  try {
    const response = await fetch("/json/artworks.json");
    if (!response.ok) throw new Error(`Unable to load artworks data, status: ${response.status}`);

    const artworks = await response.json();
    if (!Array.isArray(artworks)) {
      console.error("loadAllArtworks: artworks.json did not return an array");
      return;
    }

    const container = document.querySelector(".home-grid");
    if (!container) {
      console.error("loadAllArtworks: No container element found with class 'home-grid'");
      return;
    }

    container.innerHTML = "";

    artworks.forEach((art) => {
      if (!art || typeof art !== "object") {
        console.warn("loadAllArtworks: Invalid artwork item skipped", art);
        return;
      }

      const div = document.createElement("div");
      div.classList.add("myImages");

      div.innerHTML = `
        <img class="myImages" src="${art.src || ""}" alt="${art.name || "Artwork"}" />
        <h2>${art.name || "Untitled"}</h2>
        <h3>
          ...<br><br>
          ${art.date || "Unknown"}<br>
          ${art.medium || "Unknown"}<br>
          ${art.size || "Unknown"}
        </h3>
      `;

      div.addEventListener("click", () => {
        openModal(art);
      });

      container.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading artworks:", err);
  }
}

// Initialize modal and load artworks if no "art" param
document.addEventListener("DOMContentLoaded", () => {
  try {
    setupModal();

    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has("art")) {
      loadAllArtworks();
    }
  } catch (error) {
    console.error("Error during DOMContentLoaded event handler:", error);
  }
});
