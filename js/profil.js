// ============================================================
// IMAGE EDITOR — Zoom / Pan / Crop overlay
// ============================================================
function openImageEditor(file, cropW, cropH, outputW, outputH, isCircle, onConfirm) {
	const overlay = document.createElement("div")
	overlay.className = "img-editor-overlay"
	overlay.innerHTML = `
		<div class="img-editor-box">
			<p class="img-editor-title">Ajuster l'image</p>
			<div class="img-editor-frame${isCircle ? " img-editor-frame--circle" : ""}" style="width:${cropW}px;height:${cropH}px;">
				<img class="img-editor-img" draggable="false" alt="" />
			</div>
			<p class="img-editor-hint">Glisser · Molette ou curseur pour zoomer</p>
			<div class="img-editor-zoom-row">
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
				<input type="range" class="img-editor-zoom" min="0" max="100" value="0" />
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
			</div>
			<div class="img-editor-actions">
				<button type="button" class="img-editor-btn img-editor-btn--cancel">Annuler</button>
				<button type="button" class="img-editor-btn img-editor-btn--confirm">Valider</button>
			</div>
		</div>
	`
	document.body.appendChild(overlay)

	const frame      = overlay.querySelector(".img-editor-frame")
	const img        = overlay.querySelector(".img-editor-img")
	const slider     = overlay.querySelector(".img-editor-zoom")
	const cancelBtn  = overlay.querySelector(".img-editor-btn--cancel")
	const confirmBtn = overlay.querySelector(".img-editor-btn--confirm")

	let scale = 1, minScale = 1, maxScale = 4
	let ox = 0, oy = 0

	const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi)

	function clampOffsets() {
		ox = clamp(ox, cropW - img.naturalWidth  * scale, 0)
		oy = clamp(oy, cropH - img.naturalHeight * scale, 0)
	}

	function render() {
		img.style.width  = img.naturalWidth  * scale + "px"
		img.style.height = img.naturalHeight * scale + "px"
		img.style.left   = ox + "px"
		img.style.top    = oy + "px"
	}

	function zoomTo(newScale, pivotX, pivotY) {
		const ptX = (pivotX - ox) / scale
		const ptY = (pivotY - oy) / scale
		scale = clamp(newScale, minScale, maxScale)
		ox = pivotX - ptX * scale
		oy = pivotY - ptY * scale
		clampOffsets()
		render()
		slider.value = Math.round(((scale - minScale) / (maxScale - minScale)) * 100)
	}

	img.onload = () => {
		minScale = Math.max(cropW / img.naturalWidth, cropH / img.naturalHeight)
		maxScale = minScale * 4
		scale    = minScale
		ox = (cropW - img.naturalWidth  * scale) / 2
		oy = (cropH - img.naturalHeight * scale) / 2
		render()
		requestAnimationFrame(() => overlay.classList.add("img-editor-overlay--visible"))
	}

	const reader = new FileReader()
	reader.onload = e => { img.src = e.target.result }
	reader.readAsDataURL(file)

	// Mouse drag
	let dragging = false, dsx = 0, dsy = 0, dox = 0, doy = 0

	frame.addEventListener("mousedown", e => {
		dragging = true
		dsx = e.clientX; dsy = e.clientY; dox = ox; doy = oy
		frame.style.cursor = "grabbing"
		e.preventDefault()
	})

	document.addEventListener("mousemove", e => {
		if (!dragging) return
		ox = dox + (e.clientX - dsx)
		oy = doy + (e.clientY - dsy)
		clampOffsets(); render()
	})

	document.addEventListener("mouseup", () => {
		dragging = false
		frame.style.cursor = "grab"
	})

	// Wheel zoom
	frame.addEventListener("wheel", e => {
		e.preventDefault()
		const rect  = frame.getBoundingClientRect()
		const delta = e.deltaY < 0 ? 0.12 : -0.12
		zoomTo(scale + (maxScale - minScale) * delta * 0.3, e.clientX - rect.left, e.clientY - rect.top)
	}, { passive: false })

	// Touch drag + pinch
	let lastDist = 0

	frame.addEventListener("touchstart", e => {
		e.preventDefault()
		if (e.touches.length === 1) {
			dragging = true
			dsx = e.touches[0].clientX; dsy = e.touches[0].clientY; dox = ox; doy = oy
			lastDist = 0
		} else if (e.touches.length === 2) {
			dragging = false
			lastDist = Math.hypot(
				e.touches[0].clientX - e.touches[1].clientX,
				e.touches[0].clientY - e.touches[1].clientY
			)
		}
	}, { passive: false })

	frame.addEventListener("touchmove", e => {
		e.preventDefault()
		if (e.touches.length === 1 && dragging) {
			ox = dox + (e.touches[0].clientX - dsx)
			oy = doy + (e.touches[0].clientY - dsy)
			clampOffsets(); render()
		} else if (e.touches.length === 2) {
			const dist = Math.hypot(
				e.touches[0].clientX - e.touches[1].clientX,
				e.touches[0].clientY - e.touches[1].clientY
			)
			if (lastDist) {
				const rect = frame.getBoundingClientRect()
				const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left
				const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top
				zoomTo(scale * (dist / lastDist), midX, midY)
			}
			lastDist = dist
		}
	}, { passive: false })

	frame.addEventListener("touchend", e => {
		if (e.touches.length < 2) lastDist = 0
		if (e.touches.length === 0) dragging = false
	})

	// Slider
	slider.addEventListener("input", () => {
		const t = slider.value / 100
		zoomTo(minScale + t * (maxScale - minScale), cropW / 2, cropH / 2)
	})

	function close() {
		overlay.classList.remove("img-editor-overlay--visible")
		setTimeout(() => overlay.remove(), 280)
	}

	cancelBtn.addEventListener("click", close)

	confirmBtn.addEventListener("click", () => {
		const canvas = document.createElement("canvas")
		canvas.width  = outputW
		canvas.height = outputH
		const ctx = canvas.getContext("2d")
		ctx.drawImage(img, -ox / scale, -oy / scale, cropW / scale, cropH / scale, 0, 0, outputW, outputH)
		const dataUrl = canvas.toDataURL("image/jpeg", 0.92)
		close()
		setTimeout(() => onConfirm(dataUrl), 10)
	})
}

