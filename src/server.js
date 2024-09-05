const express = require('express')
const app = express()
const port = 3000

app.use('/', express.static(__dirname))

app.get('/', (req, res) => {
    res.sendFile('/home/ollie/workspace/web504/portfolio/src/pages/index.html')
})

app.listen(port, () => {
    console.log(`Portfolio listening on port ${port}`)
})
