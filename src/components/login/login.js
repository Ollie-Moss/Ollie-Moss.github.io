window.addEventListener('loaded-components', async () => {
    const loginForm = document.getElementById('login-form')
    loginForm.addEventListener('submit', login)

    function login(e){
        e.stopPropagation()
        e.preventDefault()

        // form data gathers all inputs that have a name attribute
        // and associates them as a key value pair {ElemName: Value}
        // all elements without a name attribute are omitted
        const data = new FormData(e.target)
        const [emailInput, passwordInput] = data.values()
        loginWithUserAndPass(emailInput, passwordInput);
    }

    function loginWithUserAndPass(email, password){
        auth.signInWithEmailAndPassword(email, password)
            .then(result => {
                const user = result.user
            })
            .catch(error => {
                console.log(error.code)
                //TODO: handle error according to code
                throw new Error(error.message)
            })
    }
})
