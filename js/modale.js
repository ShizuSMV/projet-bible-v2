// ============================================================
// MODALE — Compte utilisateur (GoTrue / Netlify Identity)
// ============================================================

const accountModalOverlay = document.createElement("div")
accountModalOverlay.className = "modal-overlay"
accountModalOverlay.style.display = "none"
accountModalOverlay.style.opacity = "0"
document.body.appendChild(accountModalOverlay)

const accountSection    = document.getElementById("account-section")
const accountCloseBtn   = document.getElementById("account-close-btn")
const createAccountLink = document.getElementById("create-account-link")

// Raccourci vers l'instance GoTrue embarquée dans le widget
function gotrue() { return window.netlifyIdentity?.gotrue }

// ============================================================
// Ouvrir / Fermer
// ============================================================
function showAccountModal() {
	const user = window.netlifyIdentity?.currentUser()
	if (user) {
		showUserMenu()
	} else {
		resetAccountModal()
	}

	accountModalOverlay.style.display = "block"
	setTimeout(() => { accountModalOverlay.style.opacity = "1" }, 10)

	const isMobile = window.innerWidth <= 600
	accountSection.classList.add("modale")
	accountSection.style.opacity = "0"
	accountSection.style.transform = isMobile ? "translateX(-50%) translateY(-10px)" : "translate(-50%, -60%)"
	setTimeout(() => {
		accountSection.style.opacity = "1"
		accountSection.style.transform = isMobile ? "translateX(-50%)" : "translate(-50%, -50%)"
	}, 10)
}

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
	}, 300)
}

// ============================================================
// Vue : Accueil (choix connexion / inscription)
// ============================================================
function resetAccountModal() {
	const form = accountSection.querySelector(".account-form")
	if (!form) return

	form.innerHTML = `
		<div class="modale-welcome-icon" aria-hidden="true">
			<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="8" r="4"/>
				<path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
			</svg>
		</div>
		<div class="modale-header" style="text-align:center;align-items:center;">
			<p class="modale-eyebrow">Espace personnel</p>
			<h2 class="modale-title">La Parole de Dieu</h2>
			<p class="modale-subtitle">Connectez-vous ou créez un compte</p>
		</div>
		<div class="modale-divider"></div>
		<button type="button" class="account-submit" id="login-btn">Se connecter</button>
		<div class="modale-or"><span></span><p>ou</p><span></span></div>
		<button type="button" class="account-create-btn">Créer un compte</button>
	`

	form.querySelector("#login-btn").addEventListener("click", showLoginForm)
}

