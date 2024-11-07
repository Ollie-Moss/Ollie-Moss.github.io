/**
 * Shows an error popup box
 * @param {string} message - The error message to be displayed
 * @returns {void}
 */
function errorPopup(message) {
    const popup = document.createElement('dialog')
    popup.classList.add('error-popup')
    popup.id = 'popup'
    const text = document.createElement('p')
    text.textContent = message
    const closeIcon = document.createElement('i')
    closeIcon.classList.add('fas')
    closeIcon.classList.add('fa-times')
    closeIcon.onclick = () => {
        document.body.removeChild(popup)
    }

    popup.appendChild(text)
    popup.appendChild(closeIcon)
    const oldPopup = document.getElementById('popup');
    if(oldPopup){
        document.body.replaceChild(popup, oldPopup)
        return
    }
    document.body.appendChild(popup)

    setInterval(() => popup.style.opacity = 0, 5000)

}
