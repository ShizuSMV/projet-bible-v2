// Génère api/search-index.json à partir de tous les chapitres
// Usage : node generate-index.js

const fs   = require("fs")
const path = require("path")

const BASE = path.join(__dirname, "api", "fra_lsg")
const OUT  = path.join(__dirname, "api", "search-index.json")

const BOOKS = {
	"Genèse":"GEN","Exode":"EXO","Lévitique":"LEV","Nombres":"NUM",
	"Deutéronome":"DEU","Josué":"JOS","Juges":"JDG","Ruth":"RUT",
	"1 Samuel":"1SA","2 Samuel":"2SA","1 Rois":"1KI","2 Rois":"2KI",
	"1 Chroniques":"1CH","2 Chroniques":"2CH","Esdras":"EZR","Néhémie":"NEH",
	"Esther":"EST","Job":"JOB","Psaumes":"PSA","Proverbes":"PRO",
	"Ecclésiaste":"ECC","Cantique des Cantiques":"SNG","Ésaïe":"ISA",
	"Jérémie":"JER","Lamentations":"LAM","Ézéchiel":"EZK","Daniel":"DAN",
	"Osée":"HOS","Joël":"JOL","Amos":"AMO","Abdias":"OBA","Jonas":"JON",
	"Michée":"MIC","Naoum":"NAM","Habacuc":"HAB","Sophonie":"ZEP",
	"Aggée":"HAG","Zacharie":"ZEC","Malachie":"MAL","Matthieu":"MAT",
	"Marc":"MRK","Luc":"LUK","Jean":"JHN","Actes des Apôtres":"ACT",
	"Romains":"ROM","1 Corinthiens":"1CO","2 Corinthiens":"2CO",
	"Galates":"GAL","Éphésiens":"EPH","Philippiens":"PHP","Colossiens":"COL",
	"1 Thessaloniciens":"1TH","2 Thessaloniciens":"2TH","1 Timothée":"1TI",
	"2 Timothée":"2TI","Tite":"TIT","Philémon":"PHM","Hébreux":"HEB",
	"Jacques":"JAS","1 Pierre":"1PE","2 Pierre":"2PE","1 Jean":"1JN",
	"2 Jean":"2JN","3 Jean":"3JN","Jude":"JUD","Apocalypse":"REV",
}

const CODE_TO_NAME = Object.fromEntries(Object.entries(BOOKS).map(([n, c]) => [c, n]))

const index = []

for (const code of Object.values(BOOKS)) {
	const dir = path.join(BASE, code)
	if (!fs.existsSync(dir)) continue

	const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"))
	for (const file of files) {
		const chap = parseInt(file)
		let data
		try {
			data = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"))
		} catch {
			continue
		}

		const content = data.chapter?.content || []
		for (const item of content) {
			if (item.type !== "verse") continue
			const text = item.content.join(" ")
			index.push({
				b: CODE_TO_NAME[code] || code,
				c: code,
				ch: chap,
				v: item.number,
				t: text,
			})
		}
	}
}

fs.writeFileSync(OUT, JSON.stringify(index))
console.log(`✓ ${index.length} versets indexés → api/search-index.json`)
