const componentsLoaded = new Event("loaded-components")

function loadComponent(elementId, filePath) {
    return fetch(filePath)
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
