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
	document.getElementById("chapitre-book-name").textContent = bookName
	document.getElementById("chapitre-title").textContent = `Chapitre ${chapter}`

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

loadChapter().then(scrollToVerse)
