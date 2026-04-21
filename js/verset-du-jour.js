const DAILY_VERSES = [
	{ c: "GEN", b: "Genèse",              ch: 1,  v: 1  },
	{ c: "GEN", b: "Genèse",              ch: 1,  v: 27 },
	{ c: "GEN", b: "Genèse",              ch: 28, v: 15 },
	{ c: "EXO", b: "Exode",               ch: 14, v: 14 },
	{ c: "DEU", b: "Deutéronome",          ch: 31, v: 6  },
	{ c: "JOS", b: "Josué",               ch: 1,  v: 9  },
	{ c: "PSA", b: "Psaumes",             ch: 1,  v: 1  },
	{ c: "PSA", b: "Psaumes",             ch: 23, v: 1  },
	{ c: "PSA", b: "Psaumes",             ch: 27, v: 1  },
	{ c: "PSA", b: "Psaumes",             ch: 34, v: 8  },
	{ c: "PSA", b: "Psaumes",             ch: 37, v: 4  },
	{ c: "PSA", b: "Psaumes",             ch: 46, v: 1  },
	{ c: "PSA", b: "Psaumes",             ch: 91, v: 1  },
	{ c: "PSA", b: "Psaumes",             ch: 103, v: 1 },
	{ c: "PSA", b: "Psaumes",             ch: 119, v: 105 },
	{ c: "PSA", b: "Psaumes",             ch: 121, v: 2 },
	{ c: "PRO", b: "Proverbes",           ch: 3,  v: 5  },
	{ c: "PRO", b: "Proverbes",           ch: 3,  v: 6  },
	{ c: "PRO", b: "Proverbes",           ch: 16, v: 3  },
	{ c: "PRO", b: "Proverbes",           ch: 22, v: 6  },
	{ c: "ISA", b: "Ésaïe",              ch: 40, v: 31 },
	{ c: "ISA", b: "Ésaïe",              ch: 41, v: 10 },
	{ c: "ISA", b: "Ésaïe",              ch: 53, v: 5  },
	{ c: "ISA", b: "Ésaïe",              ch: 55, v: 8  },
	{ c: "JER", b: "Jérémie",            ch: 29, v: 11 },
	{ c: "JER", b: "Jérémie",            ch: 31, v: 3  },
	{ c: "LAM", b: "Lamentations",        ch: 3,  v: 23 },
	{ c: "MAT", b: "Matthieu",            ch: 5,  v: 6  },
	{ c: "MAT", b: "Matthieu",            ch: 6,  v: 33 },
	{ c: "MAT", b: "Matthieu",            ch: 11, v: 28 },
	{ c: "MAT", b: "Matthieu",            ch: 22, v: 37 },
	{ c: "MAT", b: "Matthieu",            ch: 28, v: 19 },
	{ c: "MRK", b: "Marc",               ch: 10, v: 27 },
	{ c: "MRK", b: "Marc",               ch: 11, v: 24 },
	{ c: "LUK", b: "Luc",                ch: 1,  v: 37 },
	{ c: "LUK", b: "Luc",                ch: 6,  v: 38 },
	{ c: "LUK", b: "Luc",                ch: 12, v: 34 },
	{ c: "JHN", b: "Jean",               ch: 1,  v: 1  },
	{ c: "JHN", b: "Jean",               ch: 3,  v: 16 },
	{ c: "JHN", b: "Jean",               ch: 8,  v: 32 },
	{ c: "JHN", b: "Jean",               ch: 10, v: 10 },
	{ c: "JHN", b: "Jean",               ch: 11, v: 25 },
	{ c: "JHN", b: "Jean",               ch: 14, v: 6  },
	{ c: "JHN", b: "Jean",               ch: 14, v: 27 },
	{ c: "JHN", b: "Jean",               ch: 15, v: 5  },
	{ c: "JHN", b: "Jean",               ch: 16, v: 33 },
	{ c: "ACT", b: "Actes des Apôtres",  ch: 1,  v: 8  },
	{ c: "ROM", b: "Romains",             ch: 3,  v: 23 },
	{ c: "ROM", b: "Romains",             ch: 5,  v: 8  },
	{ c: "ROM", b: "Romains",             ch: 6,  v: 23 },
	{ c: "ROM", b: "Romains",             ch: 8,  v: 1  },
	{ c: "ROM", b: "Romains",             ch: 8,  v: 28 },
	{ c: "ROM", b: "Romains",             ch: 8,  v: 38 },
	{ c: "ROM", b: "Romains",             ch: 10, v: 9  },
	{ c: "ROM", b: "Romains",             ch: 12, v: 2  },
	{ c: "1CO", b: "1 Corinthiens",       ch: 10, v: 13 },
	{ c: "1CO", b: "1 Corinthiens",       ch: 13, v: 4  },
	{ c: "1CO", b: "1 Corinthiens",       ch: 13, v: 13 },
	{ c: "2CO", b: "2 Corinthiens",       ch: 5,  v: 17 },
	{ c: "2CO", b: "2 Corinthiens",       ch: 12, v: 9  },
	{ c: "GAL", b: "Galates",             ch: 5,  v: 22 },
	{ c: "EPH", b: "Éphésiens",          ch: 2,  v: 8  },
	{ c: "EPH", b: "Éphésiens",          ch: 4,  v: 32 },
	{ c: "EPH", b: "Éphésiens",          ch: 6,  v: 10 },
	{ c: "PHP", b: "Philippiens",         ch: 4,  v: 4  },
	{ c: "PHP", b: "Philippiens",         ch: 4,  v: 6  },
	{ c: "PHP", b: "Philippiens",         ch: 4,  v: 7  },
	{ c: "PHP", b: "Philippiens",         ch: 4,  v: 13 },
	{ c: "COL", b: "Colossiens",          ch: 3,  v: 23 },
	{ c: "2TI", b: "2 Timothée",         ch: 3,  v: 16 },
	{ c: "HEB", b: "Hébreux",            ch: 11, v: 1  },
	{ c: "HEB", b: "Hébreux",            ch: 12, v: 1  },
	{ c: "JAS", b: "Jacques",             ch: 1,  v: 17 },
	{ c: "1PE", b: "1 Pierre",            ch: 5,  v: 7  },
	{ c: "1JN", b: "1 Jean",             ch: 1,  v: 9  },
	{ c: "1JN", b: "1 Jean",             ch: 4,  v: 8  },
	{ c: "1JN", b: "1 Jean",             ch: 4,  v: 19 },
	{ c: "REV", b: "Apocalypse",          ch: 21, v: 4  },
	{ c: "REV", b: "Apocalypse",          ch: 22, v: 13 },
]

