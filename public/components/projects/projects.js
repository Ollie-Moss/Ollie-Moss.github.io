window.addEventListener('loaded-components', () => {
    // UI Elements
    const searchForm = document.getElementById('search-form')
    const clearSearchButton = document.getElementById('search-clear')

    const projectsGallery = document.getElementById('projects-gallery')
    const projectFocus = document.getElementById('project-focus')
    const projectTitle = document.getElementById('project-title')
    const projectDescription = document.getElementById('project-description')
    const projectCloseButton = document.getElementById('project-close-button')

    const commentForm = document.getElementById('comment-form')
    const commentInput = document.getElementById('comment-input')
    const commentList = document.getElementById('comment-list')
    const commentCounter = document.getElementById('comment-counter')

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

    let currentProject = 0

    // Listeners
    projectCloseButton.addEventListener('click', closeProjectFocus)

    commentForm.addEventListener('submit', postComment)

    searchForm.addEventListener('submit', searchProjects)
    clearSearchButton.addEventListener('click', clearSearch)

    // Firebase Listeners
    db.ref(`/comments/`).off('value')
    db.ref(`/comments/`).on('value', (snapshot) => loadComments(snapshot))

    // Intialization
    renderProjects(projects)

    /**
     * Creates local comment element and updates firebase database with given comment
     * @param {SubmitEvent} e - form submission event
     * @returns {void}
     */
    function postComment(e, parentComment = null) {
        e.preventDefault()
        e.bubbles = false
        if (!auth.currentUser) {
            errorPopup('You must be logged in to comment!')
            return
        }
        const [commentText] = new FormData(e.target).values()
        commentInput.value = ''

        if (auth.currentUser) {
            createComment(
                {
                    userId: auth.currentUser.uid,
                    projectId: currentProject.id,
                    user: auth.currentUser.displayName,
                    text: commentText,
                    likedBy: [],
                    timeSent: new Date().toISOString(),
                    replies: [],
                },
                parentComment
            )
        }
    }

    /**
     * Renders comments from firebase database related to a given project
     * @param {DataSnapshot}  - snapshot of the database
     * @returns {void}
     */
    async function loadComments(snapshot) {
        commentList.innerHTML = ''
        let counter = 0
        snapshot.forEach((childSnapshot) => {
            const comment = childSnapshot.val()
            if (comment.projectId === currentProject.id) {
                if (!comment.hasOwnProperty('likedBy')) {
                    comment.likedBy = []
                }
                if (!comment.hasOwnProperty('replies')) {
                    comment.replies = []
                }
                addCommentToDOM(comment)
                counter += 1
            }
        })
        commentCounter.textContent = `${counter} Comment${counter == 1 ? '' : 's'}`
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
        const likesCounter = document.createElement('p')
        likesCounter.textContent = comment.likedBy.length
        const heartIcon = document.createElement('i')
        heartIcon.classList.add('fa-solid')
        heartIcon.classList.add('fa-heart')

        if (
            auth.currentUser &&
            comment.likedBy.includes(auth.currentUser.uid)
        ) {
            heartIcon.classList.add('liked')
        }
        heartIcon.onclick = () => {
            if (!auth.currentUser) {
                errorPopup('You must be logged in to like comments!')
                return
            }
            if (comment.likedBy.includes(auth.currentUser.uid)) {
                updateComment({
                    ...comment,
                    likedBy: comment.likedBy.filter(
                        (id) => id !== auth.currentUser.uid
                    ),
                })
            } else {
                updateComment({
                    ...comment,
                    likedBy: [...comment.likedBy, auth.currentUser.uid],
                })
            }
        }

        // --- Reply Form Area ---
        const replyFormArea = document.createElement('div')

        // --- Reply Button ---
        const replyButton = document.createElement('button')
        replyButton.classList.add('button-normal')
        replyButton.textContent = 'Reply'
        let replyFormState = false
        replyButton.onclick = () => {
            replyFormArea.innerHTML = ''
            replyFormState = !replyFormState
            if (!replyFormState) return
            const replyForm = document.createElement('form')
            replyForm.classList.add('comment-form')
            replyForm.classList.add('reply-form')
            const commentInput = document.createElement('input')
            commentInput.type = 'text'
            commentInput.name = 'comment'
            commentInput.placeholder = 'Enter reply here...'

            const cancelButton = document.createElement('input')
            cancelButton.type = 'button'
            cancelButton.classList.add('button-red')
            cancelButton.value = 'Cancel'

            const postButton = document.createElement('input')
            postButton.type = 'submit'
            postButton.value = 'Post'

            cancelButton.onclick = (e) => {
                replyFormArea.removeChild(replyForm)
            }

            replyForm.onsubmit = (e) => {
                postComment(e, comment)
                commentInput.value = ''
                replyFormArea.removeChild(replyForm)
            }

            replyForm.appendChild(commentInput)
            replyForm.appendChild(cancelButton)
            replyForm.appendChild(postButton)

            replyFormArea.appendChild(replyForm)
        }

        controlSectionLeft.appendChild(likesCounter)
        controlSectionLeft.appendChild(heartIcon)
        controlSectionLeft.appendChild(replyButton)

        // --- Comment Controls Section Right ---
        let controlSectionRight = false
        if (auth.currentUser && comment.userId == auth.currentUser.uid) {
            controlSectionRight = document.createElement('section')

            // --- Delete Button ---
            const deleteButton = document.createElement('button')
            deleteButton.classList.add('button-red')
            deleteButton.textContent = 'Delete'
            deleteButton.onclick = () => deleteComment(comment.id)

            controlSectionRight.appendChild(deleteButton)
        }

        commentControls.appendChild(controlSectionLeft)
        if (controlSectionRight) {
            commentControls.appendChild(controlSectionRight)
        }

        let viewReplies
        let replyList
        if (comment.replies.length > 0) {
            viewReplies = document.createElement('p')
            viewReplies.classList.add('view-replies')
            viewReplies.textContent = `View ${comment.replies.length} Repl${comment.replies.length == 1 ? 'y' : 'ies'}`
            replyList = document.createElement('div')
            let replyState = false
            viewReplies.onclick = () => {
                replyState = !replyState
                replyList.innerHTML = ''
                if (replyState) {
                    comment.replies.forEach((reply) => {
                        addReplyToDOM(replyList, comment, reply)
                    })
                }
            }
        }

        commentDiv.appendChild(header)
        commentDiv.appendChild(commentText)
        commentDiv.appendChild(commentControls)
        if (viewReplies) {
            commentDiv.appendChild(viewReplies)
        }
        commentDiv.appendChild(replyFormArea)
        if (replyList) {
            commentDiv.appendChild(replyList)
        }

        commentList.appendChild(commentDiv)
    }

    function addReplyToDOM(parentNode, comment, reply) {
        const replyDiv = document.createElement('div')
        replyDiv.classList.add('reply')

        // --- Header ---
        const header = document.createElement('header')
        const usernameLabel = document.createElement('h4')
        const timestamp = document.createElement('p')
        usernameLabel.textContent = reply.user
        timestamp.textContent = new Date(reply.timeSent).toLocaleTimeString(
            [],
            { hour: '2-digit', minute: '2-digit' }
        )
        header.appendChild(usernameLabel)
        header.appendChild(timestamp)

        // --- Comment Text ---
        const replyText = document.createElement('p')
        replyText.textContent = reply.text

        // --- Comment Controls ---
        const replyControls = document.createElement('section')
        replyControls.classList.add('comment-controls')

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

        controlSectionLeft.appendChild(heartIcon)
        controlSectionLeft.appendChild(thumbsDownIcon)

        // --- Comment Controls Section Right ---
        let controlSectionRight = false
        if (reply.userId == auth.currentUser.uid) {
            controlSectionRight = document.createElement('section')

            // --- Delete Button ---
            const deleteButton = document.createElement('button')
            deleteButton.classList.add('button-red')
            deleteButton.textContent = 'Delete'
            deleteButton.onclick = () => deleteReply(comment, reply.id)

            controlSectionRight.appendChild(deleteButton)
        }

        replyControls.appendChild(controlSectionLeft)
        if (controlSectionRight) {
            replyControls.appendChild(controlSectionRight)
        }

        replyDiv.appendChild(header)
        replyDiv.appendChild(replyText)
        replyDiv.appendChild(replyControls)
        parentNode.appendChild(replyDiv)
    }

    /**
     * Creates a comment record in the firebase database
     * @param {Comment} comment - The comment to be created
     * @returns {void}
     */
    function createComment(comment, parentComment = null) {
        const commentKey = db.ref().push({}).key
        const updates = {}

        if (parentComment) {
            parentComment.replies.push({ id: commentKey, ...comment })
            updates[`/comments/${parentComment.id}/`] = parentComment
        } else {
            updates[`/comments/${commentKey}/`] = { id: commentKey, ...comment }
        }
        db.ref().update(updates)
    }

    /**
     * Deletes a given comment in the firebase database
     * @param {string} id - The id of the comment to be deleted
     * @returns {void}
     */
    function deleteComment(id) {
        const commentRef = db.ref(`/comments/${id}`)
        commentRef.remove()
    }

    function deleteReply(comment, replyId) {
        comment.replies = comment.replies.filter((reply) => reply.id != replyId)

        const updates = {}
        updates[`/comments/${comment.id}/`] = comment
        db.ref().update(updates)
    }

    /**
     * Updates a given comment in the firebase database
     * @param {Comment} comment - The comment to be update
     * @returns {void}
     */
    function updateComment(comment) {
        const updates = {}
        updates[`/comments/${comment.id}/`] = comment
        db.ref().update(updates)
    }

    /**
     * Setter for currentProject variable
     * Updates UI Accordingly
     * @param {Project} project - The project to be viewed
     * @returns {void}
     */
    function setCurrentProject(project) {
        currentProject = project
        updateProjectFocus(currentProject)
        // Weird Firebase quirk where if you read from database manually
        // It will break the event listener so you have to ensure it is
        // Added back again
        db.ref('comments')
            .get()
            .then((snapshot) => {
                loadComments(snapshot)
                db.ref(`/comments/`).on('value', loadComments)
            })
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
