// Local UI State
let currentProject = 0

/**
 * List of projects to render
 * Makes adding projects more simple for the developer
 * Type Project {
 *      id: number
 *      title: string,
 *      img: string,
 *      alt: string,
 *      description: string,
 *      tags: string[],
 * }
 *
 */
const projects = [
    {
        id: 0,
        title: 'Taskly',
        img: '/assets/images/taskly.png',
        alt: 'Taskly Preview Image',
        description:
            'Task management web application built for managing courses, assignments and tasks within NMIT as a student.',
        tags: ['NextJS', 'Typescript', 'Firebase', 'Tailwind'],
    },
    {
        id: 1,
        title: 'Python blah blah',
        img: '/assets/images/taskly.png',
        alt: 'Taskly Preview Image',
        description:
            'Task management web application built for managing courses, assignments and tasks within NMIT as a student.',
        tags: ['NextJS', 'Typescript', 'Firebase', 'Tailwind'],
    },
]

window.addEventListener('loaded-components', () => {
    // UI Elements
    const searchForm = document.getElementById('search-form')
    const clearSearchButton = document.getElementById('search-clear')

    const projectCloseButton = document.getElementById('project-close-button')
    const projectsGallery = document.getElementById('projects-gallery')
    const projectFocus = document.getElementById('project-focus')
    const projectTitle = document.getElementById('project-title')
    const projectDescription = document.getElementById('project-description')

    // Intialization
    renderProjects(projects)

    projectCloseButton.addEventListener('click', closeProjectFocus)
    searchForm.addEventListener('submit', searchProjects)
    clearSearchButton.addEventListener('click', clearSearch)
    /**
     * Setter for currentProject variable
     * Updates UI Accordingly
     * @param {Project} project - The project to be viewed
     * @returns {void}
     */
    function setCurrentProject(project) {
        currentProject = project
        updateProjectFocus(currentProject)
        refreshComments()
    }

    /**
     * Opens the project focus window
     * Sets current project to provided project
     * @param {Project} project - The project to be viewed
     * @returns {void}
     */
    function openProjectFocus(project) {
        projectFocus.style.display = 'flex'
        setCurrentProject(project)
    }

    /**
     * Updates with all relevant project information
     * @param {Project} project - The project to be viewed
     * @returns {void}
     */
    function updateProjectFocus(project) {
        projectTitle.textContent = project.title
        projectDescription.textContent = project.description
        window.scroll({ top: 0, behavior: 'smooth' })
    }

    /**
     * Closes the project focus window
     * @returns {void}
     */
    function closeProjectFocus() {
        projectFocus.style.display = 'none'
    }

    function clearSearch(e) {
        e.bubbles = false
        renderProjects(projects)
    }

    function searchProjects(e) {
        e.preventDefault()
        let [searchInput] = new FormData(e.target).values()

        // Filter based on search
        const options = {
            includeScore: true,
            keys: ['title'],
        }
        let fuse = new Fuse(projects, options)

        searchResults = fuse.search(searchInput)
        searchResults = searchResults.sort((a, b) => a.score - b.score)
        searchResults = searchResults.map((project) => project.item)

        renderProjects(searchResults)
    }

    /*
     * Creates and renders a list of projects to the DOM
     * @param {Project[]} projects - List of proejects to be rendered
     * @returns {void}
     */
    function renderProjects(projects) {
        projectsGallery.innerHTML = ''

        projects.forEach((project) => {
            const projectCard = document.createElement('div')
            projectCard.classList.add('project-card')
            const img = document.createElement('img')
            img.src = project.img
            img.alt = project.alt
            img.style.width = '100%'
            projectCard.appendChild(img)

            const details = document.createElement('div')
            details.classList.add('project-card-details')

            const header = document.createElement('div')
            header.classList.add('project-card-header')

            const title = document.createElement('h3')
            title.textContent = project.title
            const seeMoreBtn = document.createElement('button')
            seeMoreBtn.classList.add('button-normal')
            seeMoreBtn.textContent = 'See More'
            seeMoreBtn.onclick = () => openProjectFocus(project)

            header.appendChild(title)
            header.appendChild(seeMoreBtn)

            details.appendChild(header)

            const tags = document.createElement('ul')
            tags.classList.add('project-card-tags')
            project.tags.forEach((tag) => {
                const tagElem = document.createElement('li')
                tagElem.textContent = tag
                tags.appendChild(tagElem)
            })
            details.appendChild(tags)

            const description = document.createElement('p')
            description.textContent = project.description

            details.appendChild(description)

            projectCard.appendChild(details)
            projectsGallery.appendChild(projectCard)
        })
    }
})