// ============================================================
// Vue : Connexion
// ============================================================
function showLoginForm() {
	const form = accountSection.querySelector(".account-form")
	if (!form) return

	form.innerHTML = `
		<button type="button" class="modale-back-btn" id="modale-back-btn">← Retour</button>

		<div class="modale-header">
			<p class="modale-eyebrow">Connexion</p>
			<p class="modale-subtitle">Accédez à votre espace</p>
		</div>

		<div class="modale-divider"></div>

		<div class="modale-field modale-field--appear">
			<input type="email" id="account-email" placeholder="exemple@mail.com" required autocomplete="email" />
		</div>

		<div class="modale-field modale-field--appear">
			<div class="password-field-container">
				<input type="password" id="account-password" placeholder="••••••••" required autocomplete="current-password" />
				<button type="button" id="toggle-password-visibility" aria-label="Afficher le mot de passe">
					<svg id="eye-icon-img" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
						<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
						<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
						<line x1="1" y1="1" x2="23" y2="23"/>
					</svg>
				</button>
			</div>
		</div>

		<p class="modale-error" id="login-error" style="display:none;"></p>

		<button type="button" class="account-submit" id="submit-login">Valider</button>
		<button type="button" class="modale-forgot-btn" id="forgot-btn">Mot de passe oublié ?</button>
	`

	form.querySelector("#account-email").focus()

	// Toggle mot de passe
	const toggleBtn   = form.querySelector("#toggle-password-visibility")
	const passwordInput = form.querySelector("#account-password")
	toggleBtn.addEventListener("click", () => {
		const isHidden = passwordInput.type === "password"
		passwordInput.type = isHidden ? "text" : "password"
		toggleBtn.querySelector("svg").innerHTML = isHidden
			? `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`
			: `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>`
	})

	// Connexion
	form.querySelector("#submit-login").addEventListener("click", async () => {
		const email    = form.querySelector("#account-email").value.trim()
		const password = form.querySelector("#account-password").value
		const errorEl  = form.querySelector("#login-error")
		const btn      = form.querySelector("#submit-login")

		if (!email || !password) {
			errorEl.textContent = "Veuillez remplir tous les champs."
			errorEl.style.display = ""
			return
		}

		btn.textContent = "Connexion…"
		btn.disabled = true
		errorEl.style.display = "none"

		try {
			const user = await gotrue().login(email, password, true)
			updateNavForLoggedInUser(user)
			hideAccountModal()
		} catch (err) {
			const msg = err?.json?.error_description || err?.json?.msg || err?.message || ""
			if (msg.toLowerCase().includes("email")) {
				errorEl.textContent = "Aucun compte associé à cet email."
			} else if (msg.toLowerCase().includes("password") || msg.toLowerCase().includes("invalid")) {
				errorEl.textContent = "Mot de passe incorrect."
			} else if (msg.toLowerCase().includes("confirm")) {
				errorEl.textContent = "Veuillez confirmer votre email avant de vous connecter."
			} else {
				errorEl.textContent = "Email ou mot de passe incorrect."
			}
			errorEl.style.display = ""
			btn.textContent = "Valider"
			btn.disabled = false
		}
	})

	form.querySelector("#forgot-btn").addEventListener("click", showResetPasswordView)
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
			<input type="text" id="account-username-register" placeholder="Votre pseudo" required autocomplete="username" />
		</div>

		<div class="modale-field modale-field--appear">
			<label for="account-email-register">Adresse e-mail</label>
			<input type="email" id="account-email-register" placeholder="exemple@mail.com" required autocomplete="email" />
		</div>

		<div class="modale-field modale-field--appear">
			<label for="account-password-register">Mot de passe</label>
			<div class="password-field-container">
				<input type="password" id="account-password-register" placeholder="••••••••" required autocomplete="new-password" />
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

		<p class="modale-error" id="register-error" style="display:none;"></p>

		<button type="button" class="account-submit modale-field--appear" id="create-final-btn">Créer mon compte</button>
	`

	const toggleBtn = form.querySelector("#toggle-register-password")
	const passInput = form.querySelector("#account-password-register")
	toggleBtn.addEventListener("click", () => {
		const isHidden = passInput.type === "password"
		passInput.type = isHidden ? "text" : "password"
		toggleBtn.querySelector("svg").innerHTML = isHidden
			? `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`
			: `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>`
	})

	passInput.addEventListener("input", () => {
		const v = passInput.value
		form.querySelector("[data-rule='length']").classList.toggle("valid", v.length >= 6)
		form.querySelector("[data-rule='upper']").classList.toggle("valid", /[A-Z]/.test(v))
		form.querySelector("[data-rule='number']").classList.toggle("valid", /[0-9]/.test(v))
	})

	form.querySelector("#create-final-btn").addEventListener("click", async () => {
		const username = form.querySelector("#account-username-register").value.trim()
		const email    = form.querySelector("#account-email-register").value.trim()
		const password = form.querySelector("#account-password-register").value
		const errorEl  = form.querySelector("#register-error")
		const btn      = form.querySelector("#create-final-btn")

		if (!username || !email || !password) {
			errorEl.textContent = "Veuillez remplir tous les champs."
			errorEl.style.display = ""
			return
		}
		if (password.length < 6 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
			errorEl.textContent = "Le mot de passe ne respecte pas les règles."
			errorEl.style.display = ""
			return
		}

		btn.textContent = "Création…"
		btn.disabled = true
		errorEl.style.display = "none"

		try {
			await gotrue().signup(email, password, { full_name: username })
			form.innerHTML = `
				<div class="modale-header">
					<p class="modale-eyebrow">✦ Presque !</p>
					<p class="modale-subtitle">Un email de confirmation vous a été envoyé à <strong>${email}</strong></p>
				</div>
				<div class="modale-divider"></div>
				<p style="font-family:'Cormorant Garamond',serif;font-size:.95rem;color:rgba(255,255,255,.6);font-style:italic;text-align:center;padding:0 8px;">Cliquez sur le lien dans l'email pour activer votre compte.</p>
				<button type="button" class="account-submit" id="close-success-btn">OK</button>
			`
			form.querySelector("#close-success-btn").addEventListener("click", hideAccountModal)
		} catch (err) {
			const msg = err?.json?.msg || err?.message || ""
			errorEl.textContent = msg.toLowerCase().includes("already")
				? "Cette adresse e-mail est déjà utilisée."
				: "Une erreur est survenue. Réessayez."
			errorEl.style.display = ""
			btn.textContent = "Créer mon compte"
			btn.disabled = false
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
			<p class="modale-subtitle">Entrez votre email pour recevoir un lien</p>
		</div>

		<div class="modale-divider"></div>

		<div class="modale-field modale-field--appear">
			<label for="reset-email">Adresse e-mail</label>
			<input type="email" id="reset-email" placeholder="exemple@mail.com" autocomplete="email" />
		</div>

		<p class="modale-error" id="reset-error" style="display:none;"></p>

		<button type="button" class="account-submit" id="reset-next-btn">Envoyer le lien</button>
	`

	form.querySelector("#reset-next-btn").addEventListener("click", async () => {
		const email   = form.querySelector("#reset-email").value.trim()
		const errorEl = form.querySelector("#reset-error")
		const btn     = form.querySelector("#reset-next-btn")

		if (!email) {
			errorEl.textContent = "Veuillez entrer votre adresse e-mail."
			errorEl.style.display = ""
			return
		}

		btn.textContent = "Envoi…"
		btn.disabled = true

		try {
			await gotrue().requestPasswordRecovery(email)
			form.innerHTML = `
				<div class="modale-header">
					<p class="modale-eyebrow">✦ Email envoyé</p>
					<p class="modale-subtitle">Vérifiez votre boîte mail</p>
				</div>
				<div class="modale-divider"></div>
				<button type="button" class="account-submit" id="reset-done-btn">Se connecter</button>
			`
			form.querySelector("#reset-done-btn").addEventListener("click", showLoginForm)
		} catch (err) {
			errorEl.textContent = "Aucun compte associé à cet email."
			errorEl.style.display = ""
			btn.textContent = "Envoyer le lien"
			btn.disabled = false
		}
	})
}

