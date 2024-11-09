/**
 * Shows an error popup box
 * @param {string} message - The error message to be displayed
 * @returns {void}
 */
function errorPopup(message) {
    const popup = document.createElement('dialog')
    popup.classList.add('popup')
    popup.classList.add('error-popup')
    popup.id = 'popup'
    const text = document.createElement('p')
    text.textContent = message
    text.style = 'white-space: pre-line;'
    const closeIcon = document.createElement('i')
    closeIcon.classList.add('fas')
    closeIcon.classList.add('fa-times')
    closeIcon.onclick = () => {
        document.body.removeChild(popup)
    }

    popup.appendChild(text)
    popup.appendChild(closeIcon)
    const oldPopup = document.getElementById('popup')
    if (oldPopup) {
        document.body.replaceChild(popup, oldPopup)
        return
    }
    document.body.appendChild(popup)

    setInterval(() => (popup.style.opacity = 0), 5000)
}

function confirmPopup(message) {
    return new Promise((resolve) => {
        const popup = document.createElement('dialog')

        const blocker = document.createElement('div')
        blocker.classList.add('blocker')
        blocker.onclick = (e) => {
            e.preventDefault()
            e.stopPropagation()
            popup.classList.add('focus-shake')
            popup.onanimationend = () => popup.classList.remove('focus-shake')
        }
        document.body.insertBefore(blocker, document.body.firstChild)

        popup.classList.add('popup')
        popup.classList.add('confirm-popup')
        popup.id = 'popup'
        const text = document.createElement('p')
        text.textContent = message
        text.style = 'white-space: pre-line;'

        const actions = document.createElement('div')
        actions.classList.add('actions')

        const noButton = document.createElement('button')
        noButton.classList.add('no-button')
        noButton.textContent = 'No'
        noButton.onclick = () => {
            resolve(false)
            document.body.removeChild(popup)
            document.body.removeChild(blocker)
        }
        const yesButton = document.createElement('button')
        yesButton.classList.add('yes-button')
        yesButton.textContent = 'Yes'
        yesButton.onclick = () => {
            resolve(true)
            document.body.removeChild(popup)
            document.body.removeChild(blocker)
        }

        actions.appendChild(yesButton)
        actions.appendChild(noButton)

        popup.appendChild(text)
        popup.appendChild(actions)

        const oldPopup = document.getElementById('popup')
        if (oldPopup) {
            document.body.replaceChild(popup, oldPopup)
            return
        }
        document.body.appendChild(popup)
        window.scroll({ top: 0, behavior: 'smooth' })
    })
}

function loginWithGoogle(e) {
    e.preventDefault()
    const provider = new firebase.auth.GoogleAuthProvider()

    auth.signInWithPopup(provider)
        .then((result) => {
            window.location.href = '/pages/index.html'
        })
        .catch(handleAuthError)
}

function handleAuthError(error) {
    console.log(error.code)
    switch (error.code) {
        case 'auth/invalid-login-credentials':
            errorPopup('Incorrect email or password, please try again!')
            break
        case 'auth/email-already-in-use':
            errorPopup('That email is already in use!')
            break
        case 'auth/invalid-password':
            errorPopup('Password is too weak, must be at least 6 characters!')
            break
        case 'auth/invalid-email':
            errorPopup('Please provide a valid email!')
            break
        default:
            errorPopup('There was an error logging in, try again later!')
    }
}
