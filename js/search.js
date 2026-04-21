const BOOKS = {
	"Genèse": "GEN", "Exode": "EXO", "Lévitique": "LEV", "Nombres": "NUM",
	"Deutéronome": "DEU", "Josué": "JOS", "Juges": "JDG", "Ruth": "RUT",
	"1 Samuel": "1SA", "2 Samuel": "2SA", "1 Rois": "1KI", "2 Rois": "2KI",
	"1 Chroniques": "1CH", "2 Chroniques": "2CH", "Esdras": "EZR", "Néhémie": "NEH",
	"Esther": "EST", "Job": "JOB", "Psaumes": "PSA", "Proverbes": "PRO",
	"Ecclésiaste": "ECC", "Cantique des Cantiques": "SNG", "Ésaïe": "ISA",
	"Jérémie": "JER", "Lamentations": "LAM", "Ézéchiel": "EZK", "Daniel": "DAN",
	"Osée": "HOS", "Joël": "JOL", "Amos": "AMO", "Abdias": "OBA", "Jonas": "JON",
	"Michée": "MIC", "Naoum": "NAM", "Habacuc": "HAB", "Sophonie": "ZEP",
	"Aggée": "HAG", "Zacharie": "ZEC", "Malachie": "MAL", "Matthieu": "MAT",
	"Marc": "MRK", "Luc": "LUK", "Jean": "JHN", "Actes des Apôtres": "ACT",
	"Romains": "ROM", "1 Corinthiens": "1CO", "2 Corinthiens": "2CO",
	"Galates": "GAL", "Éphésiens": "EPH", "Philippiens": "PHP", "Colossiens": "COL",
	"1 Thessaloniciens": "1TH", "2 Thessaloniciens": "2TH", "1 Timothée": "1TI",
	"2 Timothée": "2TI", "Tite": "TIT", "Philémon": "PHM", "Hébreux": "HEB",
	"Jacques": "JAS", "1 Pierre": "1PE", "2 Pierre": "2PE", "1 Jean": "1JN",
	"2 Jean": "2JN", "3 Jean": "3JN", "Jude": "JUD", "Apocalypse": "REV",
}

const BOOK_NAMES = Object.keys(BOOKS)

