import { loadHeaderFooter, removeAllAlerts } from "./utils.mjs";
import { initLoginModal } from './login.js';

window.addEventListener('DOMContentLoaded', async () => {
  await loadHeaderFooter();
  removeAllAlerts();
  initLoginModal();
});

document.addEventListener("DOMContentLoaded", () => {
  const artwork = JSON.parse(localStorage.getItem("checkoutArtwork"));

  if (!artwork) {
    const form = document.querySelector(".checkout-form");
    if (form) {
      form.innerHTML = `
        <h2>No artwork selected</h2>
        <p>Please go back and select a print or original before checking out.</p>
      `;
    }
    return;
  }

  // Helper to format currency
  const formatCurrency = (num) =>
    `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Parse the price number from string (e.g. "$123.45")
  const originalPrice = parseFloat(artwork.selectedPrint.price.replace(/[^0-9.]/g, ""));
  const discountRate = 0.20;
  const today = new Date();
  const isWeekend = today.getDay() === 0 || today.getDay() === 6; // Sunday=0, Saturday=6

  let discountAmount = 0;
  let discountedPrice = originalPrice;

  if (isWeekend) {
    discountAmount = originalPrice * discountRate;
    discountedPrice = originalPrice - discountAmount;
    const discountEl = document.getElementById("discount");
    if (discountEl) discountEl.textContent = `- ${formatCurrency(discountAmount)}`;
  } else {
    const discountEl = document.getElementById("discount");
    if (discountEl) discountEl.textContent = "- $0.00";
  }

  // Fixed shipping fee
  const shippingCost = 5;

  // Calculate tax on discounted price
  const tax = discountedPrice * 0.07;

  // Calculate final total
  const total = discountedPrice + shippingCost + tax;

  // Update UI with prices
  const cartTotalEl = document.getElementById("cartTotal");
  if (cartTotalEl) cartTotalEl.textContent = formatCurrency(discountedPrice);

  const shippingEl = document.getElementById("shipping");
  if (shippingEl) shippingEl.textContent = formatCurrency(shippingCost);

  const taxEl = document.getElementById("tax");
  if (taxEl) taxEl.textContent = formatCurrency(tax);

  const orderTotalEl = document.getElementById("orderTotal");
  if (orderTotalEl) orderTotalEl.textContent = formatCurrency(total);

  // Display artwork summary
  const summarySection = document.querySelector(".checkout-summary");
  if (summarySection) {
    const artDiv = document.createElement("div");
    artDiv.style.marginBottom = "1em";
    artDiv.style.textAlign = "center";
    artDiv.innerHTML = `
      <img src="${artwork.image}" alt="${artwork.name}" style="margin-top: 20px; max-width: 400px; border: 4px solid black;" />
      <p>
        <strong>${artwork.name}</strong><br>
        ${artwork.medium}, ${artwork.date}<br>
        Size: ${artwork.selectedPrint.size} - ${artwork.selectedPrint.price}
      </p>
    `;
    summarySection.parentNode.insertBefore(artDiv, summarySection);
  }
});

// Checkout form submission
const checkoutForm = document.querySelector("form[name='checkout']");
if (checkoutForm) {
  checkoutForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const fname = document.getElementById('fname').value.trim();
    const lname = document.getElementById('lname').value.trim();
    const zip = document.getElementById('zip').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const expiration = document.getElementById('expiration').value.trim();
    const code = document.getElementById('code').value.trim();

    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(zip)) {
      alert("Please enter a valid ZIP code.");
      return;
    }

    const cardRegex = /^\d{13,19}$/;
    if (!cardRegex.test(cardNumber.replace(/\s+/g, ''))) {
      alert("Please enter a valid card number.");
      return;
    }

    const expRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2}|[0-9]{4})$/;
    if (!expRegex.test(expiration)) {
      alert("Please enter a valid expiration date (MM/YY).");
      return;
    }

    let month, year;
    if (expiration.includes('/')) {
      [month, year] = expiration.split('/');
    } else {
      month = expiration.substring(0,2);
      year = expiration.substring(2);
    }

    const expYear = year.length === 2 ? `20${year}` : year;
    const expMonth = parseInt(month, 10) - 1;
    const expDate = new Date(expYear, expMonth + 1, 0);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (expDate < today) {
      alert("Your card is expired.");
      return;
    }

    const cvvRegex = /^\d{3,4}$/;
    if (!cvvRegex.test(code)) {
      alert("Please enter a valid security code.");
      return;
    }

    // Proceed with submission
    console.log("Checkout submitted. Redirecting to success page...");
    window.location.href = "/checkout/success.html";
  });
}
