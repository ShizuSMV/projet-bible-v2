function initAccordion(details) {
	const summary = details.querySelector("summary")
	const content = details.querySelector(":scope > *:not(summary)")

	// Wrapper pour animer la hauteur
	let wrapper = details.querySelector(".accordion__inner")
	if (!wrapper) {
		wrapper = document.createElement("div")
		wrapper.className = "accordion__inner"
		// Déplace tout le contenu (hors summary) dans le wrapper
		while (details.lastChild && details.lastChild !== summary) {
			wrapper.prepend(details.lastChild)
		}
		details.appendChild(wrapper)
	}

	let animation = null
	let isClosing = false
	let isOpening = false

	summary.addEventListener("click", (e) => {
		e.preventDefault()
		if (isClosing || !details.open) {
			openAccordion()
		} else {
			closeAccordion()
		}
	})

	function openAccordion() {
		details.open = true
		isOpening = true

		if (animation) animation.cancel()

		animation = wrapper.animate(
			[{ height: "0px", opacity: 0 }, { height: wrapper.scrollHeight + "px", opacity: 1 }],
			{ duration: 320, easing: "cubic-bezier(0.4, 0, 0.2, 1)" }
		)

		animation.onfinish = () => {
			wrapper.style.height = ""
			isOpening = false
			animation = null
		}
	}

	function closeAccordion() {
		isClosing = true

		if (animation) animation.cancel()

		animation = wrapper.animate(
			[{ height: wrapper.scrollHeight + "px", opacity: 1 }, { height: "0px", opacity: 0 }],
			{ duration: 280, easing: "cubic-bezier(0.4, 0, 0.2, 1)" }
		)

		animation.onfinish = () => {
			details.open = false
			isClosing = false
			animation = null
		}
	}

	// Expose pour usage externe (footer, etc.)
	details._openSmooth = openAccordion
}

// Init tous les accordéons
document.querySelectorAll(".main__books-accordion").forEach(initAccordion)

// Gestion du hash (footer → ouvre le bon accordéon avec animation)
function handleAccordionHash() {
	const hash = window.location.hash
	if (hash === "#ancien-testament" || hash === "#nouveau-testament") {
		const el = document.querySelector(hash)
		if (el && el._openSmooth) {
			if (!el.open) el._openSmooth()
			setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50)
		}
	}
}

window.addEventListener("DOMContentLoaded", () => setTimeout(handleAccordionHash, 100))
window.addEventListener("hashchange", handleAccordionHash)