// Normalise une chaîne pour la comparaison (retire accents, minuscules)
function normalize(str) {
	return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

// Trouve le nom exact d'un livre à partir d'une saisie partielle
function findBook(input) {
	const norm = normalize(input.trim())
	return BOOK_NAMES.find(name => normalize(name).startsWith(norm) || normalize(name) === norm) || null
}

// Index de versets — chargé une seule fois à la demande
let _index = null
let _indexPromise = null

function loadIndex() {
	if (_index) return Promise.resolve(_index)
	if (_indexPromise) return _indexPromise
	_indexPromise = fetch("api/search-index.json")
		.then(r => r.json())
		.then(data => { _index = data; return data })
	return _indexPromise
}

// Recherche par mots-clés dans l'index
function searchVerses(query) {
	if (!_index) return []
	const words = normalize(query).split(/\s+/).filter(w => w.length > 2)
	if (!words.length) return []
	const results = []
	for (const entry of _index) {
		const t = normalize(entry.t)
		if (words.every(w => t.includes(w))) {
			results.push(entry)
			if (results.length >= 4) break
		}
	}
	return results
}

// Détecte si la requête ressemble à des mots-clés (pas un livre/chapitre)
function isKeywordQuery(q) {
	if (q.length < 3) return false
	if (q.match(/^(.+?)\s+\d+(:\d+)?$/)) return false
	if (findBook(q.split(" ")[0])) return false
	return true
}

// Parse la requête et retourne un tableau de suggestions (async)
async function getSuggestions(query) {
	const q = query.trim()
	if (!q) return []

	const suggestions = []

	// Format "Livre C:V" → Jean 3:16
	const verseMatch = q.match(/^(.+?)\s+(\d+):(\d+)$/)
	if (verseMatch) {
		const [, bookPart, chap, verse] = verseMatch
		const book = findBook(bookPart)
		if (book) {
			suggestions.push({
				label: `${book} ${chap}:${verse}`,
				sub: "Verset",
				url: `pages/chapitre.html?code=${BOOKS[book]}&chapter=${chap}&name=${encodeURIComponent(book)}&verse=${verse}`,
			})
		}
	}

	// Format "Livre C" → Jean 3
	const chapMatch = q.match(/^(.+?)\s+(\d+)$/)
	if (chapMatch) {
		const [, bookPart, chap] = chapMatch
		const book = findBook(bookPart)
		if (book) {
			suggestions.push({
				label: `${book} — Chapitre ${chap}`,
				sub: "Chapitre",
				url: `pages/chapitre.html?code=${BOOKS[book]}&chapter=${chap}&name=${encodeURIComponent(book)}`,
			})
		}
	}

	// Livres correspondants
	const qNorm = normalize(q)
	const matchingBooks = BOOK_NAMES.filter(name =>
		normalize(name).includes(qNorm)
	).slice(0, 3)

	for (const name of matchingBooks) {
		suggestions.push({
			label: name,
			sub: "Livre",
			url: `pages/hub.html?book=${encodeURIComponent(name)}`,
		})
	}

	// Recherche par mots-clés
	if (isKeywordQuery(q)) {
		await loadIndex()
		const verses = searchVerses(q)
		for (const v of verses) {
			const preview = v.t.length > 80 ? v.t.slice(0, 80) + "…" : v.t
			suggestions.push({
				label: `${v.b} ${v.ch}:${v.v}`,
				sub: preview,
				url: `pages/chapitre.html?code=${v.c}&chapter=${v.ch}&name=${encodeURIComponent(v.b)}&verse=${v.v}&highlight=${encodeURIComponent(q)}`,
				verse: true,
			})
		}
	}

	return suggestions.slice(0, 7)
}

// ============================================================
// DOM
// ============================================================

const searchInput = document.querySelector(".main__recherche-bar")
const searchBtn   = document.querySelector(".main__recherche-icon")

if (searchInput) {
	// Crée le dropdown
	const dropdown = document.createElement("ul")
	dropdown.className = "search-dropdown"
	searchInput.parentElement.appendChild(dropdown)

	let activeIndex = -1

	function renderDropdown(suggestions) {
		dropdown.innerHTML = ""
		activeIndex = -1

		if (!suggestions.length) {
			dropdown.classList.remove("search-dropdown--visible")
			return
		}

		for (const [i, s] of suggestions.entries()) {
			const li = document.createElement("li")
			li.className = "search-dropdown__item" + (s.verse ? " search-dropdown__item--verse" : "")
			li.innerHTML = `
				<span class="search-dropdown__label">${s.label}</span>
				<span class="search-dropdown__sub">${s.sub}</span>
			`
			li.addEventListener("mousedown", (e) => {
				e.preventDefault()
				navigate(s.url)
			})
			dropdown.appendChild(li)
		}

		dropdown.classList.add("search-dropdown--visible")
	}

	function navigate(url) {
		window.location.href = url
	}

	function closeDropdown() {
		dropdown.classList.remove("search-dropdown--visible")
		activeIndex = -1
	}

	let lastSuggestions = []

	searchInput.addEventListener("input", async () => {
		const suggestions = await getSuggestions(searchInput.value)
		lastSuggestions = suggestions
		renderDropdown(suggestions)
	})

	searchInput.addEventListener("keydown", (e) => {
		const items = dropdown.querySelectorAll(".search-dropdown__item")

		if (e.key === "ArrowDown") {
			e.preventDefault()
			activeIndex = Math.min(activeIndex + 1, items.length - 1)
		} else if (e.key === "ArrowUp") {
			e.preventDefault()
			activeIndex = Math.max(activeIndex - 1, -1)
		} else if (e.key === "Enter") {
			e.preventDefault()
			if (activeIndex >= 0 && lastSuggestions[activeIndex]) {
				navigate(lastSuggestions[activeIndex].url)
			} else if (lastSuggestions.length) {
				navigate(lastSuggestions[0].url)
			}
			return
		} else if (e.key === "Escape") {
			closeDropdown()
			return
		}

		items.forEach((el, i) => el.classList.toggle("search-dropdown__item--active", i === activeIndex))
	})

	searchInput.addEventListener("blur", () => {
		setTimeout(closeDropdown, 150)
	})

	searchBtn.addEventListener("click", () => {
		if (lastSuggestions.length) navigate(lastSuggestions[0].url)
	})
}
