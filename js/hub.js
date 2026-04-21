const BOOKS = {
	// Ancien Testament
	"Genèse":                 { chapters: 50,  testament: "Ancien Testament", code: "GEN" },
	"Exode":                  { chapters: 40,  testament: "Ancien Testament", code: "EXO" },
	"Lévitique":              { chapters: 27,  testament: "Ancien Testament", code: "LEV" },
	"Nombres":                { chapters: 36,  testament: "Ancien Testament", code: "NUM" },
	"Deutéronome":            { chapters: 34,  testament: "Ancien Testament", code: "DEU" },
	"Josué":                  { chapters: 24,  testament: "Ancien Testament", code: "JOS" },
	"Juges":                  { chapters: 21,  testament: "Ancien Testament", code: "JDG" },
	"Ruth":                   { chapters: 4,   testament: "Ancien Testament", code: "RUT" },
	"1 Samuel":               { chapters: 31,  testament: "Ancien Testament", code: "1SA" },
	"2 Samuel":               { chapters: 24,  testament: "Ancien Testament", code: "2SA" },
	"1 Rois":                 { chapters: 22,  testament: "Ancien Testament", code: "1KI" },
	"2 Rois":                 { chapters: 25,  testament: "Ancien Testament", code: "2KI" },
	"1 Chroniques":           { chapters: 29,  testament: "Ancien Testament", code: "1CH" },
	"2 Chroniques":           { chapters: 36,  testament: "Ancien Testament", code: "2CH" },
	"Esdras":                 { chapters: 10,  testament: "Ancien Testament", code: "EZR" },
	"Néhémie":                { chapters: 13,  testament: "Ancien Testament", code: "NEH" },
	"Esther":                 { chapters: 10,  testament: "Ancien Testament", code: "EST" },
	"Job":                    { chapters: 42,  testament: "Ancien Testament", code: "JOB" },
	"Psaumes":                { chapters: 150, testament: "Ancien Testament", code: "PSA" },
	"Proverbes":              { chapters: 31,  testament: "Ancien Testament", code: "PRO" },
	"Ecclésiaste":            { chapters: 12,  testament: "Ancien Testament", code: "ECC" },
	"Cantique des Cantiques": { chapters: 8,   testament: "Ancien Testament", code: "SNG" },
	"Ésaïe":                  { chapters: 66,  testament: "Ancien Testament", code: "ISA" },
	"Jérémie":                { chapters: 52,  testament: "Ancien Testament", code: "JER" },
	"Lamentations":           { chapters: 5,   testament: "Ancien Testament", code: "LAM" },
	"Ézéchiel":               { chapters: 48,  testament: "Ancien Testament", code: "EZK" },
	"Daniel":                 { chapters: 12,  testament: "Ancien Testament", code: "DAN" },
	"Osée":                   { chapters: 14,  testament: "Ancien Testament", code: "HOS" },
	"Joël":                   { chapters: 3,   testament: "Ancien Testament", code: "JOL" },
	"Amos":                   { chapters: 9,   testament: "Ancien Testament", code: "AMO" },
	"Abdias":                 { chapters: 1,   testament: "Ancien Testament", code: "OBA" },
	"Jonas":                  { chapters: 4,   testament: "Ancien Testament", code: "JON" },
	"Michée":                 { chapters: 7,   testament: "Ancien Testament", code: "MIC" },
	"Naoum":                  { chapters: 3,   testament: "Ancien Testament", code: "NAM" },
	"Habacuc":                { chapters: 3,   testament: "Ancien Testament", code: "HAB" },
	"Sophonie":               { chapters: 3,   testament: "Ancien Testament", code: "ZEP" },
	"Aggée":                  { chapters: 2,   testament: "Ancien Testament", code: "HAG" },
	"Zacharie":               { chapters: 14,  testament: "Ancien Testament", code: "ZEC" },
	"Malachie":               { chapters: 4,   testament: "Ancien Testament", code: "MAL" },
	// Nouveau Testament
	"Matthieu":               { chapters: 28,  testament: "Nouveau Testament", code: "MAT" },
	"Marc":                   { chapters: 16,  testament: "Nouveau Testament", code: "MRK" },
	"Luc":                    { chapters: 24,  testament: "Nouveau Testament", code: "LUK" },
	"Jean":                   { chapters: 21,  testament: "Nouveau Testament", code: "JHN" },
	"Actes des Apôtres":      { chapters: 28,  testament: "Nouveau Testament", code: "ACT" },
	"Romains":                { chapters: 16,  testament: "Nouveau Testament", code: "ROM" },
	"1 Corinthiens":          { chapters: 16,  testament: "Nouveau Testament", code: "1CO" },
	"2 Corinthiens":          { chapters: 13,  testament: "Nouveau Testament", code: "2CO" },
	"Galates":                { chapters: 6,   testament: "Nouveau Testament", code: "GAL" },
	"Éphésiens":              { chapters: 6,   testament: "Nouveau Testament", code: "EPH" },
	"Philippiens":            { chapters: 4,   testament: "Nouveau Testament", code: "PHP" },
	"Colossiens":             { chapters: 4,   testament: "Nouveau Testament", code: "COL" },
	"1 Thessaloniciens":      { chapters: 5,   testament: "Nouveau Testament", code: "1TH" },
	"2 Thessaloniciens":      { chapters: 3,   testament: "Nouveau Testament", code: "2TH" },
	"1 Timothée":             { chapters: 6,   testament: "Nouveau Testament", code: "1TI" },
	"2 Timothée":             { chapters: 4,   testament: "Nouveau Testament", code: "2TI" },
	"Tite":                   { chapters: 3,   testament: "Nouveau Testament", code: "TIT" },
	"Philémon":               { chapters: 1,   testament: "Nouveau Testament", code: "PHM" },
	"Hébreux":                { chapters: 13,  testament: "Nouveau Testament", code: "HEB" },
	"Jacques":                { chapters: 5,   testament: "Nouveau Testament", code: "JAS" },
	"1 Pierre":               { chapters: 5,   testament: "Nouveau Testament", code: "1PE" },
	"2 Pierre":               { chapters: 3,   testament: "Nouveau Testament", code: "2PE" },
	"1 Jean":                 { chapters: 5,   testament: "Nouveau Testament", code: "1JN" },
	"2 Jean":                 { chapters: 1,   testament: "Nouveau Testament", code: "2JN" },
	"3 Jean":                 { chapters: 1,   testament: "Nouveau Testament", code: "3JN" },
	"Jude":                   { chapters: 1,   testament: "Nouveau Testament", code: "JUD" },
	"Apocalypse":             { chapters: 22,  testament: "Nouveau Testament", code: "REV" },
}

const params = new URLSearchParams(window.location.search)
const bookName = params.get("book")
const book = BOOKS[bookName]

if (!book) {
	document.getElementById("hub-book-title").textContent = "Livre introuvable"
} else {
	document.title = bookName + " — La Parole de Dieu"
	document.getElementById("hub-testament").textContent = book.testament
	document.getElementById("hub-book-title").textContent = bookName
	document.getElementById("hub-chapter-count").textContent =
		book.chapters === 1 ? "1 chapitre" : `${book.chapters} chapitres`

	const grid = document.getElementById("hub-chapters-grid")
	for (let i = 1; i <= book.chapters; i++) {
		const btn = document.createElement("a")
		btn.className = "hub__chapter-btn"
		btn.textContent = i
		btn.href = `chapitre.html?code=${book.code}&chapter=${i}&name=${encodeURIComponent(bookName)}`
		grid.appendChild(btn)
	}
}
