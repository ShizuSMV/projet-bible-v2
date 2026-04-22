const params    = new URLSearchParams(window.location.search)
const code      = params.get("code")
const chapter   = parseInt(params.get("chapter"))
const bookName  = params.get("name")
const from      = params.get("from")
const catName   = params.get("cat")
const testament = params.get("testament")
const targetVerse = params.get("verse") ? parseInt(params.get("verse")) : null
const highlight   = params.get("highlight") || null

// Bouton retour → catégorie ou hub selon l'origine
const backBtn = document.getElementById("chapitre-back-btn")
if (backBtn && bookName) {
	if (from === "categorie" && catName) {
		backBtn.href = `categorie.html?cat=${encodeURIComponent(catName)}&testament=${encodeURIComponent(testament || "")}`
	} else {
		backBtn.href = `hub.html?book=${encodeURIComponent(bookName)}`
	}
}

// Convertit un lien API absolu en chemin relatif utilisable
function apiLinkToPath(link) {
	if (!link) return null
	// /api/fra_lsg/GEN/2.json → ../api/fra_lsg/GEN/2.json
	return ".." + link
}

// Construit l'URL de chapitre.html depuis un lien API
function chapitreUrlFromApiLink(link, name) {
	if (!link) return null
	const parts = link.replace("/api/fra_lsg/", "").replace(".json", "").split("/")
	const c = parts[0]
	const n = parts[1]
	return `chapitre.html?code=${c}&chapter=${n}&name=${encodeURIComponent(name)}`
}

async function loadChapter() {
	const path = `../api/fra_lsg/${code}/${chapter}.json`

	let data
	try {
		const res = await fetch(path)
		data = await res.json()
	} catch {
		document.getElementById("chapitre-content").innerHTML =
			`<p class="chapitre__error">Impossible de charger ce chapitre.</p>`
		return
	}

	// Titre
	document.title = `${bookName} ${chapter} — La Parole de Dieu`
	const bookNameEl = document.getElementById("chapitre-book-name")
	const titleEl    = document.getElementById("chapitre-title")
	if (bookNameEl) bookNameEl.textContent = bookName
	if (titleEl)    titleEl.textContent    = `Chapitre ${chapter}`

	// Contenu
	const container = document.getElementById("chapitre-content")
	container.innerHTML = ""

	for (const item of data.chapter.content) {
		if (item.type === "heading") {
			const h = document.createElement("h3")
			h.className = "chapitre__heading"
			h.textContent = item.content.join(" ")
			container.appendChild(h)
		} else if (item.type === "verse") {
			const div = document.createElement("div")
			div.className = "chapitre__verse"
			div.dataset.verse = item.number

			const num = document.createElement("span")
			num.className = "chapitre__verse-num"
			num.textContent = item.number

			const parts = []
			for (const c of item.content) {
				if (typeof c === "string") parts.push(c)
				else if (c.text) parts.push(c.text)
			}
			const rawText = parts.join(" ")

			const text = document.createElement("p")
			text.className = "chapitre__verse-text"

			if (highlight && item.number === targetVerse) {
				text.innerHTML = highlightWords(rawText, highlight)
			} else {
				text.textContent = rawText
			}

			div.appendChild(num)
			div.appendChild(text)
			container.appendChild(div)
		}
	}

	// Navigation précédent / suivant
	const prevBtn = document.getElementById("chapitre-prev")
	const nextBtn = document.getElementById("chapitre-next")

	const prevUrl = chapitreUrlFromApiLink(data.previousChapterApiLink, bookName)
	const nextUrl = chapitreUrlFromApiLink(data.nextChapterApiLink, bookName)

	if (prevUrl) {
		prevBtn.href = prevUrl
		prevBtn.classList.remove("chapitre__nav-btn--hidden")
	} else {
		prevBtn.classList.add("chapitre__nav-btn--hidden")
	}

	if (nextUrl) {
		nextBtn.href = nextUrl
		nextBtn.classList.remove("chapitre__nav-btn--hidden")
	} else {
		nextBtn.classList.add("chapitre__nav-btn--hidden")
	}
}

