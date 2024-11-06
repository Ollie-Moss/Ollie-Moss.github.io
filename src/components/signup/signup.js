window.addEventListener('loaded-components', async () => {
    let password_match = false
    const signupForm = document.getElementById('signup-form')
    const passwordInput = document.getElementById('passwordInput')
    const re_passwordInput = document.getElementById('re-passwordInput')

    const loginWithGoogleButtons =
        document.getElementsByClassName('login-with-google')

    for (const btn of loginWithGoogleButtons) {
        btn.addEventListener('click', loginWithGoogle)
    }
    signupForm.addEventListener('submit', signup)

    re_passwordInput.addEventListener('input', (e) => {
        if (e.target.value != '' || passwordInput.value != '') {
            password_match = e.target.value == passwordInput.value
        }
    })

    function signup(e) {
        e.stopPropagation()
        e.preventDefault()

        // form data gathers all inputs that have a name attribute
        // and associates them as a key value pair {ElemName: Value}
        // all elements without a name attribute are omitted
        const data = new FormData(e.target)
        let [emailInput, passwordInput] = data.values()
        if (password_match) {
            console.log("here")
            signUpWithUserAndPass(emailInput, passwordInput)
        }
    }

    function loginWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider()

        auth.signInWithRedirect(provider)
        auth.getRedirectResult()
            .then((result) => {
                const user = result.user
                window.location.href = '/pages/index.html'
            })
            .catch((error) => {
                console.log(error.code)
                throw new Error(error.message)
            })
    }

    function signUpWithUserAndPass(email, password) {
        auth.createUserWithEmailAndPassword(email, password)
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
})
