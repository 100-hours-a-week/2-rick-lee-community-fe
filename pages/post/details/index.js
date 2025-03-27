// pages/post/details/index.js
import { postDetailModel } from '/features/post/detail/postDetailModel.js';

/**
 * 게시글 상세 페이지 클래스
 * 게시글 상세 UI 처리 담당
 */
class PostDetailPage {
    constructor() {
        this.postId = this.getPostIdFromUrl();
        
        // ID가 유효하지 않은 경우 처리
        if (!this.postId || this.postId === 'undefined') {
            this.showErrorModal('유효하지 않은 게시글 ID입니다.');
            setTimeout(() => {
                window.location.href = '/pages/post/list/index.html';
            }, 2000);
            return;
        }
        
        this.elements = this.initializeElements();
        this.confirmCallback = null;
        this.setupEventListeners();
        this.loadPostData();
    }

    /**
     * URL에서 게시글 ID 추출
     * @private
     * @returns {string} 게시글 ID
     */
    getPostIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    /**
     * DOM 요소 초기화
     * @private
     */
    initializeElements() {
        return {
            postTitle: document.getElementById('postTitle'),
            authorProfile: document.getElementById('authorProfile'),
            authorName: document.getElementById('authorName'),
            postDate: document.getElementById('postDate'),
            postControls: document.getElementById('postControls'),
            editPostButton: document.getElementById('editPostButton'),
            deletePostButton: document.getElementById('deletePostButton'),
            postImageContainer: document.getElementById('postImageContainer'),
            imagePlaceholder: document.getElementById('imagePlaceholder'),
            postText: document.getElementById('postText'),
            likeButton: document.getElementById('likeButton'),
            likeCount: document.getElementById('likeCount'),
            viewCount: document.getElementById('viewCount'),
            commentCount: document.getElementById('commentCount'),
            commentInput: document.getElementById('commentInput'),
            commentSubmitBtn: document.getElementById('commentSubmitBtn'),
            commentsList: document.getElementById('commentsList'),
            
            // 모달 관련 요소
            errorModal: document.getElementById('errorModal'),
            errorMessage: document.getElementById('errorMessage'),
            errorModalCloseBtn: document.getElementById('errorModalCloseBtn'),
            confirmModal: document.getElementById('confirmModal'),
            confirmTitle: document.getElementById('confirmTitle'),
            confirmMessage: document.getElementById('confirmMessage'),
            confirmBtn: document.getElementById('confirmBtn'),
            cancelBtn: document.getElementById('cancelBtn')
        };
    }

    /**
     * 이벤트 리스너 설정
     * @private
     */
    setupEventListeners() {
        // 댓글 입력 변경 이벤트
        this.elements.commentInput.addEventListener('input', () => {
            this.elements.commentSubmitBtn.disabled = !this.elements.commentInput.value.trim();
        });

        // 댓글 작성 이벤트
        this.elements.commentSubmitBtn.addEventListener('click', () => {
            this.handleCommentSubmit();
        });

        // 좋아요 버튼 클릭 이벤트
        this.elements.likeButton.addEventListener('click', () => {
            this.toggleLike();
        });

        // 게시글 수정 버튼 클릭 이벤트
        this.elements.editPostButton.addEventListener('click', () => {
            window.location.href = `/pages/post/edit/index.html?id=${this.postId}`;
        });

        // 게시글 삭제 버튼 클릭 이벤트
        this.elements.deletePostButton.addEventListener('click', () => {
            this.showConfirmModal('게시글 삭제', '정말 이 게시글을 삭제하시겠습니까?', () => {
                this.deletePost();
            });
        });

        // 에러 모달 닫기 버튼
        this.elements.errorModalCloseBtn.addEventListener('click', () => {
            this.hideErrorModal();
        });

        // 확인 모달 버튼들
        this.elements.confirmBtn.addEventListener('click', () => {
            this.hideConfirmModal();
            if (this.confirmCallback) {
                this.confirmCallback();
                this.confirmCallback = null;
            }
        });

        this.elements.cancelBtn.addEventListener('click', () => {
            this.hideConfirmModal();
            this.confirmCallback = null;
        });
    }

    /**
     * 게시글 데이터 로드
     * @private
     */
    async loadPostData() {
        if (!this.postId) {
            this.showErrorModal('게시글을 찾을 수 없습니다.');
            return;
        }

        try {
            // 게시글 상세 정보 로드
            const postResult = await postDetailModel.loadPostDetail(this.postId);
            if (!postResult.success) {
                this.showErrorModal(postResult.message);
                return;
            }

            // 댓글 목록 로드
            const commentsResult = await postDetailModel.loadComments(this.postId);
            if (!commentsResult.success) {
                this.showErrorModal(commentsResult.message);
            }

            // UI 업데이트
            this.updatePostUI(postResult.data);
            this.updateCommentsUI(commentsResult.data);
        } catch (error) {
            console.error('게시글 데이터 로드 중 오류:', error);
            this.showErrorModal('게시글 데이터를 불러오는데 실패했습니다.');
        }
    }

