const CATEGORIES = {
	"Pentateuque":       ["Genèse", "Exode", "Lévitique", "Nombres", "Deutéronome"],
	"Livres historiques":["Josué", "Juges", "Ruth", "1 Samuel", "2 Samuel", "1 Rois", "2 Rois", "1 Chroniques", "2 Chroniques", "Esdras", "Néhémie", "Esther"],
	"Livres poétiques":  ["Job", "Psaumes", "Proverbes", "Ecclésiaste", "Cantique des Cantiques"],
	"Grands Prophètes":  ["Ésaïe", "Jérémie", "Lamentations", "Ézéchiel", "Daniel"],
	"Petits Prophètes":  ["Osée", "Joël", "Amos", "Abdias", "Jonas", "Michée", "Naoum", "Habacuc", "Sophonie", "Aggée", "Zacharie", "Malachie"],
	"Évangiles":         ["Matthieu", "Marc", "Luc", "Jean"],
	"Histoire":          ["Actes des Apôtres"],
	"Épîtres de Paul":   ["Romains", "1 Corinthiens", "2 Corinthiens", "Galates", "Éphésiens", "Philippiens", "Colossiens", "1 Thessaloniciens", "2 Thessaloniciens", "1 Timothée", "2 Timothée", "Tite", "Philémon"],
	"Épîtres générales": ["Hébreux", "Jacques", "1 Pierre", "2 Pierre", "1 Jean", "2 Jean", "3 Jean", "Jude"],
	"Prophétie":         ["Apocalypse"],
}

const BOOKS = {
	"Genèse": { chapters: 50, code: "GEN" }, "Exode": { chapters: 40, code: "EXO" },
	"Lévitique": { chapters: 27, code: "LEV" }, "Nombres": { chapters: 36, code: "NUM" },
	"Deutéronome": { chapters: 34, code: "DEU" }, "Josué": { chapters: 24, code: "JOS" },
	"Juges": { chapters: 21, code: "JDG" }, "Ruth": { chapters: 4, code: "RUT" },
	"1 Samuel": { chapters: 31, code: "1SA" }, "2 Samuel": { chapters: 24, code: "2SA" },
	"1 Rois": { chapters: 22, code: "1KI" }, "2 Rois": { chapters: 25, code: "2KI" },
	"1 Chroniques": { chapters: 29, code: "1CH" }, "2 Chroniques": { chapters: 36, code: "2CH" },
	"Esdras": { chapters: 10, code: "EZR" }, "Néhémie": { chapters: 13, code: "NEH" },
	"Esther": { chapters: 10, code: "EST" }, "Job": { chapters: 42, code: "JOB" },
	"Psaumes": { chapters: 150, code: "PSA" }, "Proverbes": { chapters: 31, code: "PRO" },
	"Ecclésiaste": { chapters: 12, code: "ECC" }, "Cantique des Cantiques": { chapters: 8, code: "SNG" },
	"Ésaïe": { chapters: 66, code: "ISA" }, "Jérémie": { chapters: 52, code: "JER" },
	"Lamentations": { chapters: 5, code: "LAM" }, "Ézéchiel": { chapters: 48, code: "EZK" },
	"Daniel": { chapters: 12, code: "DAN" }, "Osée": { chapters: 14, code: "HOS" },
	"Joël": { chapters: 3, code: "JOL" }, "Amos": { chapters: 9, code: "AMO" },
	"Abdias": { chapters: 1, code: "OBA" }, "Jonas": { chapters: 4, code: "JON" },
	"Michée": { chapters: 7, code: "MIC" }, "Naoum": { chapters: 3, code: "NAM" },
	"Habacuc": { chapters: 3, code: "HAB" }, "Sophonie": { chapters: 3, code: "ZEP" },
	"Aggée": { chapters: 2, code: "HAG" }, "Zacharie": { chapters: 14, code: "ZEC" },
	"Malachie": { chapters: 4, code: "MAL" }, "Matthieu": { chapters: 28, code: "MAT" },
	"Marc": { chapters: 16, code: "MRK" }, "Luc": { chapters: 24, code: "LUK" },
	"Jean": { chapters: 21, code: "JHN" }, "Actes des Apôtres": { chapters: 28, code: "ACT" },
	"Romains": { chapters: 16, code: "ROM" }, "1 Corinthiens": { chapters: 16, code: "1CO" },
	"2 Corinthiens": { chapters: 13, code: "2CO" }, "Galates": { chapters: 6, code: "GAL" },
	"Éphésiens": { chapters: 6, code: "EPH" }, "Philippiens": { chapters: 4, code: "PHP" },
	"Colossiens": { chapters: 4, code: "COL" }, "1 Thessaloniciens": { chapters: 5, code: "1TH" },
	"2 Thessaloniciens": { chapters: 3, code: "2TH" }, "1 Timothée": { chapters: 6, code: "1TI" },
	"2 Timothée": { chapters: 4, code: "2TI" }, "Tite": { chapters: 3, code: "TIT" },
	"Philémon": { chapters: 1, code: "PHM" }, "Hébreux": { chapters: 13, code: "HEB" },
	"Jacques": { chapters: 5, code: "JAS" }, "1 Pierre": { chapters: 5, code: "1PE" },
	"2 Pierre": { chapters: 3, code: "2PE" }, "1 Jean": { chapters: 5, code: "1JN" },
	"2 Jean": { chapters: 1, code: "2JN" }, "3 Jean": { chapters: 1, code: "3JN" },
	"Jude": { chapters: 1, code: "JUD" }, "Apocalypse": { chapters: 22, code: "REV" },
}

