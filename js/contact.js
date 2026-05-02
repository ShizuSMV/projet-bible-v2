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
			<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
		</svg>
	</div>
	<div class="modale-header">
		<p class="modale-eyebrow">À propos</p>
		<h2 class="modale-title">La Parole de Dieu</h2>
		<p class="modale-subtitle">Un projet né d'une conviction</p>
	</div>
	<div class="modale-divider"></div>
	<div style="display:flex;flex-direction:column;gap:16px;text-align:center;padding:0 4px;">
		<p style="font-family:'Cormorant Garamond',serif;font-size:1.05rem;color:rgba(255,255,255,.82);line-height:1.9;">
			Né le 3 mars 2003, je suis un étudiant animé par un désir profond : rendre la Parole de Dieu accessible à chacun, sans frontière ni complexité.
		</p>
		<p style="font-family:'Cormorant Garamond',serif;font-size:1rem;color:rgba(255,255,255,.55);line-height:1.85;">
			Ce site est un espace de lecture, de partage et de rencontre — un lieu où l'on peut explorer les Écritures à son propre rythme, échanger avec d'autres croyants et grandir ensemble dans la foi.
		</p>
		<p style="font-family:'Cormorant Garamond',serif;font-size:0.88rem;color:rgba(255,255,255,.3);letter-spacing:0.08em;text-transform:uppercase;">
			Tout le monde est le bienvenu. Sauf le mal.
		</p>
	</div>
	<div style="height:1px;background:linear-gradient(90deg,transparent,rgba(212,175,55,.2),transparent);margin:20px 0 16px;"></div>
	<p style="font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:#d4af37;font-style:italic;text-align:center;line-height:1.6;opacity:.9;">
		« Aimez-vous les uns les autres,<br>comme je vous ai aimés. »<br>
		<span style="font-size:0.78rem;opacity:.6;font-style:normal;letter-spacing:0.1em;">— Jean 13:34</span>
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