function getDailyIndex() {
	const now = new Date()
	const daysSinceEpoch = Math.floor(now.getTime() / 86400000)
	return daysSinceEpoch % DAILY_VERSES.length
}

async function loadVersetDuJour() {
	const ref = DAILY_VERSES[getDailyIndex()]
	const refEl    = document.querySelector(".main__verset-ref")
	const textEl   = document.querySelector(".main__verset-text")
	const section  = document.querySelector(".main__section-verset")
	if (!refEl || !textEl || !section) return

	refEl.textContent = `${ref.b} ${ref.ch}:${ref.v}`

	const url = `pages/chapitre.html?code=${ref.c}&chapter=${ref.ch}&name=${encodeURIComponent(ref.b)}&verse=${ref.v}`
	section.addEventListener("click", () => { window.location.href = url })

	try {
		const res  = await fetch(`api/fra_lsg/${ref.c}/${ref.ch}.json`)
		const data = await res.json()
		const item = data.chapter.content.find(i => i.type === "verse" && i.number === ref.v)
		if (!item) return

		const parts = []
		for (const c of item.content) {
			if (typeof c === "string") parts.push(c)
			else if (c.text) parts.push(c.text)
		}
		textEl.textContent = `« ${parts.join(" ")} »`
	} catch {
		// garde le texte statique en cas d'erreur
	}
}

loadVersetDuJour()
