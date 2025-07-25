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
        <div id="modalDetails"></div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector("#modalCloseBtn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
      });
    } else {
      console.warn("setupModal: Close button not found");
    }

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

    const printsHTML = artwork.prints && Object.keys(artwork.prints).length > 0
      ? `<br><strong>Available Prints:</strong><br>` +
        Object.entries(artwork.prints)
          .map(([key, val]) => `${key} - ${val}`)
          .join("<br>")
      : "";
    const originalHTML = artwork.original
      ? `<br>Original - ${artwork.original}`
      : "";

    modalImg.src = artwork.src || "";
    modalImg.alt = artwork.name || "Artwork image";
    modalTitle.textContent = artwork.name || "Untitled";
    modalDetails.innerHTML = `
      <strong>Date:</strong> ${artwork.date || "Unknown"}<br>
      <strong>Medium:</strong> ${artwork.medium || "Unknown"}<br>
      <strong>Size:</strong> ${artwork.size || "Unknown"}<br>
      ${printsHTML}
      ${originalHTML}
      ${artwork.description ? `<br><strong>Description:</strong> ${artwork.description}` : ""}
    `;

    modal.style.display = "flex";
  } catch (error) {
    console.error("openModal: Error updating modal content", error);
  }
}

async function loadAllArtworks() {
  try {
    const response = await fetch("/json/artworks.json");
    if (!response.ok) throw new Error(`Unable to load artworks data. Status: ${response.status}`);

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

      const printsHTML = art.prints
        ? Object.entries(art.prints)
            .map(
              ([key, val]) =>
                `<button class="print-btn" data-size="${key}" data-price="${val}">
                  ${key} - ${val}
                </button>`
            )
            .join("")
        : "";

      const originalHTML = art.original
        ? `<button class="print-btn original-btn" data-size="Original" data-price="${art.original}">
            Original - ${art.original}
          </button>`
        : "";

      const allButtonsHTML = printsHTML + originalHTML;

      const div = document.createElement("div");
      div.classList.add("myImages");

      div.innerHTML = `
        <img class="myImages" src="${art.src || ""}" alt="${art.name || "Artwork"}" />
        <h2>${art.name || "Untitled"}</h2>
        <h3 style="height: 220px;">
          <br><br>
          ${art.date || "Unknown"}<br>
          ${art.medium || "Unknown"}<br>
          ${art.size || "Unknown"}<br><br>
          <strong>Available Prints:</strong><br>
          ${allButtonsHTML}
        </h3>
        <button class="purchaseBtn">PURCHASE</button>
      `;

      // Only open modal on image click
      div.addEventListener("click", (e) => {
        if (e.target.classList.contains("myImages")) {
          openModal(art);
        }
      });

      // Track selected print
      let selectedPrint = null;

      div.querySelectorAll(".print-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation(); // Prevent triggering div click
          div.querySelectorAll(".print-btn").forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");
          selectedPrint = {
            size: btn.dataset.size,
            price: btn.dataset.price,
          };
        });
      });

      // Handle purchase button click
      const purchaseBtn = div.querySelector(".purchaseBtn");
      if (purchaseBtn) {
        purchaseBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (!selectedPrint) {
            alert("Please select a print or the original before purchasing.");
            return;
          }

          const selectedArtwork = {
            name: art.name || "",
            image: art.src || "",
            date: art.date || "",
            medium: art.medium || "",
            size: art.size || "",
            selectedPrint: selectedPrint,
          };

          try {
            localStorage.setItem("checkoutArtwork", JSON.stringify(selectedArtwork));
            window.location.href = "/checkout/index.html";
          } catch (err) {
            console.error("Error saving checkout data:", err);
            alert("There was a problem processing your purchase. Please try again.");
          }
        });
      } else {
        console.warn("loadAllArtworks: Purchase button missing for artwork", art);
      }

      container.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading artworks:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    setupModal();

    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has("art")) {
      loadAllArtworks();
    }
  } catch (error) {
    console.error("Error in DOMContentLoaded handler:", error);
  }
});
