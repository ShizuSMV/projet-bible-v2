// ============================================================
// MODALE — Contact
// ============================================================

const contactOverlay = document.createElement("div")
contactOverlay.className = "modal-overlay"
contactOverlay.style.display = "none"
contactOverlay.style.opacity = "0"
document.body.appendChild(contactOverlay)

const contactSection  = document.getElementById("contact-section")
const contactCloseBtn = document.getElementById("contact-close-btn")
const contactLink     = document.getElementById("contact-link")

function showContactModal() {
	contactOverlay.style.display = "block"
	setTimeout(() => { contactOverlay.style.opacity = "1" }, 10)

	const isMobile = window.innerWidth <= 600
	contactSection.classList.add("modale")
	contactSection.style.opacity = "0"
	contactSection.style.transform = isMobile ? "translateX(-50%) translateY(-10px)" : "translate(-50%, -60%)"
	setTimeout(() => {
		contactSection.style.opacity = "1"
		contactSection.style.transform = isMobile ? "translateX(-50%)" : "translate(-50%, -50%)"
	}, 10)
}

function hideContactModal() {
	const isMobile = window.innerWidth <= 600
	contactOverlay.style.opacity = "0"
	contactSection.style.opacity = "0"
	contactSection.style.transform = isMobile ? "translateX(-50%) translateY(-10px)" : "translate(-50%, -60%)"
	setTimeout(() => {
		contactOverlay.style.display = "none"
		contactSection.classList.remove("modale")
		contactSection.style.opacity = ""
		contactSection.style.transform = ""
	}, 300)
}

contactLink?.addEventListener("click", e => { e.preventDefault(); showContactModal() })
contactCloseBtn?.addEventListener("click", hideContactModal)
contactOverlay.addEventListener("click", hideContactModal)

// ============================================================
// MODALE — À propos
// ============================================================

const aproposOverlay = document.createElement("div")
aproposOverlay.className = "modal-overlay"
aproposOverlay.style.cssText = "display:none;opacity:0;"
document.body.appendChild(aproposOverlay)

const aproposSection = document.createElement("section")
aproposSection.className = "contact-section"
aproposSection.style.display = "none"
aproposSection.innerHTML = `
	<button type="button" class="account-close" id="apropos-close-btn" aria-label="Fermer">✕</button>
	<div class="modale-welcome-icon" aria-hidden="true">
		<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
		</svg>
	</div>
	<div class="modale-header" style="text-align:center;align-items:center;">
		<p class="modale-eyebrow">À propos</p>
		<h2 class="modale-title">La Parole de Dieu</h2>
	</div>
	<div class="modale-divider"></div>
	<p style="font-family:'Cormorant Garamond',serif;font-size:1rem;color:rgba(255,255,255,.78);line-height:1.75;text-align:center;padding:0 8px;margin:0 0 18px;">
		Je suis un étudiant, né le 03/03/2003, et j'ai pour but de partager librement et facilement la Parole, tout en échangeant à son sujet.<br>Tout le monde est le bienvenu — sauf le mal.
	</p>
	<p style="font-family:'Cormorant Garamond',serif;font-size:1.05rem;color:#d4af37;font-style:italic;text-align:center;opacity:.85;margin:0;">
		« Aimez-vous les uns les autres, car Dieu nous a aimés. »
	</p>
`
document.body.appendChild(aproposSection)

function showAProposModal() {
	aproposOverlay.style.display = "block"
	setTimeout(() => { aproposOverlay.style.opacity = "1" }, 10)
	const isMobile = window.innerWidth <= 600
	aproposSection.classList.add("modale")
	aproposSection.style.opacity = "0"
	aproposSection.style.display = ""
	aproposSection.style.transform = isMobile ? "translateX(-50%) translateY(-10px)" : "translate(-50%, -60%)"
	setTimeout(() => {
		aproposSection.style.opacity = "1"
		aproposSection.style.transform = isMobile ? "translateX(-50%)" : "translate(-50%, -50%)"
	}, 10)
}

function hideAProposModal() {
	const isMobile = window.innerWidth <= 600
	aproposOverlay.style.opacity = "0"
	aproposSection.style.opacity = "0"
	aproposSection.style.transform = isMobile ? "translateX(-50%) translateY(-10px)" : "translate(-50%, -60%)"
	setTimeout(() => {
		aproposOverlay.style.display = "none"
		aproposSection.classList.remove("modale")
		aproposSection.style.opacity = ""
		aproposSection.style.transform = ""
	}, 300)
}

document.getElementById("apropos-close-btn")?.addEventListener("click", hideAProposModal)
aproposOverlay.addEventListener("click", hideAProposModal)
document.addEventListener("click", e => {
	if (e.target.closest("#apropos-link")) { e.preventDefault(); showAProposModal() }
})