// ============================================================
// PROFIL — Chargement des données utilisateur
// ============================================================

async function initProfil(user) {
	const uid      = user.id
	const username = user.user_metadata?.full_name || user.email.split("@")[0]

	// --- Bannière ---
	const bannerEl    = document.getElementById("profil-banner")
	const bannerInput = document.getElementById("profil-banner-input")

	const savedBanner = localStorage.getItem(`lpd_banner_${uid}`)
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
			const editorW = Math.min(window.innerWidth - 48, 720)
			const editorH = Math.round(editorW * 180 / 800)
			openImageEditor(file, editorW, editorH, 800, 180, false, dataUrl => {
				localStorage.setItem(`lpd_banner_${uid}`, dataUrl)
				bannerEl.style.backgroundImage = `url(${dataUrl})`
				bannerEl.style.backgroundSize = "cover"
				bannerEl.style.backgroundPosition = "center"
			})
			bannerInput.value = ""
		})
	}

	// --- Avatar ---
	const avatarEl      = document.getElementById("profil-avatar")
	const photoInput    = document.getElementById("profil-photo-input")
	const avatarEditBtn = document.getElementById("profil-avatar-edit-btn")

	const savedPhoto = localStorage.getItem(`lpd_photo_${uid}`)
	if (avatarEl) {
		if (savedPhoto) {
			avatarEl.style.backgroundImage = `url(${savedPhoto})`
			avatarEl.style.backgroundSize = "cover"
			avatarEl.style.backgroundPosition = "center"
			avatarEl.textContent = ""
		} else {
			avatarEl.textContent = username.charAt(0).toUpperCase()
		}
	}

	if (avatarEditBtn && photoInput) {
		avatarEditBtn.addEventListener("click", () => photoInput.click())

		photoInput.addEventListener("change", () => {
			const file = photoInput.files[0]
			if (!file) return
			const size = Math.min(window.innerWidth - 96, 280)
			openImageEditor(file, size, size, 300, 300, true, dataUrl => {
				localStorage.setItem(`lpd_photo_${uid}`, dataUrl)
				avatarEl.style.backgroundImage = `url(${dataUrl})`
				avatarEl.style.backgroundSize = "cover"
				avatarEl.style.backgroundPosition = "center"
				avatarEl.textContent = ""
			})
			photoInput.value = ""
		})
	}

	// --- Username ---
	const usernameEl = document.getElementById("profil-username")
	if (usernameEl) usernameEl.textContent = username

	// --- Date d'inscription ---
	const sinceEl = document.getElementById("profil-since")
	if (sinceEl && user.created_at) {
		const date = new Date(user.created_at)
		sinceEl.textContent = `Membre depuis ${date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`
	}

	// --- Bio ---
	const bioEl        = document.getElementById("profil-bio")
	const bioTextarea  = document.getElementById("profil-bio-textarea")
	const bioEditBtn   = document.getElementById("profil-bio-edit-btn")
	const bioSaveBtn   = document.getElementById("profil-bio-save")
	const bioCancelBtn = document.getElementById("profil-bio-cancel")
	const bioActions   = document.getElementById("profil-bio-actions")

	// Bio synced via Netlify metadata, fallback to localStorage
	let currentBio = user.user_metadata?.bio || localStorage.getItem(`lpd_bio_${uid}`) || ""
	if (bioEl && currentBio) bioEl.innerText = currentBio

	if (bioEditBtn) {
		bioEditBtn.addEventListener("click", () => {
			bioEl.style.display = "none"
			bioEditBtn.style.display = "none"
			bioTextarea.style.display = "block"
			bioActions.style.display = "flex"
			bioTextarea.value = currentBio
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
			currentBio = newBio
			localStorage.setItem(`lpd_bio_${uid}`, newBio)
			// Sync bio to Netlify Identity metadata
			window.netlifyIdentity?.currentUser()?.update({ data: { bio: newBio } })
			bioEl.innerText = newBio || "Aucune bio pour l'instant."
			bioTextarea.style.display = "none"
			bioActions.style.display = "none"
			bioEl.style.display = "block"
			bioEditBtn.style.display = "flex"
		})
	}

	// --- Statistiques & Favoris (Supabase) ---
	const streakEl  = document.getElementById("stat-streak")
	const versetsEl = document.getElementById("stat-versets")
	const favorisEl = document.getElementById("stat-favoris")
	const favorisContainer = document.getElementById("profil-favoris")

	if (typeof sbGetStats !== 'undefined') {
		try {
			const [stats, favorites] = await Promise.all([
				sbGetStats(uid),
				sbGetFavorites(uid)
			])

			if (streakEl)  streakEl.textContent  = stats?.streak      || 0
			if (versetsEl) versetsEl.textContent = stats?.versets_lus || 0
			if (favorisEl) favorisEl.textContent = favorites.length

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
		} catch (err) {
			console.error("[Supabase profil]", err)
		}
	}

	// --- Boutons Enregistrer / Réinitialiser ---
	const saveBtn    = document.getElementById("profil-save-btn")
	const resetBtn   = document.getElementById("profil-reset-btn")
	const feedbackEl = document.getElementById("profil-feedback")

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

			localStorage.removeItem(`lpd_photo_${uid}`)
			localStorage.removeItem(`lpd_banner_${uid}`)
			localStorage.removeItem(`lpd_bio_${uid}`)
			window.netlifyIdentity?.currentUser()?.update({ data: { bio: "" } })

			avatarEl.style.backgroundImage = ""
			avatarEl.style.backgroundSize  = ""
			avatarEl.textContent = username.charAt(0).toUpperCase()
			bannerEl.style.backgroundImage = ""
			bannerEl.style.backgroundSize  = ""
			bioEl.innerText = "Aucune bio pour l'instant."

			showFeedback("Profil réinitialisé.", "reset")
		})
	}

	// --- Activité récente ---
	const activite = JSON.parse(localStorage.getItem(`lpd_activite_${uid}`) || "[]")
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
}

// ============================================================
// Init — attendre Netlify Identity
// ============================================================
// Le script est defer : le DOM est déjà prêt, pas besoin de DOMContentLoaded.
// L'enregistrer directement évite que "init" tire avant que le listener soit posé.
if (!window.netlifyIdentity) {
	window.location.href = "../index.html"
} else {
	let _profilStarted = false
	function _startProfil(user) {
		if (_profilStarted) return
		_profilStarted = true
		if (!user) { window.location.href = "../index.html"; return }
		initProfil(user)
	}
	netlifyIdentity.on("init", _startProfil)
	// Fallback si "init" a déjà tiré
	const _existing = netlifyIdentity.currentUser()
	if (_existing) _startProfil(_existing)
}
