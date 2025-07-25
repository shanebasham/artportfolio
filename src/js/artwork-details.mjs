export default async function artworkDetails(artId) {
  try {
    const response = await fetch("/json/artworks.json");
    if (!response.ok) throw new Error("Unable to load artworks data.");

    const artworks = await response.json();
    const art = artworks.find(item => item.Id === artId);

    if (!art) {
      document.querySelector(".artwork-detail").innerHTML = "<p>Artwork not found.</p>";
      return;
    }

    // Populate the page
    document.getElementById("artworkName").textContent = art.name;
    document.getElementById("artworkImage").src = art.src;
    document.getElementById("artworkImage").alt = art.name;
    document.getElementById("artworkDate").textContent = `Date: ${art.date}`;
    document.getElementById("artworkMedium").textContent = `Medium: ${art.medium}`;
    document.getElementById("artworkSize").textContent = `Size: ${art.size}`;
    document.getElementById("artworkDescription").textContent = art.description || "";
  } catch (err) {
    console.error("Error loading artwork details:", err);
  }
}

