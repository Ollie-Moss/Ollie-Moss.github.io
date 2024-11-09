window.addEventListener('loaded-components', async () => {
    let password_match = false
    const signupForm = document.getElementById('signup-form')
    const passwordInput = document.getElementById('passwordInput')
    const re_passwordInput = document.getElementById('re-passwordInput')

    const loginWithGoogleButtons =
        document.getElementsByClassName('signup-with-google')

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
        let [display_name, emailInput, passwordInput] = data.values()
        if (password_match) {
            signUpWithUserAndPass(display_name, emailInput, passwordInput)
        } else {
            errorPopup('Passwords do not match!')
        }
    }

    function signUpWithUserAndPass(display_name, email, password) {
        auth.createUserWithEmailAndPassword(email, password)
            .then((result) => {
                const user = result.user
                result.user.updateProfile({
                    displayName: display_name,
                })
                window.location.href = '/pages/index.html'
            })
            .catch(handleAuthError)
    }
})
