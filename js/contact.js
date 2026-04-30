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
