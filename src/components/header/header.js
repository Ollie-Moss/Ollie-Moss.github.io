window.addEventListener('loaded-components', () => {
    const dropDownButton = document.getElementById('hamburger')
    const dropDown = document.getElementById('dropdown')
    const authNavs = document.getElementsByClassName('auth')

    let dropDownState = false

    dropDownButton.addEventListener('click', () => {
        dropDownState = !dropDownState
        dropDown.style.gridTemplateRows = dropDownState ? '1fr' : '0fr'
    })

    // Get the last auth state from localstorage
    // This optimistically sets the signin/signout button
    const lastAuthState = localStorage.getItem('lastAuthState')?? false
    updateAuthNav(lastAuthState === 'true')

    auth.onAuthStateChanged((user) => {
        localStorage.setItem('lastAuthState', (user != null))
        updateAuthNav(user)
    })

    function updateAuthNav(signedIn) {
        for (const authNav of authNavs) {
            authNav.innerHTML = ''
            if (signedIn) {
                const signOutBtn = document.createElement('button')
                signOutBtn.classList.add('signOut')
                signOutBtn.textContent = 'Sign Out'
                signOutBtn.onclick = () => {
                    auth.signOut()
                }

                authNav.appendChild(signOutBtn)
            } else {
                const loginAnchor = document.createElement('a')
                const signUpAnchor = document.createElement('a')

                loginAnchor.textContent = 'Login'
                signUpAnchor.textContent = 'Sign Up'
                loginAnchor.href = '/pages/login.html'
                signUpAnchor.href = '/pages/signup.html'

                authNav.appendChild(loginAnchor)
                authNav.appendChild(signUpAnchor)
            }
        }
    }
})
