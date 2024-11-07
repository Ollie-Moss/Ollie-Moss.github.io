window.addEventListener('loaded-components', () => {
    const contactForm = document.getElementById('contact')

    contactForm.addEventListener('submit', sendEmail)

    function sendEmail(e) {
        e.preventDefault()
        const [name, email, message] = new FormData(e.target).values()
        console.log(name, email, message)

        transporter
            .sendMail({
                from: `"${name}" <${email}>`,
                to: 'olliemoss321@gmail.com',
                text: message,
            })
            .then((info) => {
                console.log(info)
            })
    }
})