    /**
     * 게시글 UI 업데이트
     * @private
     * @param {Object} post - 게시글 데이터
     */
    updatePostUI(post) {
        if (!post) return;

        // 게시글 제목
        this.elements.postTitle.textContent = post.title;

        // 작성자 정보 - 객체가 아닌 flat한 구조 사용
        this.elements.authorName.textContent = post.authorNickname;
        if (post.authorProfileImg) {
            // ArrayBuffer를 데이터 URL로 변환해야 할 수도 있음
            const imgSrc = post.authorProfileImg instanceof ArrayBuffer 
                ? URL.createObjectURL(new Blob([post.authorProfileImg])) 
                : post.authorProfileImg;
            this.elements.authorProfile.src = imgSrc;
        }

        // 작성일
        this.elements.postDate.textContent = postDetailModel.formatDate(post.createdAt);

        // 게시글 내용
        this.elements.postText.textContent = post.content;

        // 이미지가 있는 경우
        if (post.postImg) {
            this.elements.imagePlaceholder.style.display = 'none';
            const imgElement = document.createElement('img');
            // ArrayBuffer를 데이터 URL로 변환해야 할 수도 있음
            const imgSrc = post.postImg instanceof ArrayBuffer 
                ? URL.createObjectURL(new Blob([post.postImg])) 
                : post.postImg;
            imgElement.src = imgSrc;
            imgElement.alt = '게시글 이미지';
            imgElement.className = 'post-image-content';
            this.elements.postImageContainer.appendChild(imgElement);
        } else {
            this.elements.imagePlaceholder.style.display = 'none';
        }

        // 통계 업데이트 - 필드명 일치
        this.elements.likeCount.textContent = postDetailModel.formatNumber(post.likeCount);
        this.elements.viewCount.textContent = postDetailModel.formatNumber(post.viewCount);
        this.elements.commentCount.textContent = postDetailModel.formatNumber(post.commentCount);

        // 좋아요 버튼 상태 업데이트
        this.updateLikeButtonState(postDetailModel.isLiked);

        // 수정, 삭제 버튼 표시 여부
        if (postDetailModel.canEditPost()) {
            this.elements.postControls.style.display = 'flex';
        } else {
            this.elements.postControls.style.display = 'none';
        }
    }