// ============================================================
// Vue : Menu utilisateur connecté
// ============================================================
function showUserMenu() {
	const form = accountSection.querySelector(".account-form")
	if (!form) return
	const user = window.netlifyIdentity?.currentUser()
	if (!user) return

	const username = user.user_metadata?.full_name || user.email.split("@")[0]
	const base = window.location.pathname.replace(/\\/g, "/").includes("/pages/") ? "" : "pages/"

	form.innerHTML = `
		<div class="modale-header">
			<p class="modale-eyebrow">✦ Connecté</p>
			<p class="modale-subtitle">${username}</p>
		</div>
		<div class="modale-divider"></div>
		<nav class="modale-user-menu">
			<a href="${base}profil.html" class="modale-user-menu__item">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
				Profil
			</a>
			<a href="#" class="modale-user-menu__item">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
				Favoris
			</a>
			<a href="#" class="modale-user-menu__item">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
				Notifications
			</a>
			<a href="#" class="modale-user-menu__item">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
				Plan de lecture
			</a>
			<a href="#" class="modale-user-menu__item">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
				Messages
			</a>
			<div class="modale-divider"></div>
			<button type="button" class="modale-user-menu__item modale-user-menu__item--logout" id="menu-deconnexion">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
				Se déconnecter
			</button>
		</nav>
	`

	form.querySelector("#menu-deconnexion").addEventListener("click", async () => {
		await window.netlifyIdentity?.currentUser()?.logout()
		hideAccountModal()
		resetNav()
		if (window.location.pathname.replace(/\\/g, "/").includes("/pages/profil")) {
			window.location.href = "../index.html"
		}
	})
}

// ============================================================
// Mise à jour de la nav
// ============================================================
function updateNavForLoggedInUser(user) {
	const name = user.user_metadata?.full_name || user.email.split("@")[0]
	document.querySelectorAll("#create-account-link").forEach(el => {
		el.textContent = name
		const newEl = el.cloneNode(true)
		el.parentNode.replaceChild(newEl, el)
		newEl.addEventListener("click", e => { e.preventDefault(); showAccountModal() })
	})
}

function resetNav() {
	document.querySelectorAll("#create-account-link").forEach(el => {
		el.textContent = "Créez un compte"
		const newEl = el.cloneNode(true)
		el.parentNode.replaceChild(newEl, el)
		newEl.addEventListener("click", e => { e.preventDefault(); showAccountModal() })
	})
}

// ============================================================
// Netlify Identity — session au chargement
// ============================================================
;(function checkSession() {
	if (!window.netlifyIdentity) return
	netlifyIdentity.on("init", user => { if (user) updateNavForLoggedInUser(user) })
})()

// ============================================================
// Événements DOM
// ============================================================
if (accountCloseBtn) {
	accountCloseBtn.addEventListener("click", hideAccountModal)
}
accountModalOverlay.addEventListener("click", hideAccountModal)

if (createAccountLink) {
	createAccountLink.addEventListener("click", e => { e.preventDefault(); showAccountModal() })
}

document.addEventListener("click", e => {
	if (e.target.closest("#modale-back-btn"))    resetAccountModal()
	if (e.target.closest(".account-create-btn")) showCreateAccountView()
})
