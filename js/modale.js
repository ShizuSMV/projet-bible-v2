// ============================================================
// MODALE — Compte utilisateur (Netlify Identity)
// ============================================================

const accountModalOverlay = document.createElement("div")
accountModalOverlay.className = "modal-overlay"
accountModalOverlay.style.display = "none"
accountModalOverlay.style.opacity = "0"
document.body.appendChild(accountModalOverlay)

const accountSection    = document.getElementById("account-section")
const accountCloseBtn   = document.getElementById("account-close-btn")
const createAccountLink = document.getElementById("create-account-link")

// ============================================================
// Ouvrir / Fermer la section modale
// ============================================================
function openModalSection() {
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
// Afficher la modale
// ============================================================
function showAccountModal() {
	const user = window.netlifyIdentity?.currentUser()
	if (user) {
		showUserMenu()
		openModalSection()
	} else {
		window.netlifyIdentity?.open()
	}
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

	form.querySelector("#menu-deconnexion").addEventListener("click", () => {
		window.netlifyIdentity?.logout()
		hideAccountModal()
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
// Netlify Identity — événements
// ============================================================
;(function setupIdentity() {
	if (!window.netlifyIdentity) return
	netlifyIdentity.on("init",   user => { if (user) updateNavForLoggedInUser(user) })
	netlifyIdentity.on("login",  user => { netlifyIdentity.close(); updateNavForLoggedInUser(user) })
	netlifyIdentity.on("logout", ()   => {
		resetNav()
		if (window.location.pathname.replace(/\\/g, "/").includes("/pages/profil")) {
			window.location.href = "../index.html"
		}
	})
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
