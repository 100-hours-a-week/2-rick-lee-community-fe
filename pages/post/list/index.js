// pages/post/list/index.js
import { postListModel } from '/features/post/list/postListModel.js';

/**
 * 게시글 목록 페이지 클래스
 * 게시글 목록 UI 처리 담당
 */
class PostListPage {
    constructor() {
        this.elements = this.initializeElements();
        this.setupEventListeners();
        this.loadPosts();
    }

    /**
     * DOM 요소 초기화
     * @private
     */
    initializeElements() {
        return {
            postListContainer: document.getElementById('postList'),
            writeButton: document.getElementById('writeButton'),
            loadingIndicator: document.getElementById('loadingIndicator'),
            errorMessage: document.getElementById('errorMessage')
        };
    }

    /**
     * 이벤트 리스너 설정
     * @private
     */
    setupEventListeners() {
        // 게시글 작성 버튼 클릭 이벤트
        this.elements.writeButton.addEventListener('click', () => {
            window.location.href = '/pages/post/write/index.html';
        });
    }

    /**
     * 게시글 목록 로드
     * @private
     */
    async loadPosts() {
        try {
            this.showLoading(true);
            const result = await postListModel.loadPosts();
            
            if (result.success) {
                this.renderPosts(result.data);
            } else {
                this.showError(result.message);
            }
        } catch (error) {
            this.showError('게시글을 불러오는데 실패했습니다.');
            console.error('게시글 로드 중 오류:', error);
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * 게시글 목록 렌더링
     * @private
     * @param {Array} posts - 게시글 데이터 배열
     */
    renderPosts(posts) {
        if (!posts || posts.length === 0) {
            this.elements.postListContainer.innerHTML = '<p class="no-posts">게시글이 없습니다.</p>';
            return;
        }

        const postsHtml = posts.map(post => this.createPostElement(post)).join('');
        this.elements.postListContainer.innerHTML = postsHtml;

        // 게시글 클릭 이벤트 등록
        const postItems = this.elements.postListContainer.querySelectorAll('.post-item');
        postItems.forEach(item => {
            item.addEventListener('click', () => {
                const postId = item.dataset.postId;
                window.location.href = `/pages/post/details/index.html?id=${postId}`;
            });
        });
    }

    /**
     * 개별 게시글 HTML 생성
     * @private
     * @param {Object} post - 게시글 데이터
     * @returns {string} 게시글 HTML
     */
    createPostElement(post) {
        return `
            <div class="post-item" data-post-id="${post.id}">
                <div class="post-header">
                    <h3 class="post-title" id="postTitle">${postListModel.formatTitle(postListModel.escapeHtml(post.title))}</h3>
                    <div class="post-meta">
                        <span class="post-author">${postListModel.escapeHtml(post.author.nickname)}</span>
                        <span class="post-date">${postListModel.formatDate(post.createdAt)}</span>
                        <span class="post-stats">
                            <span class="views" id="viewCount">조회 ${postListModel.formatNumber(post.viewCount)}</span>
                            <span class="comments" id="commentCount">댓글 ${postListModel.formatNumber(post.commentCount)}</span>
                            <span class="likes" id="likeCount">좋아요 ${postListModel.formatNumber(post.likeCount)}</span>
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 로딩 표시 제어
     * @private
     * @param {boolean} isLoading - 로딩 중 여부
     */
    showLoading(isLoading) {
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = isLoading ? 'block' : 'none';
        }
    }

    /**
     * 에러 메시지 표시
     * @private
     * @param {string} message - 에러 메시지
     */
    showError(message) {
        if (this.elements.errorMessage) {
            this.elements.errorMessage.textContent = message;
            this.elements.errorMessage.style.display = 'block';
        }
    }
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    new PostListPage();
});