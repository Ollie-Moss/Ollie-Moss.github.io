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

    // Local UI state
    let currentProject = 0
    const replySectionsOpen = []

    // Listeners
    projectCloseButton.addEventListener('click', closeProjectFocus)

    commentForm.addEventListener('submit', postComment)

    searchForm.addEventListener('submit', searchProjects)
    clearSearchButton.addEventListener('click', clearSearch)

    // Firebase Listeners
    db.ref(`/comments/`).off('value')
    db.ref(`/comments/`).on('value', loadComments)

    // Intialization
    renderProjects(projects)

    /**
     * Creates local comment element and updates firebase database with given comment
     * @param {SubmitEvent} e - form submission event
     * @param {Comment} parentComment - The parent comment of the comment to be posted
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
            const comment = {
                userId: auth.currentUser.uid,
                projectId: currentProject.id,
                user: auth.currentUser.displayName,
                text: commentText,
                likedBy: [],
                timeSent: new Date().toISOString(),
                replies: [],
            }

            if (parentComment) {
                comment.parentComment = {
                    userId: parentComment.userId,
                    id: parentComment.id,
                }
                createReply(comment)
                return
            }
            createComment(comment)
        }
    }

    function refreshComments() {
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
     * Renders comments from firebase database related to a given project
     * @param {DataSnapshot}  - snapshot of the database
     * @returns {void}
     */
    async function loadComments(snapshot) {
        commentList.innerHTML = ''
        let counter = 0
        snapshot.forEach((userSnapshot) => {
            userSnapshot.forEach((commentSnapshot) => {
                let comment = commentSnapshot.val()
                if (comment.projectId === currentProject.id) {
                    comment = fixCommentProperties(comment)
                    let replyNode = addCommentToDOM(comment)

                    comment.replies.forEach((reply) => {
                        if (replySectionsOpen[comment.id]) {
                            addReplyToDOM(replyNode, reply)
                        }
                        counter += 1
                    })
                    counter += 1
                }
            })
        })
        commentCounter.textContent = `${counter} Comment${counter == 1 ? '' : 's'}`
    }

    function fixCommentProperties(comment) {
        // Ensure comment has all desired properties
        if (!comment.hasOwnProperty('likedBy')) {
            comment.likedBy = {}
        }
        if (!comment.hasOwnProperty('replies')) {
            comment.replies = {}
        }

        /* Convert from comment.replies: {
         *      userid: {
         *          comment1: {}
         *      },
         *      userid: {
         *          comment2: {}
         *      }
         *      ...
         * }
         * To comment.replies: {
         *      [comment1, comment2...]
         * }
         */
        comment.replies = [].concat(
            ...Object.values(comment.replies).map((userReplies) =>
                Object.values(userReplies)
            )
        )

        /* Convert from comment.likedBy: {
         *          userid: boolean,
         *          userid: boolean,
         *          ...
         *      }
         * To comment.likedBy: [userId, userId...]
         */
        comment.likedBy = Object.entries(comment.likedBy)
            .filter(([userId, liked]) => liked)
            .map(([userId, liked]) => userId)

        // fix replies for each comment
        comment.replies.forEach((reply) => {
            if (!reply.hasOwnProperty('likedBy')) {
                reply.likedBy = []
            }
            // Doing likedby conversion again
            reply.likedBy = Object.entries(reply.likedBy)
                .filter(([userId, liked]) => liked)
                .map(([userId, liked]) => userId)
        })

        return comment
    }

    function isCommentOwner(comment) {
        return comment.userId === auth.currentUser.uid
    }

    // ------- FIREBASE CRUD OPERATIONS ---------

    /**
     * Creates a comment record in the firebase database
     * @param {Comment} comment - The comment to be created
     * @returns {void}
     */
    function createComment(comment) {
        const commentKey = db
            .ref(`/comments/${auth.currentUser.uid}`)
            .push({}).key
        updateComment({ id: commentKey, ...comment })
    }

    function createReply(reply) {
        const replyKey = db
            .ref(`/comments/${auth.currentUser.uid}`)
            .push({}).key
        updateReply({ id: replyKey, ...reply })
    }

    function updateCommentOrReply(comment) {
        if (comment.hasOwnProperty('parentComment')) {
            updateReply(comment)
            return
        }
        updateComment(comment)
    }

    /**
     * Updates a given comment in the firebase database
     * @param {Comment} comment - The comment to be update
     * @returns {void}
     */
    function updateComment(comment) {
        const updates = {}
        updates[`/comments/${comment.userId}/${comment.id}/`] = comment
        db.ref().update(updates)
    }

    function updateReply(reply) {
        const updates = {}
        updates[
            `/comments/${reply.parentComment.userId}/${reply.parentComment.id}/replies/${reply.userId}/${reply.id}`
        ] = reply
        db.ref().update(updates)
    }

    function deleteCommentOrReply(comment) {
        if (comment.hasOwnProperty('parentComment')) {
            deleteReply(comment)
            return
        }
        deleteComment(comment)
    }

    /**
     * Deletes a given comment in the firebase database
     * @param {string} id - The id of the comment to be deleted
     * @returns {void}
     */
    function deleteComment(comment) {
        const commentRef = db.ref(`/comments/${auth.currentUser.uid}/${comment.id}`)
        commentRef.remove()
    }

    function deleteReply(reply) {
        const replyRef = db.ref(
            `/comments/${reply.parentComment.userId}/${reply.parentComment.id}/replies/${auth.currentUser.uid}/${reply.id}`
        )
        replyRef.remove()
    }

    function likeCommentOrReply(comment, liked) {
        if (comment.hasOwnProperty('parentComment')) {
            likeReply(comment, liked)
            return
        }
        likeComment(comment, liked)
    }

    function likeComment(comment, liked) {
        const likedByRef = db.ref(
            `/comments/${comment.userId}/${comment.id}/likedBy/${auth.currentUser.uid}`
        )
        likedByRef.set(liked)
    }

    function likeReply(reply, liked) {
        const likedByRef = db.ref(
            `/comments/${reply.parentComment.userId}/${reply.parentComment.id}/replies/${auth.currentUser.uid}/${reply.id}/likedBy/${auth.currentUser.uid}`
        )
        likedByRef.set(liked)
    }

    // --------- DYNAMIC UI CREATION ----------

    /**
     * Renders a given comment to the DOM
     * @param {Comment} comment - Comment to be rendered
     * @returns {HTMLElement} - The HTML Element in which reply HTML Elements will be appended to
     */
    function addCommentToDOM(comment) {
        // --- Comment Div ---
        const commentDiv = document.createElement('div')
        commentDiv.classList.add('comment')

        const header = createCommentHeader(comment)
        commentDiv.appendChild(header)

        // --- Comment Text ---
        const commentText = document.createElement('p')
        commentText.textContent = comment.text
        commentDiv.appendChild(commentText)

        // --- Comment Controls ---
        const commentControls = document.createElement('section')
        commentControls.classList.add('comment-controls')

        // --- Comment Interactions ---
        const commentInteractions = createCommentInteractions(comment)
        // --- Reply Form Area ---
        const replyFormArea = document.createElement('div')
        const replyButton = createReplyButton(comment, replyFormArea)

        commentInteractions.appendChild(replyButton)
        commentControls.appendChild(commentInteractions)

        // Comment Modifications
        if (isCommentOwner(comment)) {
            const commentModifications = createCommentModifications(comment)
            commentControls.appendChild(commentModifications)
        }
        commentDiv.appendChild(commentControls)

        const replyList = document.createElement('div')
        if (comment.replies.length > 0) {
            const viewRepliesButton = createViewRepliesButton(
                comment,
                replyList
            )
            commentDiv.appendChild(viewRepliesButton)
        }
        commentDiv.appendChild(replyFormArea)
        commentDiv.appendChild(replyList)
        commentList.appendChild(commentDiv)

        return replyList
    }

    function addReplyToDOM(parentNode, reply) {
        const replyDiv = document.createElement('div')
        replyDiv.classList.add('reply')

        // --- Header ---
        header = createCommentHeader(reply)
        replyDiv.appendChild(header)

        // --- Comment Text ---
        const replyText = document.createElement('p')
        replyText.textContent = reply.text
        replyDiv.appendChild(replyText)

        // --- Comment Controls ---
        const commentControls = document.createElement('section')
        commentControls.classList.add('comment-controls')

        const commentInteractions = createCommentInteractions(reply)
        const commentModifications = createCommentModifications(reply)

        commentControls.appendChild(commentInteractions)

        if (isCommentOwner(reply)) {
            commentControls.appendChild(commentModifications)
        }
        replyDiv.appendChild(commentControls)

        parentNode.appendChild(replyDiv)
    }

    function createViewRepliesButton(comment, replyList) {
        let viewReplies = document.createElement('p')

        viewReplies.classList.add('view-replies')
        viewReplies.textContent = `View ${comment.replies.length} Repl${comment.replies.length == 1 ? 'y' : 'ies'}`

        viewReplies.onclick = () => {
            replyList.innerHTML = ''
            // if null or false = true
            // if true = false
            replySectionsOpen[comment.id] = replySectionsOpen[comment.id]
                ? false
                : true
            if (replySectionsOpen[comment.id]) {
                refreshComments()
            }
        }
        return viewReplies
    }

    function createCommentHeader(comment) {
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
        return header
    }

    function createCommentInteractions(comment) {
        // --- Comment Controls Section Left ---
        const controlInteractions = document.createElement('section')

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
                // Removes user from likedBy
                likeCommentOrReply(comment, false)
            } else {
                // Adds user to likedBy
                likeCommentOrReply(comment, true)
            }
        }

        controlInteractions.appendChild(likesCounter)
        controlInteractions.appendChild(heartIcon)
        return controlInteractions
    }

    function createCommentModifications(comment) {
        // --- Comment Controls Section Right ---
        const commentModifications = document.createElement('section')

        // --- Delete Button ---
        const deleteButton = document.createElement('button')
        deleteButton.classList.add('button-red')
        deleteButton.textContent = 'Delete'
        deleteButton.onclick = () => deleteCommentOrReply(comment)

        commentModifications.appendChild(deleteButton)
        return commentModifications 
    }

    function createReplyButton(comment, replyFormArea) {
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
        return replyButton
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
    /**
     * Shows an error popup box
     * @param {string} message - The error message to be displayed
     * @returns {void}
     */
    function errorPopup(message) {
        const popup = document.createElement('dialog')
        popup.classList.add('error-popup')
        popup.id = 'popup'
        const text = document.createElement('p')
        text.textContent = message
        const closeIcon = document.createElement('i')
        closeIcon.classList.add('fas')
        closeIcon.classList.add('fa-times')
        closeIcon.onclick = () => {
            document.body.removeChild(popup)
        }

        popup.appendChild(text)
        popup.appendChild(closeIcon)
        const oldPopup = document.getElementById('popup')
        if (oldPopup) {
            document.body.replaceChild(popup, oldPopup)
            return
        }
        document.body.appendChild(popup)

        setInterval(() => (popup.style.opacity = 0), 5000)
    }
})
