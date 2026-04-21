// ============================================================
// CRYPTO — Hash SHA-256 du mot de passe
// ============================================================
async function hashPassword(password) {
	if (window.isSecureContext && crypto.subtle) {
		const encoder = new TextEncoder()
		const data = encoder.encode(password)
		const hashBuffer = await crypto.subtle.digest("SHA-256", data)
		const hashArray = Array.from(new Uint8Array(hashBuffer))
		return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
	}
	// Fallback pour les contextes non-HTTPS (réseau local, dev mobile)
	let h = 5381
	for (let i = 0; i < password.length; i++) {
		h = Math.imul((h << 5) + h, 1) + password.charCodeAt(i)
		h = h & h
	}
	return "fb_" + (h >>> 0).toString(16).padStart(8, "0")
}

// ============================================================
// MODALE — Gestion de l'ouverture / fermeture / reset
// ============================================================

// --- Création de l'overlay ---
const accountModalOverlay = document.createElement("div")
accountModalOverlay.className = "modal-overlay"
accountModalOverlay.style.display = "none"
accountModalOverlay.style.opacity = "0"
document.body.appendChild(accountModalOverlay)

// --- Références DOM ---
const accountSection = document.getElementById("account-section")
const accountCloseBtn = document.getElementById("account-close-btn")
const createAccountLink = document.getElementById("create-account-link")

// ============================================================
// Afficher la modale
// ============================================================
function showAccountModal() {
	const currentUser = JSON.parse(localStorage.getItem("lpd_current_user") || "null")
	if (currentUser) {
		showUserMenu()
	} else {
		resetAccountModal()
	}

	accountModalOverlay.style.display = "block"
	setTimeout(() => {
		accountModalOverlay.style.opacity = "1"
	}, 10)

	const isMobile = window.innerWidth <= 600
	accountSection.classList.add("modale")
	accountSection.style.opacity = "0"
	accountSection.style.transform = isMobile ? "translateX(-50%) translateY(-10px)" : "translate(-50%, -60%)"
	setTimeout(() => {
		accountSection.style.opacity = "1"
		accountSection.style.transform = isMobile ? "translateX(-50%)" : "translate(-50%, -50%)"
	}, 10)
}

// ============================================================
// Masquer la modale
// ============================================================
function hideAccountModal() {
	const isMobile = window.innerWidth <= 600
	accountModalOverlay.style.opacity = "0"
	accountSection.style.opacity = "0"
	accountSection.style.transform = isMobile ? "translateX(-50%) translateY(-10px)" : "translate(-50%, -60%)"

	setTimeout(() => {
		accountModalOverlay.style.display = "none"
		accountSection.style.display = "none"
		accountSection.classList.remove("modale")
		accountSection.style.opacity = ""
		accountSection.style.transform = ""
		resetAccountModal()
	}, 300)
}

