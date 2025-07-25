// wrapper for querySelector...returns matching element or null with warning
export function qs(selector, parent = document) {
  if (typeof selector !== "string") {
    console.warn("qs: selector must be a string");
    return null;
  }
  const el = parent.querySelector(selector);
  if (!el) {
    console.warn(`qs: No element found for selector "${selector}"`);
    return null;
  }
  return el;
}

// retrieve data from localstorage with JSON parse and error handling
export function getLocalStorage(key) {
  if (typeof key !== "string") {
    console.warn("getLocalStorage: key must be a string");
    return null;
  }
  try {
    const item = localStorage.getItem(key);
    if (item === null) return null;
    return JSON.parse(item);
  } catch (error) {
    console.error(`getLocalStorage: Failed to parse JSON for key "${key}"`, error);
    return null;
  }
}

// save data to local storage with error handling
export function setLocalStorage(key, data) {
  if (typeof key !== "string") {
    console.warn("setLocalStorage: key must be a string");
    return;
  }
  try {
    const json = JSON.stringify(data);
    localStorage.setItem(key, json);
  } catch (error) {
    console.error(`setLocalStorage: Failed to save key "${key}"`, error);
  }
}

// set a listener for both touchend and click, safely
export function setClick(selector, callback) {
  if (typeof callback !== "function") {
    console.warn("setClick: callback must be a function");
    return;
  }
  const el = qs(selector);
  if (!el) {
    console.warn(`setClick: No element found for selector "${selector}"`);
    return;
  }
  el.addEventListener("touchend", (event) => {
    event.preventDefault();
    callback(event);
  });
  el.addEventListener("click", (event) => {
    callback(event);
  });
}

// render a list with a template function, sorting and clearing options
export function renderListWithTemplate(
  templateFn,
  parentElement,
  list,
  sort = "price",
  position = "afterbegin",
  clear = true
) {
  if (typeof templateFn !== "function") {
    console.warn("renderListWithTemplate: templateFn must be a function");
    return;
  }
  if (!(parentElement instanceof Element)) {
    console.warn("renderListWithTemplate: parentElement must be a DOM Element");
    return;
  }
  if (!Array.isArray(list)) {
    console.warn("renderListWithTemplate: list must be an array");
    return;
  }

  if (clear) {
    parentElement.innerHTML = "";
  }

  try {
    if (sort === "price") {
      list.sort((a, b) => (b.FinalPrice || 0) - (a.FinalPrice || 0));
    } else if (sort === "name") {
      list.sort((a, b) => {
        const nameA = a.NameWithoutBrand || "";
        const nameB = b.NameWithoutBrand || "";
        return nameA.localeCompare(nameB);
      });
    }

    const htmlString = list.map(templateFn);
    parentElement.insertAdjacentHTML(position, htmlString.join(""));
  } catch (error) {
    console.error("renderListWithTemplate: Error rendering list", error);
  }
}

// render with template function asynchronously, with optional callback
export async function renderWithTemplate(
  templateFn,
  parentElement,
  data,
  callback,
  position = "afterbegin",
  clear = true
) {
  if (typeof templateFn !== "function") {
    console.warn("renderWithTemplate: templateFn must be a function");
    return;
  }
  if (!(parentElement instanceof Element)) {
    console.warn("renderWithTemplate: parentElement must be a DOM Element");
    return;
  }
  if (callback && typeof callback !== "function") {
    console.warn("renderWithTemplate: callback must be a function if provided");
    callback = null;
  }

  if (clear) {
    parentElement.innerHTML = "";
  }

  try {
    const htmlString = await templateFn(data);
    if (typeof htmlString !== "string") {
      console.warn("renderWithTemplate: templateFn did not return a string");
      return;
    }
    parentElement.insertAdjacentHTML(position, htmlString);
    if (callback) {
      callback(data);
    }
  } catch (error) {
    console.error("renderWithTemplate: Error rendering template", error);
  }
}

// load a template by fetching a path, returns async function
function loadTemplate(path) {
  if (typeof path !== "string") {
    console.warn("loadTemplate: path must be a string");
    return async () => "";
  }
  return async function () {
    try {
      const res = await fetch(path);
      if (res.ok) {
        const html = await res.text();
        return html;
      } else {
        console.warn(`loadTemplate: Failed to fetch template at "${path}", status: ${res.status}`);
        return "";
      }
    } catch (error) {
      console.error(`loadTemplate: Network error fetching template at "${path}"`, error);
      return "";
    }
  };
}

// load header and footer partials safely
export async function loadHeaderFooter() {
  const headerTemplateFn = loadTemplate("/partials/header.html");
  const footerTemplateFn = loadTemplate("/partials/footer.html");
  const headerEl = document.querySelector("#main-header");
  const footerEl = document.querySelector("#main-footer");

  try {
    if (headerEl) {
      headerEl.innerHTML = "";
      await renderWithTemplate(headerTemplateFn, headerEl);
    } else {
      console.warn("loadHeaderFooter: #main-header element not found");
    }

    if (footerEl) {
      footerEl.innerHTML = "";
      await renderWithTemplate(footerTemplateFn, footerEl);
    } else {
      console.warn("loadHeaderFooter: #main-footer element not found");
    }
  } catch (error) {
    console.error("loadHeaderFooter: Error loading header/footer", error);
  }
}

// display an alert message that can be dismissed
export function alertMessage(message, scroll = true, duration = 3000) {
  if (typeof message !== "string") {
    console.warn("alertMessage: message must be a string");
    return;
  }
  const main = document.querySelector("main");
  if (!main) {
    console.warn("alertMessage: <main> element not found");
    return;
  }

  const alert = document.createElement("div");
  alert.classList.add("alert");
  alert.innerHTML = `<p>${message}</p><span>X</span>`;

  alert.addEventListener("click", function (e) {
    if (e.target.tagName === "SPAN") {
      if (alert.parentElement) {
        alert.parentElement.removeChild(alert);
      }
    }
  });

  main.prepend(alert);

  if (scroll) window.scrollTo(0, 0);

  if (typeof duration === "number" && duration > 0) {
    setTimeout(() => {
      if (alert.parentElement) {
        alert.parentElement.removeChild(alert);
      }
    }, duration);
  }
}

// remove all alerts from main element
export function removeAllAlerts() {
  const main = document.querySelector("main");
  if (!main) {
    console.warn("removeAllAlerts: <main> element not found");
    return;
  }
  const alerts = main.querySelectorAll(".alert");
  alerts.forEach((alert) => {
    if (alert.parentElement) {
      alert.parentElement.removeChild(alert);
    }
  });
}

// get URL parameter by name, returns string or null
export function getParam(param) {
  if (typeof param !== "string") {
    console.warn("getParam: param must be a string");
    return null;
  }
  try {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  } catch (error) {
    console.error("getParam: Error parsing URL parameters", error);
    return null;
  }
}
