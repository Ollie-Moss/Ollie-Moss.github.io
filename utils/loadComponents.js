function loadComponent(elementId, filePath) {
    fetch(filePath)
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    `Failed to load ${filePath}: ${response.statusText}`
                )
            }
            return response.text()
        })
        .then((data) => {
            document.getElementById(elementId).innerHTML = data
        })
        .catch((error) => console.error('Error loading component:', error))
}

window.onload = () => {
    loadComponent('header', '../components/header/header.html')
    loadComponent('footer', '../components/footer/footer.html')
    loadComponent('main', '../components/home/home.html')
}