// ============================================================
// Vue : Connexion
// ============================================================
function resetAccountModal() {
	const form = accountSection.querySelector(".account-form")
	if (!form) return

	form.innerHTML = `
		<div class="modale-header">
			<p class="modale-eyebrow">Bienvenue</p>
			<p class="modale-subtitle">Accédez à votre espace personnel</p>
		</div>

		<div class="modale-divider"></div>

		<button type="button" class="account-submit" id="login-btn">Se connecter</button>

		<div class="modale-or">
			<span></span>
			<p>ou</p>
			<span></span>
		</div>

		<button type="button" class="account-create-btn">Créer un compte</button>
	`

	form.querySelector("#login-btn").addEventListener("click", () => {
		const btn = form.querySelector("#login-btn")
		btn.replaceWith(...(() => {
			const wrapper = document.createDocumentFragment()

			const emailField = document.createElement("div")
			emailField.className = "modale-field modale-field--appear"
			emailField.innerHTML = `<input type="email" id="account-email" name="email" placeholder="exemple@mail.com" required autocomplete="email" />`

			const passField = document.createElement("div")
			passField.className = "modale-field modale-field--appear"
			passField.innerHTML = `
				<div class="password-field-container">
					<input type="password" id="account-password" name="password" placeholder="••••••••" required autocomplete="current-password" />
					<button type="button" id="toggle-password-visibility" aria-label="Afficher le mot de passe">
						<svg id="eye-icon-img" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
							<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
							<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
							<line x1="1" y1="1" x2="23" y2="23"/>
						</svg>
					</button>
				</div>`

			const errorEl = document.createElement("p")
			errorEl.className = "modale-error"
			errorEl.id = "login-error"
			errorEl.style.display = "none"

			const submitBtn = document.createElement("button")
			submitBtn.type = "button"
			submitBtn.className = "account-submit"
			submitBtn.textContent = "Valider"

			const forgotBtn = document.createElement("button")
			forgotBtn.type = "button"
			forgotBtn.className = "modale-forgot-btn"
			forgotBtn.textContent = "Mot de passe oublié ?"
			forgotBtn.addEventListener("click", () => showResetPasswordView())

			wrapper.appendChild(emailField)
			wrapper.appendChild(passField)
			wrapper.appendChild(errorEl)
			wrapper.appendChild(submitBtn)
			wrapper.appendChild(forgotBtn)
			return [emailField, passField, errorEl, submitBtn, forgotBtn]
		})())

		form.querySelector("#account-email").focus()

		const toggleBtn = form.querySelector("#toggle-password-visibility")
		const passwordInput = form.querySelector("#account-password")
		if (toggleBtn && passwordInput) {
			toggleBtn.addEventListener("click", () => {
				const isHidden = passwordInput.type === "password"
				passwordInput.type = isHidden ? "text" : "password"
				const svg = toggleBtn.querySelector("svg")
				svg.innerHTML = isHidden
					? `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
					   <circle cx="12" cy="12" r="3"/>`
					: `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
					   <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
					   <line x1="1" y1="1" x2="23" y2="23"/>`
			})
		}

		const submitBtn = form.querySelector(".account-submit")
		submitBtn.addEventListener("click", async () => {
			const email    = form.querySelector("#account-email").value.trim()
			const password = form.querySelector("#account-password").value
			const errorEl  = form.querySelector("#login-error")

			if (!email || !password) {
				errorEl.textContent = "Veuillez remplir tous les champs."
				errorEl.style.display = ""
				return
			}

			const users = JSON.parse(localStorage.getItem("lpd_users") || "[]")
			const user  = users.find(u => u.email === email)

			if (!user) {
				errorEl.textContent = "Aucun compte associé à cet email."
				errorEl.style.display = ""
				return
			}

			const hashedInput = await hashPassword(password)
			if (hashedInput !== user.password) {
				errorEl.textContent = "Mot de passe incorrect."
				errorEl.style.display = ""
				return
			}

			localStorage.setItem("lpd_current_user", JSON.stringify({ username: user.username, email: user.email }))
			hideAccountModal()
			updateNavForLoggedInUser(user)
		})
	})
}

