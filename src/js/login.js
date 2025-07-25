export function initLoginModal() {
  console.log("initLoginModal called");

  const loginBtn = document.getElementById("loginBtn");
  const modal = document.getElementById("id01");
  const cancelBtn = document.getElementById("cancelBtn");
  const loginForm = document.getElementById("loginForm");
  const unameInput = document.getElementById("uname");
  const pswInput = document.getElementById("psw");
  const rememberCheckbox = document.getElementById("remember");
  const authContainer = document.getElementById("authContainer");

  const loginFormContainer = document.getElementById("loginFormContainer");
  const createAccountFormContainer = document.getElementById("createAccountFormContainer");
  const showCreateAccountBtn = document.getElementById("showCreateAccountBtn");
  const showLoginBtn = document.getElementById("showLoginBtn");
  const cancelCreateAccountBtn = document.getElementById("cancelCreateAccountBtn");
  const createAccountForm = document.getElementById("createAccountForm");

  if (!modal || !loginBtn || !cancelBtn || !loginForm || !unameInput || !pswInput || !rememberCheckbox || !authContainer) {
    console.warn("initLoginModal: Required elements missing, aborting init");
    return;
  }

  // Load auth status from storage
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  const username = localStorage.getItem("username") || sessionStorage.getItem("username");
  updateLoginUI(username);

  // Show modal on login button click
  loginBtn.addEventListener("click", () => {
    modal.style.display = "block";
  });

  cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // LOGIN FORM SUBMIT
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const loginInput = unameInput.value.trim(); // could be username or email
    const password = pswInput.value.trim();
    const remember = rememberCheckbox.checked;

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const user = users.find(
      (u) =>
        (u.username === loginInput || u.email === loginInput) &&
        u.password === password
    );

    if (!user) {
      alert("Invalid username/email or password.");
      return;
    }

    const nameToDisplay = user.username || user.email;

    if (remember) {
      localStorage.setItem("authToken", "demo-token");
      localStorage.setItem("username", nameToDisplay);
    } else {
      sessionStorage.setItem("authToken", "demo-token");
      sessionStorage.setItem("username", nameToDisplay);
    }

    modal.style.display = "none";
    updateLoginUI(nameToDisplay);
  });

  // CREATE ACCOUNT TOGGLE
  showCreateAccountBtn?.addEventListener("click", () => {
    loginFormContainer.style.display = "none";
    createAccountFormContainer.style.display = "block";
  });

  showLoginBtn?.addEventListener("click", () => {
    createAccountFormContainer.style.display = "none";
    loginFormContainer.style.display = "block";
  });

  cancelCreateAccountBtn?.addEventListener("click", () => {
    createAccountFormContainer.style.display = "none";
    loginFormContainer.style.display = "block";
  });

  // CREATE ACCOUNT FORM SUBMIT
  createAccountForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("registerUsername").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!username || username.length < 3) {
        alert("Please enter a username (at least 3 characters).");
        return;
    }
    if (!validateEmail(email)) {
        alert("Please enter a valid email.");
        return;
    }
    if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.find((u) => u.username === username || u.email === email)) {
        alert("This username or email is already registered.");
        return;
    }

    users.push({ username, email, password });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Account created! Please log in.");

    createAccountFormContainer.style.display = "none";
    loginFormContainer.style.display = "block";
    unameInput.value = email;
    });

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function updateLoginUI(username) {
    if (!authContainer) return;

    if (username) {
      authContainer.innerHTML = `
        <button id="logoutBtn" class="logout-btn">Logout</button>
        <div class="welcome-msg">Welcome, ${username}</div>
      `;
      document.getElementById("logoutBtn")?.addEventListener("click", () => {
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("username");
        localStorage.removeItem("authToken");
        localStorage.removeItem("username");
        location.reload();
      });
    } else {
      authContainer.innerHTML = `<button id="loginBtn" class="login">Login</button>`;
      document.getElementById("loginBtn")?.addEventListener("click", () => {
        modal.style.display = "block";
      });
    }
  }
}
