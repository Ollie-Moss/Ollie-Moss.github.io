window.addEventListener('loaded-components', () => {
    // UI Elements
    const projectsGallery = document.getElementById('projects-gallery')
    const projectFocus = document.getElementById('project-focus')
    const projectTitle = document.getElementById('project-title')
    const projectDescription = document.getElementById('project-description')
    const postButton = document.getElementById('post-button')
    const commentArea = document.getElementById('comment-area')
    const commentList = document.getElementById('comment-list')

    const commentForm = document.getElementById('comment-form')
    const projectCloseButton = document.getElementById('project-close-button')
    let savedCommentArea

    /**
     * List of projects to render
     * Makes adding projects more simple for the developer
     * Type Project {
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

    // Listeners
    projectCloseButton.addEventListener('click', closeProjectFocus)
    commentForm.addEventListener('submit', postComment)
    auth.onAuthStateChanged((user) => {
        db.ref(`/comments`).on('value', loadComments)
    })

    // Intialization
    renderProjects(projects)

    /**
     * Creates all required HTML Elements for a given list of comments
     * @param {comment[]} comments
     * @returns {void}
     */
    function renderComments(comments) {}

    /**
     * Creates local comment element and updates firebase database with given comment
     * @param {SubmitEvent} e - form submission event
     * @returns {void}
     */
    function postComment(e) {
        e.preventDefault()
        const [commentText] = new FormData(e.target).values()

        if (auth.currentUser) {
            auth.currentUser.displayName = 'Ollie'
            createComment({
                userId: auth.currentUser.uid,
                user: auth.currentUser.displayName,
                text: commentText,
                timeSent: new Date().toISOString(),
                replies: [],
            })
        }
    }

    /**
     * Renders comments from firebase database related to a given project
     * @param {DataSnapshot}  - snapshot of the database
     * @returns {void}
     */
    function loadComments(snapshot) {
        snapshot.forEach((childSnapshot) => {
            const comment = childSnapshot.val()
            addCommentToDOM(comment)
        })
    }

    /**
     * Renders a given comment to the DOM
     * @param {Comment} comment - Comment to be rendered
     * @returns {void}
     */
    function addCommentToDOM(comment) {
        // --- Comment Div ---
        const commentDiv = document.createElement('div')
        commentDiv.classList.add('comment')

        // --- Header ---
        const header = document.createElement('header')
        const usernameLabel = document.createElement('h4')
        const timestamp = document.createElement('p')
        usernameLabel.textContent = comment.user
        timestamp.textContent = new Date(comment.timeSent).toLocaleTimeString(
            [],
            { hour: '2-digit', minute: '2-digit' }
        )
        header.appendChild(usernameLabel)
        header.appendChild(timestamp)

        // --- Comment Text ---
        const commentText = document.createElement('p')
        commentText.textContent = comment.text

        // --- Comment Controls ---
        const commentControls = document.createElement('section')
        commentControls.classList.add('comment-controls')

        // --- Comment Controls Section Left ---
        const controlSectionLeft = document.createElement('section')

        // --- Heart Icon ---
        const heartIcon = document.createElement('i')
        heartIcon.classList.add('fa-solid')
        heartIcon.classList.add('fa-heart')

        // --- Thumbs Down Icon ---
        const thumbsDownIcon = document.createElement('i')
        thumbsDownIcon.classList.add('fa-solid')
        thumbsDownIcon.classList.add('fa-thumbs-down')

        // --- Reply Button ---
        const replyButton = document.createElement('button')
        replyButton.classList.add('button-normal')
        replyButton.textContent = 'Reply'

        controlSectionLeft.appendChild(heartIcon)
        controlSectionLeft.appendChild(thumbsDownIcon)
        controlSectionLeft.appendChild(replyButton)

        // --- Comment Controls Section Right ---
        let controlSectionRight = false
        if (comment.userId == auth.currentUser.uid) {
            controlSectionRight = document.createElement('section')

            // --- Edit Button ---
            const editButton = document.createElement('button')
            editButton.classList.add('button-normal')
            editButton.textContent = 'Edit'

            // --- Delete Button ---
            const deleteButton = document.createElement('button')
            deleteButton.classList.add('button-red')
            deleteButton.textContent = 'Delete'

            controlSectionRight.appendChild(editButton)
            controlSectionRight.appendChild(deleteButton)
        }

        commentControls.appendChild(controlSectionLeft)
        if (controlSectionRight) {
            commentControls.appendChild(controlSectionRight)
        }

        commentDiv.appendChild(header)
        commentDiv.appendChild(commentText)
        commentDiv.appendChild(commentControls)

        commentList.appendChild(commentDiv)

        // <div class="comment">
        //     <header>
        //         <h4>Username</h4>
        //         <p>7:45 am</p>
        //     </header>
        //     <p>The comment the user has typed</p>
        //     <section class="comment-controls">
        //          <section>
        //              <i class="fa-solid fa-heart"></i>
        //              <i class="fa-solid fa-thumbs-down"></i>
        //              <button class="button-normal">Reply</button>
        //          </section>
        //          <section>
        //              <button class="button-normal">Edit</button>
        //              <button class="button-red">Delete</button>
        //          </section>
        //     </section>
        // </div>
    }
    /*
     * Creates a comment record in the firebase database
     * @param {Comment} comment - The comment to be created
     * @returns {void}
     */
    function createComment(comment) {
        const commentKey = db.ref().push({}).key
        const updates = {}
        updates[`/comments/${commentKey}/`] = comment
        db.ref().update(updates)
    }

    /*
     * Deletes a given comment in the firebase database
     * @param {string} id - The id of the comment to be deleted
     * @returns {void}
     */
    function deleteComment(id) {
        const commentRef = db.ref(`${auth.currentUser.id}/comments`)
        commentRef.remove(id)
    }

    /*
     * Updates a given comment in the firebase database
     * @param {Comment} comment - The comment to be update
     * @returns {void}
     */
    function updateComment(comment) {}

    /**
     * Opens the project focus window
     * Updates with all relevant project information
     * @param {Project} project - The project to be viewed
     * @returns {void}
     */
    function openProjectFocus(project) {
        projectFocus.style.display = 'flex'
        projectTitle.textContent = project.title
        projectDescription.textContent = project.description

        if (!auth.currentUser) {
            savedCommentArea = commentArea.firstChild
            commentArea.style.background = 'white'
            commentArea.style.opacity = '0.5'
            commentArea.style.filter = 'blur(5px)'
            commentArea.style.zIndex = 100
            const text = document.createElement('h2')
            text.textContent = 'Must be logged in!'
            text.style.position = 'absolute'
            text.style.top = '10px'
            commentArea.appendChild(text)
        }
    }

    /**
     * Closes the project foucs window
     * @returns {void}
     */
    function closeProjectFocus() {
        projectFocus.style.display = 'none'
    }

    /*
     * Creates and renders a list of projects to the DOM
     * @param {Project[]} projects - List of proejects to be rendered
     * @returns {void}
     */
    function renderProjects(projects) {
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
