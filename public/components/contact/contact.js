window.addEventListener('loaded-components', () => {
    const contactForm = document.getElementById('contact')

    contactForm.addEventListener('submit', sendEmail)

    function sendEmail(e) {
        e.preventDefault()
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
        }).then(async (result) => {
            const text = await result.text()
            console.log(text)
        })
    }
})
