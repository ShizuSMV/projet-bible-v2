// ============================================================
// COMMUNAUTÉ — Feed réel + Carousel + Amis + Signalements
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
	let currentUser  = null
	let likedPostIds = []
	let posts        = []
	let currentPage  = 0
	const PER_PAGE   = 10
	let hasMore      = true

	function escHtml(str) {
		return String(str ?? "")
			.replace(/&/g, "&amp;").replace(/</g, "&lt;")
			.replace(/>/g, "&gt;").replace(/"/g, "&quot;")
	}

	// ─── Auth ──────────────────────────────────────────────────
	async function onLogin(u) {
		if (!u || currentUser?.id === u.id) return
		currentUser = u
		const username = u.user_metadata?.full_name || u.email.split("@")[0]
		localStorage.setItem(`lpd_last_seen_${u.id}`, Date.now())
		await sbEnsureProfile(u.id, username)
		likedPostIds = await sbGetLikedPostIds(u.id)
		document.getElementById("post-form")?.style.setProperty("display", "flex")
		renderFeed()
	}

	if (window.netlifyIdentity) {
		netlifyIdentity.on("init", onLogin)
		const existing = netlifyIdentity.currentUser()
		if (existing) onLogin(existing)
	}

	// ─── Feed ──────────────────────────────────────────────────
	async function loadFeed(page = 0) {
		posts = await sbGetPosts(page, PER_PAGE)
		currentPage = page
		hasMore = posts.length === PER_PAGE
		renderFeed()
		window.scrollTo({ top: document.getElementById("communaute-feed")?.offsetTop - 80 || 0, behavior: "smooth" })
	}

	function renderFeed() {
		const feed = document.getElementById("communaute-feed")
		if (!feed) return
		feed.innerHTML = ""
		if (!posts.length) {
			feed.innerHTML = `<p class="communaute__empty">Soyez le premier à partager un verset !</p>`
			return
		}
		posts.forEach(post => {
			const liked  = likedPostIds.includes(post.id)
			const isOwn  = currentUser?.id === post.user_id
			const initial = post.username.charAt(0).toUpperCase()
			const date    = new Date(post.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
			const card    = document.createElement("div")
			card.className = "communaute__card"
			card.dataset.postId = post.id
			card.innerHTML = `
				<div class="communaute__card-header">
					<div class="communaute__card-user">
						<div class="communaute__card-avatar">${initial}</div>
						<span class="communaute__card-username">${escHtml(post.username)}</span>
					</div>
					<div class="communaute__card-header-right">
						${post.verse_ref ? `<span class="communaute__card-ref">${escHtml(post.verse_ref)}</span>` : ""}
						<span class="communaute__card-date">${date}</span>
					</div>
				</div>
				${post.verse_text ? `<p class="communaute__card-text">« ${escHtml(post.verse_text)} »</p>` : ""}
				${post.content    ? `<p class="communaute__card-comment">${escHtml(post.content)}</p>` : ""}
				<div class="communaute__card-footer">
					<button class="communaute__card-action communaute__card-like${liked ? " communaute__card-like--active" : ""}" data-post-id="${post.id}">
						${liked ? "♥" : "♡"} <span class="like-count">${post.likes_count || 0}</span>
					</button>
					${!isOwn && currentUser ? `<button class="communaute__card-action communaute__card-report" data-post-id="${post.id}" data-username="${escHtml(post.username)}">⚑ Signaler</button>` : ""}
					${isOwn ? `<button class="communaute__card-action communaute__card-delete" data-post-id="${post.id}">✕ Supprimer</button>` : ""}
				</div>`
			feed.appendChild(card)
		})
		const pag = document.createElement("div")
		pag.className = "communaute__pagination"
		pag.innerHTML = `
			${currentPage > 0 ? `<button class="communaute__page-btn" id="page-prev">← Précédents</button>` : `<span></span>`}
			<span class="communaute__page-info">Page ${currentPage + 1}</span>
			${hasMore ? `<button class="communaute__page-btn" id="page-next">Suivants →</button>` : `<span></span>`}
		`
		feed.appendChild(pag)
		document.getElementById("page-prev")?.addEventListener("click", () => loadFeed(currentPage - 1))
		document.getElementById("page-next")?.addEventListener("click", () => loadFeed(currentPage + 1))
	}

	document.getElementById("communaute-feed")?.addEventListener("click", async e => {
		const likeBtn = e.target.closest(".communaute__card-like")
		if (likeBtn && currentUser) {
			const postId = likeBtn.dataset.postId
			const liked  = likedPostIds.includes(postId)
			const post   = posts.find(p => p.id === postId)
			if (!post) return
			if (liked) {
				await sbUnlikePost(currentUser.id, postId)
				likedPostIds = likedPostIds.filter(id => id !== postId)
				post.likes_count = Math.max(0, (post.likes_count || 0) - 1)
			} else {
				await sbLikePost(currentUser.id, postId)
				likedPostIds.push(postId)
				post.likes_count = (post.likes_count || 0) + 1
			}
			renderFeed(); return
		}
		const deleteBtn = e.target.closest(".communaute__card-delete")
		if (deleteBtn && currentUser) {
			if (!confirm("Supprimer ce post ?")) return
			await sbDeletePost(deleteBtn.dataset.postId)
			posts = posts.filter(p => p.id !== deleteBtn.dataset.postId)
			renderFeed(); return
		}
		const reportBtn = e.target.closest(".communaute__card-report")
		if (reportBtn && currentUser) openReportModal("post", reportBtn.dataset.postId, reportBtn.dataset.username)
	})

	// ─── Formulaire de partage ─────────────────────────────────
	document.getElementById("post-submit")?.addEventListener("click", async () => {
		if (!currentUser) return
		const refInput  = document.getElementById("post-verse-ref")
		const textInput = document.getElementById("post-content")
		const verseRef  = refInput?.value.trim()
		const content   = textInput?.value.trim()
		if (!verseRef && !content) return
		const btn = document.getElementById("post-submit")
		btn.disabled = true
		try {
			const username = currentUser.user_metadata?.full_name || currentUser.email.split("@")[0]
			const post = await sbCreatePost({ uid: currentUser.id, username, verseRef, content })
			if (post) { posts.unshift(post); renderFeed() }
			if (refInput)  refInput.value  = ""
			if (textInput) textInput.value = ""
			showToast("Verset partagé !")
		} catch { /* ignore */ }
		btn.disabled = false
	})

	// ─── Modale signalement ────────────────────────────────────
	function openReportModal(type, id, username) {
		const overlay = document.createElement("div")
		overlay.className = "report-overlay"
		overlay.innerHTML = `
			<div class="report-box">
				<button class="report-close">✕</button>
				<p class="report-title">Signaler ${type === "post" ? "ce post" : "ce compte"}</p>
				<p class="report-subtitle">de <strong>${escHtml(username)}</strong></p>
				<select class="report-select" id="report-reason-sel">
					<option value="">Choisir une raison…</option>
					<option value="contenu_sexuel">Contenu sexuel ou inapproprié</option>
					<option value="harcelement">Harcèlement ou intimidation</option>
					<option value="discours_haineux">Discours haineux ou discriminatoire</option>
					<option value="violence">Violence ou contenu choquant</option>
					<option value="spam">Spam ou publicité</option>
					<option value="autre">Autre</option>
				</select>
				<button class="report-submit-btn">Envoyer</button>
			</div>`
		document.body.appendChild(overlay)
		requestAnimationFrame(() => overlay.classList.add("report-overlay--visible"))
		const close = () => {
			overlay.classList.remove("report-overlay--visible")
			setTimeout(() => overlay.remove(), 250)
		}
		overlay.querySelector(".report-close").addEventListener("click", close)
		overlay.querySelector(".report-submit-btn").addEventListener("click", async () => {
			const reason = overlay.querySelector("#report-reason-sel").value
			if (!reason) return
			await sbReport({ reporterId: currentUser.id, type, id, username, reason })
			close()
			showToast("Signalement envoyé. Merci.")
		})
	}

	function showToast(msg) {
		const t = document.createElement("div")
		t.className = "communaute__toast"
		t.textContent = msg
		document.body.appendChild(t)
		requestAnimationFrame(() => t.classList.add("communaute__toast--visible"))
		setTimeout(() => {
			t.classList.remove("communaute__toast--visible")
			setTimeout(() => t.remove(), 300)
		}, 3000)
	}

	// ─── Carousel membres (depuis Supabase profiles) ───────────
	const track = document.getElementById("membres-track")

	function formatName(username) {
		const parts = username.trim().split(/\s+/)
		if (parts.length >= 2) return `${parts[0]} ${parts[1].charAt(0).toUpperCase()}.`
		return username
	}

	// Modale profil membre
	const overlay = document.createElement("div")
	overlay.className = "profil-modal-overlay"
	document.body.appendChild(overlay)

	const modal = document.createElement("div")
	modal.className = "profil-modal"
	modal.innerHTML = `<button class="profil-modal__close" id="profil-modal-close">✕</button><div class="profil-modal__content" id="profil-modal-content"></div>`
	document.body.appendChild(modal)

	function closeProfilModal() {
		overlay.classList.remove("profil-modal-overlay--visible")
		modal.classList.remove("profil-modal--visible")
		setTimeout(() => { overlay.style.display = "none"; modal.style.display = "none" }, 280)
		if (track) track.style.animationPlayState = "running"
	}

	document.getElementById("profil-modal-close").addEventListener("click", closeProfilModal)
	overlay.addEventListener("click", closeProfilModal)

	async function openProfilModal(member) {
		const key        = member.user_id
		const photo      = member.avatar_url || localStorage.getItem(`lpd_photo_${key}`)
		const banner     = member.banner_url || localStorage.getItem(`lpd_banner_${key}`)
		const bio        = member.bio || localStorage.getItem(`lpd_bio_${key}`) || "Aucune bio."
		const streak     = parseInt(localStorage.getItem(`lpd_streak_${key}`) || "0")
		const streakMax  = parseInt(localStorage.getItem(`lpd_streak_max_${key}`) || streak)
		const since      = member.created_at
			? new Date(member.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
			: "—"
		const initial    = member.username.charAt(0).toUpperCase()
		const isOwnProfile = currentUser?.id === member.user_id

		const avatarHtml  = photo
			? `<div class="profil-modal__avatar" style="background-image:url(${photo});background-size:cover;background-position:center;"></div>`
			: `<div class="profil-modal__avatar">${initial}</div>`
		const bannerStyle = banner ? `background-image:url(${banner});background-size:cover;background-position:center;` : ""

		const modalContent = document.getElementById("profil-modal-content")
		modalContent.innerHTML = `
			<div class="profil-modal__banner" style="${bannerStyle}">${avatarHtml}</div>
			<h2 class="profil-modal__name">${escHtml(member.username)}</h2>
			<p class="profil-modal__since">Membre depuis ${since}</p>
			<p class="profil-modal__bio">${escHtml(bio)}</p>
			<div class="profil-modal__divider"></div>
			<div class="profil-modal__stats">
				<div class="profil-modal__stat">
					<span class="profil-modal__stat-icon">🔥</span>
					<span class="profil-modal__stat-value">${streak}<span class="profil-modal__stat-max">/ ${streakMax}</span></span>
					<span class="profil-modal__stat-label">Streak</span>
				</div>
			</div>
			${!isOwnProfile && currentUser ? `
			<div class="profil-modal__actions">
				<button class="profil-modal__friend-btn" id="modal-friend-btn" data-uid="${member.user_id}" data-username="${escHtml(member.username)}">+ Ajouter en ami</button>
				<button class="profil-modal__report-user-btn" data-uid="${member.user_id}" data-username="${escHtml(member.username)}">⚑ Signaler</button>
			</div>` : ""}
		`

		if (!isOwnProfile && currentUser) {
			// Vérifier statut amitié
			const status = await sbGetFriendStatus(currentUser.id, member.user_id)
			const friendBtn = document.getElementById("modal-friend-btn")
			if (friendBtn && status) {
				friendBtn.textContent = status.status === "accepted" ? "✓ Amis" : "Demande envoyée"
				friendBtn.disabled = true
			}
			friendBtn?.addEventListener("click", async function () {
				const ok = await sbSendFriendRequest(currentUser.id, this.dataset.uid)
				if (ok) { this.textContent = "Demande envoyée"; this.disabled = true }
			})
			modalContent.querySelector(".profil-modal__report-user-btn")?.addEventListener("click", function () {
				closeProfilModal()
				openReportModal("user", this.dataset.uid, this.dataset.username)
			})
		}

		overlay.style.display = "block"
		modal.style.display = "flex"
		requestAnimationFrame(() => {
			overlay.classList.add("profil-modal-overlay--visible")
			modal.classList.add("profil-modal--visible")
		})
		if (track) track.style.animationPlayState = "paused"
	}

	function buildCard(member) {
		const key      = member.user_id
		const photo    = member.avatar_url || localStorage.getItem(`lpd_photo_${key}`)
		const banner   = member.banner_url || localStorage.getItem(`lpd_banner_${key}`)
		const initial  = member.username.charAt(0).toUpperCase()
		const streak   = parseInt(localStorage.getItem(`lpd_streak_${key}`) || "0")
		const streakMax= parseInt(localStorage.getItem(`lpd_streak_max_${key}`) || streak)
		const createdAt= member.created_at
			? new Date(member.created_at).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })
			: "—"

		const card     = document.createElement("div")
		card.className = "communaute__membre-card"

		const bannerEl = document.createElement("div")
		bannerEl.className = "communaute__membre-banner"
		if (banner) { bannerEl.style.backgroundImage = `url(${banner})`; bannerEl.style.backgroundSize = "cover"; bannerEl.style.backgroundPosition = "center" }

		const avatar = document.createElement("div")
		avatar.className = "communaute__membre-avatar"
		if (photo) { avatar.style.backgroundImage = `url(${photo})`; avatar.style.backgroundSize = "cover"; avatar.style.backgroundPosition = "center" }
		else avatar.textContent = initial

		const nameEl = document.createElement("span")
		nameEl.className = "communaute__membre-name"
		nameEl.textContent = formatName(member.username)

		bannerEl.appendChild(avatar)
		bannerEl.appendChild(nameEl)

		const stats = document.createElement("div")
		stats.className = "communaute__membre-stats"
		stats.innerHTML = `
			<span class="communaute__membre-stat">🔥 <strong>${streak}</strong><span class="communaute__membre-stat-max">/${streakMax}</span></span>
			<span class="communaute__membre-stat communaute__membre-stat--date">${createdAt}</span>`

		card.appendChild(bannerEl)
		card.appendChild(stats)
		card.addEventListener("click", () => openProfilModal(member))
		return card
	}

	function shuffle(arr) {
		const a = [...arr]
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]]
		}
		return a
	}

	function renderCarousel(memberList) {
		if (!track) return
		track.innerHTML = ""
		if (!memberList.length) {
			track.closest(".communaute__membres-carousel").innerHTML = `<p style="font-family:'Cormorant Garamond',serif;font-size:1rem;color:rgba(255,255,255,.35);font-style:italic;text-align:center;padding:32px 0;">Soyez le premier à rejoindre la communauté — connectez-vous pour apparaître ici.</p>`
			return
		}
		const minCards = Math.max(memberList.length * 2, 16)
		const repeated = []
		while (repeated.length < minCards) repeated.push(...shuffle(memberList))
		const allCards = [...repeated, ...repeated]
		allCards.forEach(m => track.appendChild(buildCard(m)))
		track.style.animationDuration = `${repeated.length * 3}s`
	}

	function updateOnlineCount(memberList) {
		const ONLINE_THRESHOLD = 5 * 60 * 1000
		const onlineCount = memberList.filter(u => {
			const seen = parseInt(localStorage.getItem(`lpd_last_seen_${u.user_id}`) || "0")
			return Date.now() - seen < ONLINE_THRESHOLD
		}).length
		const onlineEl = document.getElementById("online-count")
		const totalEl  = document.getElementById("total-count")
		if (onlineEl) onlineEl.textContent = onlineCount
		if (totalEl)  totalEl.textContent  = memberList.length
	}

	if (track) {
		track.addEventListener("mouseenter", () => track.style.animationPlayState = "paused")
		track.addEventListener("mouseleave", () => track.style.animationPlayState = "running")
	}

	// ─── Init ──────────────────────────────────────────────────
	const [, members] = await Promise.all([loadFeed(), sbGetAllProfiles()])
	updateOnlineCount(members)
	renderCarousel(members)
})