// ============================================================
// Rendu de la page
// ============================================================

const params    = new URLSearchParams(window.location.search)
const catName   = params.get("cat")
const testament = params.get("testament")
const books     = CATEGORIES[catName]

if (!books) {
	document.getElementById("cat-title").textContent = "Catégorie introuvable"
} else {
	document.title = `${catName} — La Parole de Dieu`
	document.getElementById("cat-testament").textContent = testament || ""
	document.getElementById("cat-title").textContent = catName
	document.getElementById("cat-count").textContent =
		books.length === 1 ? "1 livre" : `${books.length} livres`

	const container = document.getElementById("cat-books")
	for (const name of books) {
		const btn = document.createElement("button")
		btn.className = "categorie__book-item"
		btn.textContent = name
		btn.addEventListener("click", () => openModal(name))
		container.appendChild(btn)
	}
}

// ============================================================
// Modale chapitres
// ============================================================

const overlay  = document.createElement("div")
overlay.className = "categorie__modal-overlay"
document.body.appendChild(overlay)

const modal = document.createElement("div")
modal.className = "categorie__modal"
modal.innerHTML = `
	<button class="categorie__modal-close" id="cat-modal-close">✕</button>
	<p class="categorie__modal-book" id="cat-modal-book"></p>
	<h2 class="categorie__modal-title" id="cat-modal-title"></h2>
	<p class="categorie__modal-count" id="cat-modal-count"></p>
	<div class="categorie__modal-divider"></div>
	<div class="categorie__modal-grid" id="cat-modal-grid"></div>
`
document.body.appendChild(modal)

function openModal(bookName) {
	const book = BOOKS[bookName]
	if (!book) return

	document.getElementById("cat-modal-book").textContent = catName
	document.getElementById("cat-modal-title").textContent = bookName
	document.getElementById("cat-modal-count").innerHTML =
		book.chapters === 1
			? `<span class="categorie__modal-count-num">1</span> chapitre`
			: `<span class="categorie__modal-count-num">${book.chapters}</span> chapitres`

	const grid = document.getElementById("cat-modal-grid")
	grid.innerHTML = ""
	for (let i = 1; i <= book.chapters; i++) {
		const a = document.createElement("a")
		a.className = "categorie__modal-chapter"
		a.textContent = i
		a.href = `chapitre.html?code=${book.code}&chapter=${i}&name=${encodeURIComponent(bookName)}&from=categorie&cat=${encodeURIComponent(catName)}&testament=${encodeURIComponent(testament || "")}`
		grid.appendChild(a)
	}

	overlay.classList.add("categorie__modal-overlay--visible")
	modal.classList.add("categorie__modal--visible")
}

function closeModal() {
	overlay.classList.remove("categorie__modal-overlay--visible")
	modal.classList.remove("categorie__modal--visible")
}

document.getElementById("cat-modal-close").addEventListener("click", closeModal)
overlay.addEventListener("click", closeModal)
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal() })
