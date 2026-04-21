// ============================================================
// PROFIL — Chargement des données utilisateur
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
	const user = JSON.parse(localStorage.getItem("lpd_current_user") || "null")

	if (!user) {
		window.location.href = "../index.html"
		return
	}

	// --- Bannière ---
	const bannerEl    = document.getElementById("profil-banner")
	const bannerInput = document.getElementById("profil-banner-input")

	const savedBanner = localStorage.getItem(`lpd_banner_${user.email}`)
	if (bannerEl && savedBanner) {
		bannerEl.style.backgroundImage = `url(${savedBanner})`
		bannerEl.style.backgroundSize = "cover"
		bannerEl.style.backgroundPosition = "center"
	}

	if (bannerEl && bannerInput) {
		bannerEl.style.cursor = "pointer"
		bannerEl.addEventListener("click", () => bannerInput.click())

		bannerInput.addEventListener("change", () => {
			const file = bannerInput.files[0]
			if (!file) return
			const reader = new FileReader()
			reader.onload = (e) => {
				const dataUrl = e.target.result
				localStorage.setItem(`lpd_banner_${user.email}`, dataUrl)
				bannerEl.style.backgroundImage = `url(${dataUrl})`
				bannerEl.style.backgroundSize = "cover"
				bannerEl.style.backgroundPosition = "center"
			}
			reader.readAsDataURL(file)
		})
	}

	// --- Avatar ---
	const avatarEl      = document.getElementById("profil-avatar")
	const photoInput    = document.getElementById("profil-photo-input")
	const avatarEditBtn = document.getElementById("profil-avatar-edit-btn")

	const savedPhoto = localStorage.getItem(`lpd_photo_${user.email}`)
	if (avatarEl) {
		if (savedPhoto) {
			avatarEl.style.backgroundImage = `url(${savedPhoto})`
			avatarEl.style.backgroundSize = "cover"
			avatarEl.style.backgroundPosition = "center"
			avatarEl.textContent = ""
		} else {
			avatarEl.textContent = user.username.charAt(0).toUpperCase()
		}
	}

	if (avatarEditBtn && photoInput) {
		avatarEditBtn.addEventListener("click", () => photoInput.click())

		photoInput.addEventListener("change", () => {
			const file = photoInput.files[0]
			if (!file) return
			const reader = new FileReader()
			reader.onload = (e) => {
				const dataUrl = e.target.result
				localStorage.setItem(`lpd_photo_${user.email}`, dataUrl)
				avatarEl.style.backgroundImage = `url(${dataUrl})`
				avatarEl.style.backgroundSize = "cover"
				avatarEl.style.backgroundPosition = "center"
				avatarEl.textContent = ""
			}
			reader.readAsDataURL(file)
		})
	}

	// --- Username ---
	const usernameEl = document.getElementById("profil-username")
	if (usernameEl) usernameEl.textContent = user.username

	// --- Date d'inscription ---
	const sinceEl = document.getElementById("profil-since")
	if (sinceEl) {
		const users = JSON.parse(localStorage.getItem("lpd_users") || "[]")
		const fullUser = users.find(u => u.email === user.email)
		if (fullUser?.createdAt) {
			const date = new Date(fullUser.createdAt)
			sinceEl.textContent = `Membre depuis ${date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`
		}
	}

	// --- Bio ---
	const bioEl       = document.getElementById("profil-bio")
	const bioTextarea = document.getElementById("profil-bio-textarea")
	const bioEditBtn  = document.getElementById("profil-bio-edit-btn")
	const bioSaveBtn  = document.getElementById("profil-bio-save")
	const bioCancelBtn = document.getElementById("profil-bio-cancel")
	const bioActions  = document.getElementById("profil-bio-actions")

	const savedBio = localStorage.getItem(`lpd_bio_${user.email}`) || ""
	if (bioEl && savedBio) bioEl.innerText = savedBio

	if (bioEditBtn) {
		bioEditBtn.addEventListener("click", () => {
			bioEl.style.display = "none"
			bioEditBtn.style.display = "none"
			bioTextarea.style.display = "block"
			bioActions.style.display = "flex"
			bioTextarea.value = savedBio || ""
			bioTextarea.focus()
		})
	}

	if (bioCancelBtn) {
		bioCancelBtn.addEventListener("click", () => {
			bioTextarea.style.display = "none"
			bioActions.style.display = "none"
			bioEl.style.display = "block"
			bioEditBtn.style.display = "flex"
		})
	}

	if (bioSaveBtn) {
		bioSaveBtn.addEventListener("click", () => {
			const newBio = bioTextarea.value.trim()
			localStorage.setItem(`lpd_bio_${user.email}`, newBio)
			bioEl.innerText = newBio || "Aucune bio pour l'instant."
			bioTextarea.style.display = "none"
			bioActions.style.display = "none"
			bioEl.style.display = "block"
			bioEditBtn.style.display = "flex"
		})
	}

	// --- Statistiques ---
	const favorites = JSON.parse(localStorage.getItem(`lpd_favorites_${user.email}`) || "[]")
	const streak    = parseInt(localStorage.getItem(`lpd_streak_${user.email}`) || "0")
	const versets   = parseInt(localStorage.getItem(`lpd_versets_${user.email}`) || "0")

	const streakEl  = document.getElementById("stat-streak")
	const versetsEl = document.getElementById("stat-versets")
	const favorisEl = document.getElementById("stat-favoris")

	if (streakEl)  streakEl.textContent  = streak
	if (versetsEl) versetsEl.textContent = versets
	if (favorisEl) favorisEl.textContent = favorites.length

	// --- Liste des favoris ---
	const favorisContainer = document.getElementById("profil-favoris")
	if (favorisContainer && favorites.length > 0) {
		favorisContainer.innerHTML = ""
		favorites.slice(0, 6).forEach(fav => {
			const card = document.createElement("div")
			card.className = "profil__favori-card"
			card.innerHTML = `
				<span class="profil__favori-ref">${fav.ref}</span>
				<p class="profil__favori-text">${fav.text}</p>
			`
			favorisContainer.appendChild(card)
		})
	}

	// --- Boutons Enregistrer / Réinitialiser ---
	const saveBtn     = document.getElementById("profil-save-btn")
	const resetBtn    = document.getElementById("profil-reset-btn")
	const feedbackEl  = document.getElementById("profil-feedback")

	function showFeedback(msg, type = "success") {
		feedbackEl.textContent = msg
		feedbackEl.className = `profil__feedback profil__feedback--${type}`
		setTimeout(() => { feedbackEl.textContent = ""; feedbackEl.className = "profil__feedback" }, 3000)
	}

	if (saveBtn) {
		saveBtn.addEventListener("click", () => {
			showFeedback("Profil enregistré avec succès ✓", "success")
			setTimeout(() => { window.location.href = "../index.html" }, 1500)
		})
	}

	if (resetBtn) {
		resetBtn.addEventListener("click", () => {
			if (!confirm("Réinitialiser votre profil ? La photo, la bannière et la bio seront supprimées.")) return

			localStorage.removeItem(`lpd_photo_${user.email}`)
			localStorage.removeItem(`lpd_banner_${user.email}`)
			localStorage.removeItem(`lpd_bio_${user.email}`)

			// Reset avatar
			avatarEl.style.backgroundImage = ""
			avatarEl.style.backgroundSize = ""
			avatarEl.style.backgroundPosition = ""
			avatarEl.textContent = user.username.charAt(0).toUpperCase()

			// Reset bannière
			bannerEl.style.backgroundImage = ""
			bannerEl.style.backgroundSize = ""
			bannerEl.style.backgroundPosition = ""

			// Reset bio
			bioEl.innerText = "Aucune bio pour l'instant."

			showFeedback("Profil réinitialisé.", "reset")
		})
	}

	// --- Activité récente ---
	const activite = JSON.parse(localStorage.getItem(`lpd_activite_${user.email}`) || "[]")
	const activiteContainer = document.getElementById("profil-activite")
	if (activiteContainer && activite.length > 0) {
		activiteContainer.innerHTML = ""
		activite.slice(0, 5).forEach(item => {
			const el = document.createElement("div")
			el.className = "profil__activite-item"
			el.innerHTML = `
				<span class="profil__activite-icon">${item.icon}</span>
				<span class="profil__activite-text">${item.text}</span>
				<span class="profil__activite-date">${new Date(item.date).toLocaleDateString("fr-FR")}</span>
			`
			activiteContainer.appendChild(el)
		})
	}
})