    /**
     * 댓글 목록 UI 업데이트
     * @private
     * @param {Array} comments - 댓글 데이터 배열
     */
    updateCommentsUI(comments) {
        if (!comments || comments.length === 0) {
            this.elements.commentsList.innerHTML = '<p class="no-comments">댓글이 없습니다. 첫 댓글을 작성해보세요!</p>';
            return;
        }

        const commentsHtml = comments.map(comment => this.createCommentElement(comment)).join('');
        this.elements.commentsList.innerHTML = commentsHtml;

        // 댓글 수정, 삭제 버튼 이벤트 등록
        comments.forEach(comment => {
            const commentElement = document.getElementById(`comment-${comment.id}`);
            if (!commentElement) return;

            const editBtn = commentElement.querySelector('.edit-comment-btn');
            const deleteBtn = commentElement.querySelector('.delete-comment-btn');

            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    this.startEditingComment(comment);
                });
            }

            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    this.showConfirmModal('댓글 삭제', '정말 이 댓글을 삭제하시겠습니까?', () => {
                        this.deleteComment(comment.id);
                    });
                });
            }
        });
    }

    /**
     * 개별 댓글 HTML 생성
     * @private
     * @param {Object} comment - 댓글 데이터
     * @returns {string} 댓글 HTML
     */
    createCommentElement(comment) {
        const canEdit = postDetailModel.canEditComment(comment.author.id);
        const controlsHtml = canEdit ? `
            <div class="comment-controls">
                <button class="control-button edit-comment-btn">수정</button>
                <button class="control-button delete-comment-btn">삭제</button>
            </div>
        ` : '';

        return `
            <div class="comment-item" id="comment-${comment.id}" data-comment-id="${comment.id}">
                <div class="comment-meta">
                    <img src="${comment.author.profileImage || '/shared/assets/images/default-profile.svg'}" alt="댓글 작성자 프로필" class="comment-profile">
                    <span class="comment-author">${postDetailModel.escapeHtml(comment.author.nickname)}</span>
                    <span class="comment-date">${postDetailModel.formatDate(comment.createdAt)}</span>
                    ${controlsHtml}
                </div>
                <p class="comment-text">${postDetailModel.escapeHtml(comment.content)}</p>
            </div>
        `;
    }

    /**
     * 댓글 작성 처리
     * @private
     */
    async handleCommentSubmit() {
        const content = this.elements.commentInput.value.trim();
        if (!content) return;

        this.elements.commentSubmitBtn.disabled = true;

        try {
            if (postDetailModel.editingCommentId) {
                // 댓글 수정
                const result = await postDetailModel.updateComment(
                    this.postId,
                    postDetailModel.editingCommentId,
                    content
                );

                if (result.success) {
                    this.elements.commentInput.value = '';
                    this.elements.commentSubmitBtn.textContent = '댓글 등록';
                    await this.loadPostData(); // 댓글 목록 새로고침
                } else {
                    this.showErrorModal(result.message);
                }
            } else {
                // 새 댓글 작성
                const result = await postDetailModel.createComment(this.postId, content);

                if (result.success) {
                    this.elements.commentInput.value = '';
                    await this.loadPostData(); // 댓글 목록 새로고침
                } else {
                    this.showErrorModal(result.message);
                }
            }
        } catch (error) {
            console.error('댓글 처리 중 오류:', error);
            this.showErrorModal('댓글 처리 중 오류가 발생했습니다.');
        } finally {
            this.elements.commentSubmitBtn.disabled = false;
        }
    }

    /**
     * 댓글 수정 시작
     * @private
     * @param {Object} comment - 수정할 댓글 데이터
     */
    startEditingComment(comment) {
        this.elements.commentInput.value = comment.content;
        this.elements.commentInput.focus();
        this.elements.commentSubmitBtn.textContent = '댓글 수정';
        this.elements.commentSubmitBtn.disabled = false;
        postDetailModel.editingCommentId = comment.id;

        // 스크롤을 댓글 입력창으로 이동
        this.elements.commentInput.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * 댓글 삭제 처리
     * @private
     * @param {string} commentId - 삭제할 댓글 ID
     */
    async deleteComment(commentId) {
        try {
            const result = await postDetailModel.deleteComment(this.postId, commentId);
            
            if (result.success) {
                await this.loadPostData(); // 댓글 목록 새로고침
            } else {
                this.showErrorModal(result.message);
            }
        } catch (error) {
            console.error('댓글 삭제 중 오류:', error);
            this.showErrorModal('댓글 삭제 중 오류가 발생했습니다.');
        }
    }

    /**
     * 게시글 삭제 처리
     * @private
     */
    async deletePost() {
        try {
            const result = await postDetailModel.deletePost(this.postId);
            
            if (result.success) {
                window.location.href = '/pages/post/list/index.html';
            } else {
                this.showErrorModal(result.message);
            }
        } catch (error) {
            console.error('게시글 삭제 중 오류:', error);
            this.showErrorModal('게시글 삭제 중 오류가 발생했습니다.');
        }
    }

    /**
     * 좋아요 상태 토글
     * @private
     */
    async toggleLike() {
        try {
            const result = await postDetailModel.toggleLike(this.postId);
            
            if (result.success) {
                this.updateLikeButtonState(result.isLiked);
                this.elements.likeCount.textContent = postDetailModel.formatNumber(result.likeCount);
            } else {
                this.showErrorModal(result.message);
            }
        } catch (error) {
            console.error('좋아요 처리 중 오류:', error);
            this.showErrorModal('좋아요 처리 중 오류가 발생했습니다.');
        }
    }

    /**
     * 좋아요 버튼 상태 업데이트
     * @private
     * @param {boolean} isLiked - 좋아요 상태
     */
    updateLikeButtonState(isLiked) {
        if (isLiked) {
            this.elements.likeButton.classList.add('active');
            this.elements.likeButton.style.backgroundColor = '#ACA0EB';
        } else {
            this.elements.likeButton.classList.remove('active');
            this.elements.likeButton.style.backgroundColor = '#D9D9D9';
        }
    }

    /**
     * 에러 모달 표시
     * @private
     * @param {string} message - 에러 메시지
     */
    showErrorModal(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorModal.style.display = 'flex';
    }

    /**
     * 에러 모달 숨김
     * @private
     */
    hideErrorModal() {
        this.elements.errorModal.style.display = 'none';
    }

    /**
     * 확인 모달 표시
     * @private
     * @param {string} title - 모달 제목
     * @param {string} message - 모달 메시지
     * @param {Function} callback - 확인 버튼 클릭 시 실행할 콜백 함수
     */
    showConfirmModal(title, message, callback) {
        this.elements.confirmTitle.textContent = title;
        this.elements.confirmMessage.textContent = message;
        this.confirmCallback = callback;
        this.elements.confirmModal.style.display = 'flex';
    }

    /**
     * 확인 모달 숨김
     * @private
     */
    hideConfirmModal() {
        this.elements.confirmModal.style.display = 'none';
    }
    
}

document.addEventListener('DOMContentLoaded', () => {
    // 다양한 방식으로 postId 추출 시도
    console.log('window.location.search:', window.location.search);
    console.log('window.location.href:', window.location.href);

    // URLSearchParams로 ID 추출
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    console.log('추출된 postId:', postId);

    // ID 유효성 검사
    if (!postId || postId === 'undefined' || isNaN(parseInt(postId))) {
        console.error('유효하지 않은 게시글 ID:', postId);
        alert('유효하지 않은 게시글 ID입니다.');
        window.location.href = '/pages/post/list/index.html';
        return;
    }

    // 유효한 ID가 있을 경우에만 PostDetailPage 클래스 초기화
    new PostDetailPage();
});