// ============================================================
// Vue : Création de compte
// ============================================================
function showCreateAccountView() {
	const form = accountSection.querySelector(".account-form")
	if (!form) return

	form.innerHTML = `
		<button type="button" class="modale-back-btn" id="modale-back-btn">← Retour</button>

		<div class="modale-header">
			<p class="modale-eyebrow">Inscription</p>
			<h2 class="modale-title">Créer un compte</h2>
			<p class="modale-subtitle">Rejoignez la communauté</p>
		</div>

		<div class="modale-divider"></div>

		<div class="modale-field modale-field--appear">
			<label for="account-username-register">Pseudo</label>
			<input type="text" id="account-username-register" name="username" placeholder="Votre pseudo" required autocomplete="username" />
		</div>

		<div class="modale-field modale-field--appear">
			<label for="account-email-register">Adresse e-mail</label>
			<input type="email" id="account-email-register" name="email" placeholder="exemple@mail.com" required autocomplete="email" />
		</div>

		<div class="modale-field modale-field--appear">
			<label for="account-password-register">Mot de passe</label>
			<div class="password-field-container">
				<input type="password" id="account-password-register" name="password" placeholder="••••••••" required autocomplete="new-password" />
				<button type="button" id="toggle-register-password" aria-label="Afficher le mot de passe">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
						<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
						<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
						<line x1="1" y1="1" x2="23" y2="23"/>
					</svg>
				</button>
			</div>
			<ul class="modale-password-rules" id="password-rules">
				<li data-rule="length">Au moins 6 caractères</li>
				<li data-rule="upper">Une majuscule</li>
				<li data-rule="number">Un chiffre</li>
			</ul>
		</div>

		<div class="modale-field modale-field--appear">
			<label for="account-password-confirm">Confirmer le mot de passe</label>
			<div class="password-field-container">
				<input type="password" id="account-password-confirm" name="password-confirm" placeholder="••••••••" required autocomplete="new-password" />
				<button type="button" id="toggle-confirm-password" aria-label="Afficher le mot de passe">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
						<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
						<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
						<line x1="1" y1="1" x2="23" y2="23"/>
					</svg>
				</button>
			</div>
		</div>

		<p class="modale-error" id="register-error" style="display:none;"></p>

		<button type="button" class="account-submit modale-field--appear" id="create-final-btn">Créer mon compte</button>
	`

	// Eye toggle
	const toggleBtn = form.querySelector("#toggle-register-password")
	const passInput = form.querySelector("#account-password-register")
	if (toggleBtn && passInput) {
		toggleBtn.addEventListener("click", () => {
			const isHidden = passInput.type === "password"
			passInput.type = isHidden ? "text" : "password"
			const svg = toggleBtn.querySelector("svg")
			svg.innerHTML = isHidden
				? `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
				   <circle cx="12" cy="12" r="3"/>`
				: `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
				   <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
				   <line x1="1" y1="1" x2="23" y2="23"/>`
		})

		// Validation règles mot de passe en temps réel
		passInput.addEventListener("input", () => {
			const v = passInput.value
			const rules = form.querySelector("#password-rules")
			if (!rules) return
			rules.querySelector("[data-rule='length']").classList.toggle("valid", v.length >= 6)
			rules.querySelector("[data-rule='upper']").classList.toggle("valid", /[A-Z]/.test(v))
			rules.querySelector("[data-rule='number']").classList.toggle("valid", /[0-9]/.test(v))
		})
	}

	// Eye toggle — confirmer mot de passe
	const toggleConfirmBtn = form.querySelector("#toggle-confirm-password")
	const confirmInput     = form.querySelector("#account-password-confirm")
	if (toggleConfirmBtn && confirmInput) {
		toggleConfirmBtn.addEventListener("click", () => {
			const isHidden = confirmInput.type === "password"
			confirmInput.type = isHidden ? "text" : "password"
			const svg = toggleConfirmBtn.querySelector("svg")
			svg.innerHTML = isHidden
				? `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
				   <circle cx="12" cy="12" r="3"/>`
				: `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
				   <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
				   <line x1="1" y1="1" x2="23" y2="23"/>`
		})
	}

	// Création du compte
	form.querySelector("#create-final-btn").addEventListener("click", () => {
		const username = form.querySelector("#account-username-register").value.trim()
		const email    = form.querySelector("#account-email-register").value.trim()
		const password = form.querySelector("#account-password-register").value
		const confirm  = form.querySelector("#account-password-confirm").value
		const errorEl  = form.querySelector("#register-error")

		if (!username || !email || !password || !confirm) {
			errorEl.textContent = "Veuillez remplir tous les champs."
			errorEl.style.display = ""
			return
		}
		if (password.length < 6 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
			errorEl.textContent = "Le mot de passe ne respecte pas les règles."
			errorEl.style.display = ""
			return
		}
		if (password !== confirm) {
			errorEl.textContent = "Les mots de passe ne correspondent pas."
			errorEl.style.display = ""
			return
		}

		// Vérifie si l'email est déjà utilisé
		const users = JSON.parse(localStorage.getItem("lpd_users") || "[]")
		if (users.find(u => u.email === email)) {
			errorEl.textContent = "Cette adresse e-mail est déjà utilisée."
			errorEl.style.display = ""
			return
		}

		// Hash du mot de passe puis sauvegarde
		hashPassword(password).then(hashedPassword => {
			const newUser = { username, email, password: hashedPassword, createdAt: new Date().toISOString() }
			users.push(newUser)
			localStorage.setItem("lpd_users", JSON.stringify(users))
			localStorage.setItem("lpd_current_user", JSON.stringify({ username, email }))

			// Vue succès
			form.innerHTML = `
				<div class="modale-header">
					<p class="modale-eyebrow">✦ Bienvenue</p>
					<h2 class="modale-title">${username}</h2>
					<p class="modale-subtitle">Votre compte a été créé avec succès</p>
				</div>
				<div class="modale-divider"></div>
				<button type="button" class="account-submit" id="close-success-btn">Commencer</button>
			`
			form.querySelector("#close-success-btn").addEventListener("click", () => {
				hideAccountModal()
				updateNavForLoggedInUser({ username, email })
			})

			updateNavForLoggedInUser({ username, email })
		})
	})
}

