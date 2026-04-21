const normalizeR = str => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
function escapeHtml(str) {
	return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

const PAGE_SIZE = 30
let allResults   = []
let displayed    = 0
let currentQuery = ""

document.addEventListener("DOMContentLoaded", () => {
	const searchInput = document.getElementById("recherche-input")
	const searchBtn   = document.getElementById("recherche-btn")
	const statusEl    = document.getElementById("recherche-status")
	const listEl      = document.getElementById("recherche-results")
	const moreBtn     = document.getElementById("recherche-more")

	const urlQuery = new URLSearchParams(window.location.search).get("q") || ""
	if (searchInput) searchInput.value = urlQuery

	function renderCards() {
		const slice = allResults.slice(displayed, displayed + PAGE_SIZE)
		const words = normalizeR(currentQuery).split(/\s+/).filter(Boolean)

		for (const v of slice) {
			const card = document.createElement("div")
			card.className = "recherche__card"

			let highlighted = escapeHtml(v.t)
			for (const w of words) {
				const re = new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
				highlighted = highlighted.replace(re, "<mark>$1</mark>")
			}

			card.innerHTML = `
				<a class="recherche__card-ref" href="chapitre.html?code=${v.c}&chapter=${v.ch}&name=${encodeURIComponent(v.b)}&verse=${v.v}&highlight=${encodeURIComponent(currentQuery)}">${v.b} ${v.ch}:${v.v}</a>
				<p class="recherche__card-text">${highlighted}</p>
			`
			listEl.appendChild(card)
		}

		displayed += slice.length
		moreBtn.style.display = displayed < allResults.length ? "flex" : "none"
	}

	function doSearch(q) {
		q = q.trim()
		if (!q) return

		currentQuery = q
		const newUrl = new URL(window.location)
		newUrl.searchParams.set("q", q)
		window.history.replaceState({}, "", newUrl)

		statusEl.textContent = "Recherche en cours…"
		listEl.innerHTML = ""
		moreBtn.style.display = "none"
		displayed = 0
		allResults = []

		fetch("../api/search-index.json")
			.then(r => r.json())
			.then(index => {
				const words = normalizeR(q).split(/\s+/).filter(Boolean)
				allResults = index.filter(entry => words.every(w => normalizeR(entry.t).includes(w)))

				if (!allResults.length) {
					statusEl.textContent = "Aucun verset trouvé."
					return
				}

				const n = allResults.length
				statusEl.textContent = `${n} verset${n > 1 ? "s" : ""} trouvé${n > 1 ? "s" : ""}`
				renderCards()
			})
			.catch(() => { statusEl.textContent = "Erreur lors du chargement de la Bible." })
	}

	searchBtn?.addEventListener("click", () => doSearch(searchInput.value))
	searchInput?.addEventListener("keydown", e => { if (e.key === "Enter") doSearch(searchInput.value) })
	moreBtn?.addEventListener("click", renderCards)

	if (urlQuery) doSearch(urlQuery)
})
