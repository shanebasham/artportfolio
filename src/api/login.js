loginForm.addEventListener('submit', async (e) => {
  const username = unameInput.value;
  const password = pswInput.value;
  const remember = rememberCheckbox.checked;
  try {
    console.log('Sending login to: http://localhost:3000/api/login');
    const response = await fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      alert(error.message || 'Login failed');
      return;
    }
    const data = await response.json();
    if (remember) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('username', data.username);
    } else {
      sessionStorage.setItem('authToken', data.token);
      sessionStorage.setItem('username', data.username);
    }
    modal.style.display = 'none';
    updateLoginUI(data.username);
  } catch (error) {
    alert('Login error, please try again');
    console.error(error);
  }
});