// ============================================================
// Vue : Menu utilisateur connecté
// ============================================================
function showUserMenu() {
	const form = accountSection.querySelector(".account-form")
	if (!form) return

	const user = JSON.parse(localStorage.getItem("lpd_current_user") || "null")
	if (!user) return

	const base = window.location.pathname.replace(/\\/g, "/").includes("/pages/") ? "" : "pages/"

	form.innerHTML = `
		<div class="modale-header">
			<p class="modale-eyebrow">✦ Connecté</p>
			<p class="modale-subtitle">${user.username}</p>
		</div>

		<div class="modale-divider"></div>

		<nav class="modale-user-menu">
			<a href="${base}profil.html" class="modale-user-menu__item" id="menu-profil">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
				Profil
			</a>
			<a href="#" class="modale-user-menu__item" id="menu-favoris">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
				Favoris
			</a>
			<a href="#" class="modale-user-menu__item" id="menu-notifications">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
				Notifications
			</a>
			<a href="#" class="modale-user-menu__item" id="menu-plan">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="8" y1="18" x2="8" y2="18"/></svg>
				Plan de lecture
			</a>
			<a href="#" class="modale-user-menu__item" id="menu-messages">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
				Messages
			</a>
			<a href="#" class="modale-user-menu__item" id="menu-parametres">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
				Paramètres
			</a>

			<div class="modale-divider"></div>

			<button type="button" class="modale-user-menu__item modale-user-menu__item--logout" id="menu-deconnexion">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
				Se déconnecter
			</button>
		</nav>
	`

	form.querySelector("#menu-deconnexion").addEventListener("click", () => {
		localStorage.removeItem("lpd_current_user")
		hideAccountModal()
		if (window.location.pathname.replace(/\\/g, "/").includes("/pages/profil")) {
			window.location.href = "../index.html"
			return
		}
		const link = document.getElementById("create-account-link")
		if (link) {
			link.textContent = "Créez un compte"
			link.removeEventListener("click", showUserMenu)
			link.addEventListener("click", (e) => {
				e.preventDefault()
				showAccountModal()
			})
		}
	})
}

