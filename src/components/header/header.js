window.addEventListener('loaded-components', () => {
    let dropDownButton = document.getElementById('hamburger')
    let dropDown = document.getElementById('dropdown')

    let dropDownState = false

    dropDownButton.addEventListener('click', () => {
        dropDownState = !dropDownState
        dropDown.style.gridTemplateRows= dropDownState ? '1fr' : '0fr'
    })
})
