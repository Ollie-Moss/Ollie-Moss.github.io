window.addEventListener('loaded-components', () => {
    // UI Elements

    const commentForm = document.getElementById('comment-form')
    const commentInput = document.getElementById('comment-input')
    const commentList = document.getElementById('comment-list')
    const commentCounter = document.getElementById('comment-counter')

    // Local UI state
    const replySectionsOpen = []

    // Listeners

    commentForm.addEventListener('submit', postComment)

    // Firebase Listeners
    db.ref(`/comments/`).off('value')
    db.ref(`/comments/`).on('value', loadComments)

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
                edited: false,
                timeSent: new Date().toISOString(),
                replies: [],
            }

            if (parentComment) {
                comment.parentComment = {
                    userId: parentComment.userId,
                    id: parentComment.id,
                }
            }
            createComment(comment)
        }
    }

    window.refreshComments = function () {
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
        return auth.currentUser && comment.userId === auth.currentUser.uid
    }

    // ------- FIREBASE CRUD OPERATIONS ---------

    /**
     * Creates a comment record in the firebase database
     * @param {Comment} comment - The comment to be created
     * @returns {void}
     */
    function createComment(comment) {
        const key = db.ref(`/comments/${auth.currentUser.uid}`).push({}).key
        comment = { id: key, ...comment }
        getCommentRef(comment).update(comment)
    }

    /**
     * Updates a given comment in the firebase database
     * @param {string} text - The new message the comment will have
     * @returns {void}
     */
    function updateComment(comment) {
        const commentRef = getCommentRef(comment)
        commentRef.child('text').set(comment.text)
        commentRef.child('edited').set(true)
    }

    /**
     * Deletes a given comment in the firebase database
     * @param {Comment} comment - The comment to be deleted
     * @returns {void}
     */
    function deleteComment(comment) {
        getCommentRef(comment).remove()
    }

    /**
     * Updates the likedBy property of a comment
     * @param {Comment} comment - The comment to be deleted
     * @param {boolean} liked - Whether the comment is liked or not
     * @returns {void}
     */
    function likeComment(comment, liked) {
        const likedByRef = getCommentRef(comment).child(
            `likedBy/${auth.currentUser.uid}`
        )
        likedByRef.set(liked)
    }

    /**
     * Gets reference to location of a given comment or reply
     * @param {Comment} comment - The comment to be referenced
     * @returns {DatabaseReference}
     */
    function getCommentRef(comment) {
        return comment.hasOwnProperty('parentComment')
            ? db.ref(
                  `/comments/${comment.parentComment.userId}/${comment.parentComment.id}/replies/${auth.currentUser.uid}/${comment.id}`
              )
            : db.ref(`/comments/${comment.userId}/${comment.id}`)
    }

    // --------- DYNAMIC UI CREATION ----------
    /**
     * Renders a given comment to the DOM
     * @param {Comment} comment - Comment to be rendered
     * @returns {HTMLElement} - The HTML Element in which reply HTML Elements will be appended to
     */
    function addCommentToDOM(comment) {
        const commentDiv = addReplyToDOM(commentList, comment)

        // --- Reply Form Area ---
        const replyFormArea = document.createElement('div')
        const replyButton = createReplyButton(comment, replyFormArea)

        document
            .getElementById(`commentInteractions-${comment.id}`)
            .appendChild(replyButton)

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

        commentDiv.classList.remove('reply')
        commentDiv.classList.add('comment')
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
        replyText.classList.add('comment-text')
        replyText.textContent = reply.text
        replyDiv.appendChild(replyText)

        // --- Comment Controls ---
        const commentControls = document.createElement('section')
        commentControls.classList.add('comment-controls')

        const commentInteractions = createCommentInteractions(reply)
        const commentModifications = createCommentModifications(
            reply,
            replyText
        )

        commentControls.appendChild(commentInteractions)

        if (isCommentOwner(reply)) {
            commentControls.appendChild(commentModifications)
        }
        replyDiv.appendChild(commentControls)

        parentNode.appendChild(replyDiv)
        return replyDiv
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
        usernameLabel.textContent = `${comment.user}${comment.edited ? ' - Edited' : ''}`
        timestamp.textContent = new Date(comment.timeSent).toLocaleTimeString(
            [],
            {
                hour: '2-digit',
                minute: '2-digit',
            }
        )
        header.appendChild(usernameLabel)
        header.appendChild(timestamp)
        return header
    }

    function createCommentInteractions(comment) {
        // --- Comment Controls Section Left ---
        const commentInteractions = document.createElement('section')
        commentInteractions.id = `commentInteractions-${comment.id}`

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
            likeComment(
                comment,
                !comment.likedBy.includes(auth.currentUser.uid)
            )
        }

        commentInteractions.appendChild(likesCounter)
        commentInteractions.appendChild(heartIcon)
        return commentInteractions
    }

    function createCommentModifications(comment, commentText) {
        // --- Comment Controls Section Right ---
        const commentModifications = document.createElement('section')

        // --- Delete Button ---
        const deleteButton = document.createElement('button')
        deleteButton.classList.add('button-red')
        deleteButton.textContent = 'Delete'
        deleteButton.onclick = () => {
            confirmPopup('Are you sure you want to delete this comment?').then(
                (result) => {
                    if (result) {
                        deleteComment(comment)
                    }
                }
            )
        }
        commentModifications.appendChild(deleteButton)

        // --- Edit Button ---
        const editButton = document.createElement('button')
        editButton.classList.add('button-normal')
        editButton.textContent = 'Edit'
        editButton.onclick = (e) => {
            //replace comment text with input
            const commentInput = document.createElement('input')
            commentInput.classList.add('comment-input')
            commentInput.classList.add('comment-text')
            commentInput.type = 'text'
            commentInput.name = 'comment'
            commentInput.value = comment.text

            const cancelButton = document.createElement('input')
            cancelButton.type = 'button'
            cancelButton.classList.add('button-red')
            cancelButton.value = 'Cancel'

            const saveButton = document.createElement('input')
            saveButton.type = 'button'
            saveButton.value = 'Save'

            cancelButton.onclick = (e) => {
                commentInput.replaceWith(commentText)
                newCommentModification.replaceWith(commentModifications)
            }

            saveButton.onclick = (e) => {
                updateComment({ ...comment, text: commentInput.value })
            }

            const newCommentModification = document.createElement('div')
            newCommentModification.appendChild(cancelButton)
            newCommentModification.appendChild(saveButton)

            commentText.replaceWith(commentInput)
            commentModifications.replaceWith(newCommentModification)
        }
        commentModifications.appendChild(editButton)

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
})