// ============================================================
// Vue : Réinitialisation du mot de passe
// ============================================================
function showResetPasswordView() {
	const form = accountSection.querySelector(".account-form")
	if (!form) return

	form.innerHTML = `
		<button type="button" class="modale-back-btn" id="modale-back-btn">← Retour</button>

		<div class="modale-header">
			<p class="modale-eyebrow">Réinitialisation</p>
			<p class="modale-subtitle">Entrez votre email pour changer votre mot de passe</p>
		</div>

		<div class="modale-divider"></div>

		<div class="modale-field modale-field--appear">
			<label for="reset-email">Adresse e-mail</label>
			<input type="email" id="reset-email" placeholder="exemple@mail.com" autocomplete="email" />
		</div>

		<p class="modale-error" id="reset-error" style="display:none;"></p>

		<button type="button" class="account-submit" id="reset-next-btn">Continuer</button>
	`

	form.querySelector("#reset-next-btn").addEventListener("click", () => {
		const email   = form.querySelector("#reset-email").value.trim()
		const errorEl = form.querySelector("#reset-error")

		if (!email) {
			errorEl.textContent = "Veuillez entrer votre adresse e-mail."
			errorEl.style.display = ""
			return
		}

		const users = JSON.parse(localStorage.getItem("lpd_users") || "[]")
		const userIndex = users.findIndex(u => u.email === email)

		if (userIndex === -1) {
			errorEl.textContent = "Aucun compte associé à cet email."
			errorEl.style.display = ""
			return
		}

		// Étape 2 — nouveau mot de passe
		form.innerHTML = `
			<button type="button" class="modale-back-btn" id="modale-back-btn">← Retour</button>

			<div class="modale-header">
				<p class="modale-eyebrow">Nouveau mot de passe</p>
				<p class="modale-subtitle">${email}</p>
			</div>

			<div class="modale-divider"></div>

			<div class="modale-field modale-field--appear">
				<label for="reset-new-password">Nouveau mot de passe</label>
				<div class="password-field-container">
					<input type="password" id="reset-new-password" placeholder="••••••••" autocomplete="new-password" />
					<button type="button" id="toggle-reset-password" aria-label="Afficher le mot de passe">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
							<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
							<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
							<line x1="1" y1="1" x2="23" y2="23"/>
						</svg>
					</button>
				</div>
				<ul class="modale-password-rules" id="reset-password-rules">
					<li data-rule="length">Au moins 6 caractères</li>
					<li data-rule="upper">Une majuscule</li>
					<li data-rule="number">Un chiffre</li>
				</ul>
			</div>

			<div class="modale-field modale-field--appear">
				<label for="reset-confirm-password">Confirmer le mot de passe</label>
				<div class="password-field-container">
					<input type="password" id="reset-confirm-password" placeholder="••••••••" autocomplete="new-password" />
					<button type="button" id="toggle-reset-confirm" aria-label="Afficher le mot de passe">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
							<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
							<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
							<line x1="1" y1="1" x2="23" y2="23"/>
						</svg>
					</button>
				</div>
			</div>

			<p class="modale-error" id="reset-error-2" style="display:none;"></p>

			<button type="button" class="account-submit" id="reset-confirm-btn">Réinitialiser</button>
		`

		// Eye toggles
		;[["#toggle-reset-password", "#reset-new-password"], ["#toggle-reset-confirm", "#reset-confirm-password"]].forEach(([btnId, inputId]) => {
			const btn   = form.querySelector(btnId)
			const input = form.querySelector(inputId)
			if (!btn || !input) return
			btn.addEventListener("click", () => {
				const isHidden = input.type === "password"
				input.type = isHidden ? "text" : "password"
				btn.querySelector("svg").innerHTML = isHidden
					? `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`
					: `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>`
			})
		})

		// Validation règles en temps réel
		const newPassInput = form.querySelector("#reset-new-password")
		newPassInput.addEventListener("input", () => {
			const v = newPassInput.value
			form.querySelector("[data-rule='length']").classList.toggle("valid", v.length >= 6)
			form.querySelector("[data-rule='upper']").classList.toggle("valid", /[A-Z]/.test(v))
			form.querySelector("[data-rule='number']").classList.toggle("valid", /[0-9]/.test(v))
		})

		form.querySelector("#reset-confirm-btn").addEventListener("click", async () => {
			const newPass  = form.querySelector("#reset-new-password").value
			const confirm  = form.querySelector("#reset-confirm-password").value
			const errorEl2 = form.querySelector("#reset-error-2")

			if (!newPass || !confirm) {
				errorEl2.textContent = "Veuillez remplir tous les champs."
				errorEl2.style.display = ""
				return
			}
			if (newPass.length < 6 || !/[A-Z]/.test(newPass) || !/[0-9]/.test(newPass)) {
				errorEl2.textContent = "Le mot de passe ne respecte pas les règles."
				errorEl2.style.display = ""
				return
			}
			if (newPass !== confirm) {
				errorEl2.textContent = "Les mots de passe ne correspondent pas."
				errorEl2.style.display = ""
				return
			}

			const hashed = await hashPassword(newPass)
			const updatedUsers = JSON.parse(localStorage.getItem("lpd_users") || "[]")
			const idx = updatedUsers.findIndex(u => u.email === email)
			updatedUsers[idx].password = hashed
			localStorage.setItem("lpd_users", JSON.stringify(updatedUsers))

			form.innerHTML = `
				<div class="modale-header">
					<p class="modale-eyebrow">✦ Succès</p>
					<p class="modale-subtitle">Votre mot de passe a été réinitialisé</p>
				</div>
				<div class="modale-divider"></div>
				<button type="button" class="account-submit" id="reset-done-btn">Se connecter</button>
			`
			form.querySelector("#reset-done-btn").addEventListener("click", () => resetAccountModal())
		})
	})
}

// ============================================================
// Met à jour la nav selon l'utilisateur connecté
// ============================================================
function updateNavForLoggedInUser(user) {
	document.querySelectorAll("#create-account-link").forEach(el => {
		el.textContent = user.username
		// Remplace l'écouteur par le menu utilisateur
		const newEl = el.cloneNode(true)
		el.parentNode.replaceChild(newEl, el)
		newEl.addEventListener("click", (e) => {
			e.preventDefault()
			showAccountModal()
		})
	})
}

// Vérifie si un utilisateur est déjà connecté au chargement
;(function checkSession() {
	const user = JSON.parse(localStorage.getItem("lpd_current_user") || "null")
	if (user) {
		document.addEventListener("DOMContentLoaded", () => updateNavForLoggedInUser(user))
	}
})()

// ============================================================
// Événements
// ============================================================

if (accountCloseBtn) {
	accountCloseBtn.addEventListener("click", hideAccountModal)
}

accountModalOverlay.addEventListener("click", hideAccountModal)

if (createAccountLink) {
	createAccountLink.addEventListener("click", (e) => {
		e.preventDefault()
		showAccountModal()
	})
}

document.addEventListener("click", (e) => {
	if (e.target.closest("#modale-back-btn")) resetAccountModal()
	if (e.target.closest(".account-create-btn")) showCreateAccountView()
})
