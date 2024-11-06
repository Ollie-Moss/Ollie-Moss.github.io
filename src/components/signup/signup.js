window.addEventListener('loaded-components', async () => {
    const signupForm = document.getElementById('signup-form')
    signupForm.addEventListener('submit', signup)

    function signup(e){
        e.stopPropagation()
        e.preventDefault()

        // form data gathers all inputs that have a name attribute
        // and associates them as a key value pair {ElemName: Value}
        // all elements without a name attribute are omitted
        const data = new FormData(e.target)
        const [emailInput, passwordInput] = data.values()
        signupWithUserAndPass(emailInput, passwordInput);
    }

    function signupWithUserAndPass(email, password){
        auth.createUserWithEmailAndPassword(email, password)
            .then(result => {
                const user = result.user
                console.log(user)
            })
            .catch(error => {
                console.log(error.code)
                //TODO: handle error according to code
                throw new Error(error.message)
            })
    }
})
