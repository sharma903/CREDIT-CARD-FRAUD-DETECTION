document.addEventListener('DOMContentLoaded', () => {

    // ---------- TOGGLE SIGN IN / SIGN UP ----------
    const container = document.getElementById('container');
    const signUpBtn = document.getElementById('signUpBtn');
    const signInBtn = document.getElementById('signInBtn');

    if (container && signUpBtn && signInBtn) {
        signUpBtn.addEventListener('click', () => {
            container.classList.add('sign-up-mode');
        });
        signInBtn.addEventListener('click', () => {
            container.classList.remove('sign-up-mode');
        });
    }

    // ---------- PASSWORD STRENGTH ----------
    const passwordInput = document.querySelector('input[name="password"]');
    const strengthBar = document.getElementById("strengthBar");
    const strengthText = document.getElementById("strengthText");

    if (passwordInput) {
        passwordInput.addEventListener("input", () => {
            const value = passwordInput.value;
            let strength = 0;
            if (value.length >= 6) strength++;
            if (/[A-Z]/.test(value)) strength++;
            if (/[0-9]/.test(value)) strength++;
            if (/[!@#$%^&*]/.test(value)) strength++;

            if (strength <= 1) {
                strengthBar.style.width = "30%";
                strengthBar.style.background = "red";
                strengthText.innerText = "Weak Password";
            } else if (strength === 2 || strength === 3) {
                strengthBar.style.width = "70%";
                strengthBar.style.background = "orange";
                strengthText.innerText = "Medium Password";
            } else {
                strengthBar.style.width = "100%";
                strengthBar.style.background = "green";
                strengthText.innerText = "Strong Password";
            }
        });
    }

    // ---------- CLEAR ALL STORAGE (LOGOUT / RESET) ----------
    function clearAllData() {
        localStorage.clear();
        sessionStorage.clear();
    }

    // ---------- REGISTER FORM ----------
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = registerForm.querySelector('input[name="name"]').value.trim();
            const email = registerForm.querySelector('input[name="email"]').value.trim();
            const password = registerForm.querySelector('input[name="password"]').value.trim();

            if (!name || !email || !password) {
                alert("❌ Please fill all fields");
                return;
            }

            try {
                const res = await fetch("http://localhost:5000/api/auth/register", {
                    method: "POST",
                    headers: {"Content-Type":"application/json"},
                    body: JSON.stringify({ name, email, password })
                });

                const data = await res.json();

                if (!res.ok) {
                    alert("❌ " + data.error);
                    return;
                }

                // Auto login after register
                const loginRes = await fetch("http://localhost:5000/api/auth/login", {
                    method: "POST",
                    headers: {"Content-Type":"application/json"},
                    body: JSON.stringify({ email, password })
                });

                const loginData = await loginRes.json();

                if (loginRes.ok) {
                    localStorage.setItem("user", JSON.stringify(loginData.user));
                    localStorage.setItem("token", loginData.token);

                    // Redirect to dashboard
                    window.location.href = "auth.html";
                } else {
                    alert("❌ Login failed after register");
                }

            } catch (err) {
                console.error(err);
                alert("❌ Server error");
            }
        });
    }

    // ---------- LOGIN FORM ----------
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        // Pre-fill Remember Me email
        const savedEmail = localStorage.getItem("email");
        if (savedEmail) {
            loginForm.querySelector('input[type="text"]').value = savedEmail;
            document.getElementById("rememberMe").checked = true;
        }

        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = loginForm.querySelector('input[type="text"]').value.trim();
            const password = loginForm.querySelector('input[type="password"]').value.trim();
            const remember = document.getElementById("rememberMe").checked;

            if (!email || !password) {
                alert("❌ Please fill all fields");
                return;
            }

            try {
                const res = await fetch("http://localhost:5000/api/auth/login", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    if (remember) {
                        localStorage.setItem("token", data.token);
                        localStorage.setItem("email", email);
                    } else {
                        sessionStorage.setItem("token", data.token);
                        localStorage.removeItem("email");
                    }

                    localStorage.setItem("user", JSON.stringify(data.user));

                    // Redirect to dashboard
                    window.location.href = "http://localhost:8080";
                } else {
                    alert("❌ " + (data.error || "Invalid Email or Password"));
                }

            } catch (err) {
                console.error(err);
                alert("❌ Server error");
            }
        });
    }

    
    clearAllData();
});

 
   document.querySelectorAll(".toggle-password").forEach(icon => {

    const input = icon.parentElement.querySelector("input");

    // ✅ DESKTOP PRESS
    icon.addEventListener("mousedown", (e) => {
        e.preventDefault(); // 👈 VERY IMPORTANT (prevents focus loss)
        input.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
    });

    // ✅ RELEASE
    document.addEventListener("mouseup", () => {
        input.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
    });

    // ✅ MOBILE PRESS
    icon.addEventListener("touchstart", (e) => {
        e.preventDefault();
        input.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
    });

    // ✅ MOBILE RELEASE
    icon.addEventListener("touchend", () => {
        input.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
    });

});