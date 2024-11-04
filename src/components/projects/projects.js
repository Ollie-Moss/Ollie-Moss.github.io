window.addEventListener('loaded-components', () => {
    const projectsGallery = document.getElementById('projects-gallery')
    const projectFocus = document.getElementById('project-focus')
    const projectTitle = document.getElementById('project-title')
    const projectDescription = document.getElementById('project-description')
    const postButton = document.getElementById('post-button')
    const commentArea = document.getElementById('comment-area')
    const commentList = document.getElementById('comment-list')
    let savedCommentArea;

    const commentForm = document.getElementById('comment-form')
    const projectCloseButton = document.getElementById('project-close-button')

    const projects = [
        {
            title: 'Taskly',
            img: '/assets/images/taskly.png',
            alt: 'Taskly Preview Image',
            description:
                'Task management web application built for managing courses, assignments and tasks within NMIT as a student.',
            tags: ['NextJS', 'Typescript', 'Firebase', 'Tailwind'],
        },
        {
            title: 'Python blah blah',
            img: '/assets/images/taskly.png',
            alt: 'Taskly Preview Image',
            description:
                'Task management web application built for managing courses, assignments and tasks within NMIT as a student.',
            tags: ['NextJS', 'Typescript', 'Firebase', 'Tailwind'],
        },
    ]
    RenderProjects(projects)

    projectCloseButton.addEventListener('click', closeProjectFocus)
    commentForm.addEventListener('submit', postComment)

    function postComment(e) {
        e.preventDefault()
        if(auth.currentUser){
            console.log(e)
        }
        console.log("posted comment")
    }

    function openProjectFocus(project) {
        projectFocus.style.display = "flex"
        projectTitle.textContent = project.title
        projectDescription.textContent = project.description
        
        postButton.disabled = true;
        auth.signOut();
        console.log(auth.currentUser);
        if(!auth.currentUser){
            savedCommentArea = commentArea.firstChild
            commentArea.style.background = "white"
            commentArea.style.opacity = "0.5"
            commentArea.style.filter = 'blur(5px)'
            commentArea.style.zIndex = 100
            const text = document.createElement('h2')
            text.textContent = "Must be logged in!"
            text.style.position = 'absolute'
            text.style.top = '10px'
            commentArea.parentNode.appendChild(text)
        }
    }
    function closeProjectFocus(){
        projectFocus.style.display = "none"
    }

    function RenderProjects(projects) {
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
