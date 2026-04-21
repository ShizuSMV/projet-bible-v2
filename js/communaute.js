// ============================================================
// COMMUNAUTÉ — Carousel infini des membres
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
	const track = document.getElementById("membres-track")
	if (!track) return

	const users = JSON.parse(localStorage.getItem("lpd_users") || "[]")

	// --- Modale profil ---
	const overlay = document.createElement("div")
	overlay.className = "profil-modal-overlay"
	document.body.appendChild(overlay)

	const modal = document.createElement("div")
	modal.className = "profil-modal"
	modal.innerHTML = `<button class="profil-modal__close" id="profil-modal-close">✕</button><div class="profil-modal__content" id="profil-modal-content"></div>`
	document.body.appendChild(modal)

	function openProfilModal(user) {
		const photo     = localStorage.getItem(`lpd_photo_${user.email}`)
		const banner    = localStorage.getItem(`lpd_banner_${user.email}`)
		const bio       = localStorage.getItem(`lpd_bio_${user.email}`) || "Aucune bio."
		const streak    = parseInt(localStorage.getItem(`lpd_streak_${user.email}`) || "0")
		const streakMax = parseInt(localStorage.getItem(`lpd_streak_max_${user.email}`) || streak)
		const shares    = parseInt(localStorage.getItem(`lpd_shares_${user.email}`) || "0")
		const versets   = parseInt(localStorage.getItem(`lpd_versets_${user.email}`) || "0")
		const since     = user.createdAt
			? new Date(user.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
			: "—"

		const initial = user.username.charAt(0).toUpperCase()

		const avatarHtml = photo
			? `<div class="profil-modal__avatar" style="background-image:url(${photo});background-size:cover;background-position:center;"></div>`
			: `<div class="profil-modal__avatar">${initial}</div>`

		const bannerStyle = banner
			? `background-image:url(${banner});background-size:cover;background-position:center;`
			: ""

		document.getElementById("profil-modal-content").innerHTML = `
			<div class="profil-modal__banner" style="${bannerStyle}">
				${avatarHtml}
			</div>
			<h2 class="profil-modal__name">${user.username}</h2>
			<p class="profil-modal__since">Membre depuis ${since}</p>
			<p class="profil-modal__bio">${bio}</p>

			<div class="profil-modal__divider"></div>

			<div class="profil-modal__stats">
				<div class="profil-modal__stat">
					<span class="profil-modal__stat-icon">🔥</span>
					<span class="profil-modal__stat-value">${streak}<span class="profil-modal__stat-max">/ ${streakMax}</span></span>
					<span class="profil-modal__stat-label">Streak</span>
				</div>
				<div class="profil-modal__stat">
					<span class="profil-modal__stat-icon">📖</span>
					<span class="profil-modal__stat-value">${versets}</span>
					<span class="profil-modal__stat-label">Versets lus</span>
				</div>
				<div class="profil-modal__stat">
					<span class="profil-modal__stat-icon">✦</span>
					<span class="profil-modal__stat-value">${shares}</span>
					<span class="profil-modal__stat-label">Partages</span>
				</div>
			</div>
		`

		overlay.style.display = "block"
		modal.style.display = "flex"
		requestAnimationFrame(() => {
			overlay.classList.add("profil-modal-overlay--visible")
			modal.classList.add("profil-modal--visible")
		})

		track.style.animationPlayState = "paused"
	}

	function closeProfilModal() {
		overlay.classList.remove("profil-modal-overlay--visible")
		modal.classList.remove("profil-modal--visible")
		setTimeout(() => {
			overlay.style.display = "none"
			modal.style.display = "none"
		}, 280)
		track.style.animationPlayState = "running"
	}

	document.getElementById("profil-modal-close").addEventListener("click", closeProfilModal)
	overlay.addEventListener("click", closeProfilModal)

	// --- Carousel ---
	function shuffle(arr) {
		const a = [...arr]
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]]
		}
		return a
	}

	function formatName(username) {
		const parts = username.trim().split(/\s+/)
		if (parts.length >= 2) return `${parts[0]} ${parts[1].charAt(0).toUpperCase()}.`
		return username
	}

	function buildCard(user) {
		const photo     = localStorage.getItem(`lpd_photo_${user.email}`)
		const banner    = localStorage.getItem(`lpd_banner_${user.email}`)
		const initial   = user.username.charAt(0).toUpperCase()
		const streak    = parseInt(localStorage.getItem(`lpd_streak_${user.email}`) || "0")
		const streakMax = parseInt(localStorage.getItem(`lpd_streak_max_${user.email}`) || streak)
		const shares    = parseInt(localStorage.getItem(`lpd_shares_${user.email}`) || "0")
		const createdAt = user.createdAt
			? new Date(user.createdAt).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })
			: "—"

		const card = document.createElement("div")
		card.className = "communaute__membre-card"
		card.style.cursor = "pointer"

		// Bannière
		const bannerEl = document.createElement("div")
		bannerEl.className = "communaute__membre-banner"
		if (banner) {
			bannerEl.style.backgroundImage = `url(${banner})`
			bannerEl.style.backgroundSize = "cover"
			bannerEl.style.backgroundPosition = "center"
		}

		// Avatar par-dessus la bannière
		const avatar = document.createElement("div")
		avatar.className = "communaute__membre-avatar"
		if (photo) {
			avatar.style.backgroundImage = `url(${photo})`
			avatar.style.backgroundSize = "cover"
			avatar.style.backgroundPosition = "center"
		} else {
			avatar.textContent = initial
		}

		const nameEl = document.createElement("span")
		nameEl.className = "communaute__membre-name"
		nameEl.textContent = formatName(user.username)

		bannerEl.appendChild(avatar)
		bannerEl.appendChild(nameEl)

		const stats = document.createElement("div")
		stats.className = "communaute__membre-stats"
		stats.innerHTML = `
			<span class="communaute__membre-stat">🔥 <strong>${streak}</strong><span class="communaute__membre-stat-max">/${streakMax}</span></span>
			<span class="communaute__membre-stat">✦ <strong>${shares}</strong></span>
			<span class="communaute__membre-stat communaute__membre-stat--date">${createdAt}</span>
		`

		card.appendChild(bannerEl)
		card.appendChild(stats)

		card.addEventListener("click", () => openProfilModal(user))
		return card
	}

	function renderCarousel(users) {
		track.innerHTML = ""
		if (!users.length) {
			track.closest(".communaute__membres-carousel").style.display = "none"
			return
		}

		const minCards = Math.max(users.length * 2, 16)
		const repeated = []
		while (repeated.length < minCards) repeated.push(...shuffle(users))

		const allCards = [...repeated, ...repeated]
		allCards.forEach(user => track.appendChild(buildCard(user)))

		track.style.animationDuration = `${repeated.length * 3}s`
	}

	renderCarousel(users)

	track.addEventListener("mouseenter", () => track.style.animationPlayState = "paused")
	track.addEventListener("mouseleave", () => track.style.animationPlayState = "running")
})
