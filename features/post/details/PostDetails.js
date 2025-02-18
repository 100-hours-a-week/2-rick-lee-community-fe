import { postStorage } from '/entities/post/PostStorage.js'

/********** 전역 변수 **********/
let post = null;
let postId = null;

// 댓글 데이터는 메모리 내에서 관리 (필요 시 별도 저장소로 확장 가능)
let comments = [
{ id: 1, text: "첫번째 댓글입니다." },
{ id: 2, text: "두번째 댓글입니다." }
];
let commentMode = 'add'; // 'add' 또는 'edit'
let editCommentId = null;

/********** DOM 요소 가져오기 **********/
const backBtn = document.getElementById("backBtn");
const editBtn = document.getElementById("editBtn");
const deleteBtn = document.getElementById("deleteBtn");
const viewCountEl = document.getElementById("viewCount");
const commentCountEl = document.getElementById("commentCount");
const likeBtn = document.getElementById("likeBtn");
const likeCountEl = document.getElementById("likeCount");
const commentInput = document.getElementById("commentInput");
const commentSubmitBtn = document.getElementById("commentSubmitBtn");
const commentsList = document.getElementById("commentsList");
const modalOverlay = document.getElementById("modalOverlay");
const modalMessage = document.getElementById("modalMessage");
const modalConfirmBtn = document.getElementById("modalConfirmBtn");
const modalCancelBtn = document.getElementById("modalCancelBtn");
const pageContent = document.getElementById("pageContent");

/********** 숫자 포맷 함수 **********/
function formatCount(count) {
if(count >= 100000) return "100k";
else if(count >= 10000) return "10k";
else if(count >= 1000) return "1k";
else return count;
}

/********** 게시글 렌더링 **********/
function renderPost() {
document.getElementById("postTitle").innerText = post.title;
document.getElementById("postContent").innerText = post.content;
viewCountEl.innerText = formatCount(post.viewCount);
commentCountEl.innerText = formatCount(post.commentCount);
likeCountEl.innerText = post.likeCount;
likeBtn.classList.toggle("active", post.liked);
}

/********** 댓글 렌더링 **********/
function renderComments() {
commentsList.innerHTML = "";
comments.forEach(comment => {
    const commentDiv = document.createElement("div");
    commentDiv.classList.add("comment");
    commentDiv.dataset.id = comment.id;
    commentDiv.innerHTML = `
    <div class="text">${comment.text}</div>
    <div class="actions">
        <button class="edit-comment-btn">수정</button>
        <button class="delete-comment-btn">삭제</button>
    </div>
    `;
    commentsList.appendChild(commentDiv);
});
}

/********** 초기화 및 게시글 로드 **********/
window.addEventListener('DOMContentLoaded', () => {
const urlParams = new URLSearchParams(window.location.search);
postId = urlParams.get('id');
if (!postId) {
    alert("게시글 ID가 제공되지 않았습니다.");
    return;
}
post = postStorage.getPostById(postId);
if (!post) {
    alert("게시글을 찾을 수 없습니다.");
    return;
}
// 게시글 상세조회 시 조회수 증가 처리
postStorage.updatePost(postId, { viewCount: post.viewCount + 1 });
post = postStorage.getPostById(postId);
renderPost();
renderComments();
});

/********** 페이지 이동 처리 **********/
backBtn.addEventListener("click", () => {
window.location.href = "boardList.html";
});

editBtn.addEventListener("click", () => {
window.location.href = "postEdit.html?id=" + postId;
});

/********** 게시글 삭제 처리 (모달 확인) **********/
deleteBtn.addEventListener("click", () => {
showModal("게시글을 삭제하시겠습니까?", () => {
    const result = postStorage.deletePost(postId);
    if (result.success) {
    alert("게시글이 삭제되었습니다.");
    window.location.href = "boardList.html";
    } else {
    alert(result.message);
    hideModal();
    }
});
});

/********** 좋아요 버튼 토글 **********/
likeBtn.addEventListener("click", () => {
const result = postStorage.toggleLike(postId);
if (result.success) {
    post = result.post;
    renderPost();
} else {
    alert(result.message);
}
});

/********** 댓글 입력창 이벤트 **********/
commentInput.addEventListener("input", () => {
const text = commentInput.value.trim();
if (text) {
    commentSubmitBtn.classList.add("enabled");
    commentSubmitBtn.disabled = false;
} else {
    commentSubmitBtn.classList.remove("enabled");
    commentSubmitBtn.disabled = true;
}
});

/********** 댓글 등록 및 수정 **********/
commentSubmitBtn.addEventListener("click", () => {
const text = commentInput.value.trim();
if (!text) return;
if (commentMode === 'add') {
    // 새 댓글 추가
    const newComment = { id: Date.now(), text };
    comments.push(newComment);
    // 게시글의 댓글 수 업데이트
    post.commentCount++;
    postStorage.updatePost(postId, { commentCount: post.commentCount });
} else if (commentMode === 'edit') {
    // 댓글 수정
    const comment = comments.find(c => c.id == editCommentId);
    if (comment) {
    comment.text = text;
    }
    commentMode = 'add';
    commentSubmitBtn.innerText = "등록";
    editCommentId = null;
}
commentInput.value = "";
commentSubmitBtn.classList.remove("enabled");
commentSubmitBtn.disabled = true;
renderComments();
renderPost();
});

/********** 댓글 영역 내 수정/삭제 버튼 이벤트 위임 **********/
commentsList.addEventListener("click", (e) => {
if (e.target.classList.contains("edit-comment-btn")) {
    const commentDiv = e.target.closest(".comment");
    const id = commentDiv.dataset.id;
    const comment = comments.find(c => c.id == id);
    if (comment) {
    commentInput.value = comment.text;
    commentSubmitBtn.innerText = "댓글 수정";
    commentMode = 'edit';
    editCommentId = id;
    commentSubmitBtn.classList.add("enabled");
    commentSubmitBtn.disabled = false;
    }
}
if (e.target.classList.contains("delete-comment-btn")) {
    const commentDiv = e.target.closest(".comment");
    const id = commentDiv.dataset.id;
    showModal("댓글을 삭제하시겠습니까?", () => {
    comments = comments.filter(c => c.id != id);
    // 게시글의 댓글 수 업데이트
    post.commentCount--;
    postStorage.updatePost(postId, { commentCount: post.commentCount });
    renderComments();
    renderPost();
    });
}
});

/********** 모달 처리 함수 **********/
function showModal(message, confirmCallback) {
modalMessage.innerText = message;
modalOverlay.classList.add("active");
pageContent.classList.add("blur");
document.body.style.overflow = "hidden";
modalConfirmBtn.onclick = () => {
    hideModal();
    confirmCallback();
};
modalCancelBtn.onclick = hideModal;
}

function hideModal() {
modalOverlay.classList.remove("active");
pageContent.classList.remove("blur");
document.body.style.overflow = "";
}
