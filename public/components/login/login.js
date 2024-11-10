window.addEventListener('loaded-components', async () => {
    const loginForm = document.getElementById('login-form')
    const loginWithGoogleButtons =
        document.getElementsByClassName('login-with-google')
    for (const btn of loginWithGoogleButtons) {
        btn.addEventListener('click', loginWithGoogle)
    }
    loginForm.addEventListener('submit', login)

    function login(e) {
        e.stopPropagation()
        e.preventDefault()

        // form data gathers all inputs that have a name attribute
        // and associates them as a key value pair {ElemName: Value}
        // all elements without a name attribute are omitted
        const data = new FormData(e.target)
        let [emailInput, passwordInput, rememberMeInput] = data.values()
        rememberMeInput = rememberMeInput === 'on'

        setAuthPersistence(rememberMeInput)
        loginWithUserAndPass(emailInput, passwordInput)
    }

    /**
     * Logins user in with an email and password
     * Redirects to home pages upon success
     * @param {string} email - The email of the account
     * @param {string} password - The password of the account
     * @returns {void}
     */
    function loginWithUserAndPass(email, password) {
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                window.location.href = '/pages/index.html'
            })
            .catch(handleAuthError)
    }

    /**
     * Sets the authentication persistence to either local or session
     * @param {boolean} local - Whether the persistence should be set to local or session
     * @returns {void}
     */
    function setAuthPersistence(local) {
        const state = local
            ? firebase.auth.Auth.Persistence.LOCAL
            : firebase.auth.Auth.Persistence.SESSION
        auth.setPersistence(state)
            .then(() => {
                console.log(
                    'Firebase Auth persistence set to ' +
                        (local ? 'LOCAL' : 'SESSION')
                )
            })
            .catch((error) => {
                console.error('Error setting persistence:', error)
            })
    }
})
