window.addEventListener('loaded-components', () => {
    const contactForm = document.getElementById('contact')

    contactForm.addEventListener('submit', sendEmail)

    function sendEmail(e) {
        e.preventDefault()
        if (!auth.currentUser) {
            errorPopup('You must be logged in to send an email!')
            return
        }
        if (auth.currentUser && !auth.currentUser.emailVerified) {
            errorPopup('You must have a verified account to send an email!')
            return
        }
        const [name, email, message] = new FormData(e.target).values()

        fetch('https://sendemail-ckogvybb7a-uc.a.run.app', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Access-Control-Allow-Origin': 'origin',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                message: message,
            }),
        })
            .then(async (result) => {
                const text = await result.text()
                console.log(text)
            })
            .catch((error) => {
                console.log(
                    `There was an error sending the email: ${error.message}`
                )
            })
    }
})
