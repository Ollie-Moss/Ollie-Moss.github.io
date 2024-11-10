window.addEventListener('loaded-components', () => {
    const dropDownButton = document.getElementById('hamburger')
    const dropDown = document.getElementById('dropdown')
    const authNavs = document.getElementsByClassName('auth')

    const verifyEmailBanner = document.getElementById('verify-email')

    let dropDownState = false

    dropDownButton.addEventListener('click', () => {
        dropDownState = !dropDownState
        dropDown.style.gridTemplateRows = dropDownState ? '1fr' : '0fr'
    })
    window.addEventListener('resize', (e) => {
        if (e.target.innerWidth > 800) {
            dropDown.style.gridTemplateRows = '0fr'
        }
    })

    // Get the last auth state from localstorage
    // This optimistically sets the signin/signout button
    const lastAuthState = localStorage.getItem('lastAuthState') ?? false
    updateAuthNav(lastAuthState === 'true')

    const lastEmailState = localStorage.getItem('lastEmailState') ?? false
    if (lastEmailState === 'false') renderEmailVerificationBanner({ emailVerified: false })

    auth.onAuthStateChanged((user) => {
        localStorage.setItem('lastAuthState', user != null)
        updateAuthNav(user)
        renderEmailVerificationBanner(user)
    })

    function updateAuthNav(signedIn) {
        // render login, signup or signout buttons
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
    function renderEmailVerificationBanner(user) {
        localStorage.setItem('lastEmailState', user.emailVerified)

        verifyEmailBanner.innerHTML = ''
        verifyEmailBanner.classList.add('hidden')

        // render verify email prompt
        if (user && !user.emailVerified) {
            verifyEmailBanner.classList.remove('hidden')

            const text = document.createElement('p')
            text.textContent =
                'Account is not verified, check your inbox to verify your account. '

            const resendVerification = document.createElement('a')
            resendVerification.onclick = () => {
                user.sendEmailVerification().then(() => {
                    console.log('sent email')
                    // Poll for email verified
                    const getUserDetails = setInterval(() => {
                        if (!auth.currentUser) return
                        auth.currentUser.reload().then(() => {
                            renderEmailVerificationBanner(auth.currentUser)
                        })
                    }, 1000)
                    setTimeout(() => {
                        console.log('Clearing interval')
                        clearInterval(getUserDetails)
                    }, 15000)
                })
            }
            resendVerification.textContent = 'Resend verification email'
            text.appendChild(resendVerification)

            verifyEmailBanner.appendChild(text)
        }
    }
})