function highlightWords(text, query) {
	const words = query.trim().split(/\s+/).filter(w => w.length > 2)
	if (!words.length) return escapeHtml(text)
	const pattern = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")
	const regex = new RegExp(`(${pattern})`, "gi")
	return escapeHtml(text).replace(regex, "<mark>$1</mark>")
}

function escapeHtml(str) {
	return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
}

function scrollToVerse() {
	if (!targetVerse) return
	const el = document.querySelector(`[data-verse="${targetVerse}"]`)
	if (!el) return
	el.scrollIntoView({ behavior: "smooth", block: "center" })
	el.classList.add("chapitre__verse--highlight")
	el.addEventListener("animationend", () => el.classList.remove("chapitre__verse--highlight"), { once: true })
}

loadChapter().then(() => {
	scrollToVerse()
	initInteractions()
})

const _ICON = {
	heartOff:     `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
	heartOn:      `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
	bookmarkOff:  `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
	bookmarkOn:   `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
	checkOff:     `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>`,
	checkOn:      `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
}

function _makeActionBtn({ mod, iconOff, iconOn, label, active, onAdd, onRemove, refs, ref }) {
	const btn = document.createElement('button')
	btn.type = 'button'
	btn.className = `chapitre__action-btn chapitre__action-btn--${mod}${active ? ' chapitre__action-btn--active' : ''}`
	btn.setAttribute('aria-label', label)
	btn.innerHTML = active ? iconOn : iconOff

	btn.addEventListener('click', async () => {
		try {
			if (refs.has(ref)) {
				await onRemove()
				refs.delete(ref)
				btn.innerHTML = iconOff
				btn.classList.remove('chapitre__action-btn--active')
			} else {
				await onAdd()
				refs.add(ref)
				btn.innerHTML = iconOn
				btn.classList.add('chapitre__action-btn--active')
			}
		} catch (err) {
			console.error("[Supabase verset]", err)
		}
	})
	return btn
}

async function initInteractions() {
	const user = window.netlifyIdentity?.currentUser()
	if (!user || typeof sbTrackRead === 'undefined') return

	const uid       = user.id
	const verseDivs = document.querySelectorAll('.chapitre__verse')

	const [, favorites, saved, read] = await Promise.all([
		sbTrackRead(uid),
		sbGetFavorites(uid),
		sbGetSaved(uid),
		sbGetRead(uid)
	])

	console.log('[debug] uid:', uid)
	console.log('[debug] read_verses:', read)
	console.log('[debug] favorites:', favorites)

	const favRefs   = new Set(favorites.map(f => f.ref))
	const savedRefs = new Set(saved.map(s => s.ref))
	const readRefs  = new Set(read.map(r => r.ref))

	verseDivs.forEach(div => {
		const verseNum = parseInt(div.dataset.verse)
		const ref      = `${bookName} ${chapter}:${verseNum}`
		const rawText  = div.querySelector('.chapitre__verse-text')?.textContent || ''

		const actions = document.createElement('div')
		actions.className = 'chapitre__verse-actions'

		actions.appendChild(_makeActionBtn({
			mod: 'fav', label: 'Favori',
			iconOff: _ICON.heartOff, iconOn: _ICON.heartOn,
			active: favRefs.has(ref), refs: favRefs, ref,
			onAdd:    () => sbAddFavorite(uid, ref, rawText),
			onRemove: () => sbRemoveFavorite(uid, ref),
		}))

		actions.appendChild(_makeActionBtn({
			mod: 'save', label: 'Enregistrer',
			iconOff: _ICON.bookmarkOff, iconOn: _ICON.bookmarkOn,
			active: savedRefs.has(ref), refs: savedRefs, ref,
			onAdd:    () => sbAddSaved(uid, ref, rawText),
			onRemove: () => sbRemoveSaved(uid, ref),
		}))

		actions.appendChild(_makeActionBtn({
			mod: 'read', label: 'Marquer comme lu',
			iconOff: _ICON.checkOff, iconOn: _ICON.checkOn,
			active: readRefs.has(ref), refs: readRefs, ref,
			onAdd:    () => sbAddRead(uid, ref),
			onRemove: () => sbRemoveRead(uid, ref),
		}))

		div.appendChild(actions)
	})
}
