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
            .then((result) => {
                const user = result.user
                if (user) {
                    window.location.href = '/pages/index.html'
                }
            })
            .catch((error) => {
                console.log(error.code)
                throw new Error(error.message)
            })
    }

    function loginWithGoogle(e) {
        e.preventDefault()
        const provider = new firebase.auth.GoogleAuthProvider()

        auth.signInWithPopup(provider)
            .then((result) => {
                const user = result.user
                window.location.href = '/pages/index.html'
            })
            .catch((error) => {
                console.log(error.code)
                //TODO: handle error according to code
                throw new Error(error.message)
            })
    }

    function loginWithUserAndPass(email, password) {
        auth.signInWithEmailAndPassword(email, password)
            .then((result) => {
                const user = result.user
                window.location.href = '/pages/index.html'
            })
            .catch((error) => {
                console.log(error.code)
                //TODO: handle error according to code
                throw new Error(error.message)
            })
    }
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