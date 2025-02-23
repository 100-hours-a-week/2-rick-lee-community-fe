// features/post/list/PostList.js
import { postStorage } from '/entities/post/PostStorage.js'

// DOM 요소 참조
const postsContainer = document.getElementById('postsContainer');
const loadingElement = document.getElementById('loading');
const writeButton = document.getElementById('writeButton');

// HTML 이스케이프 처리
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}     

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 게시글 HTML 요소 생성
function createPostElement(post) {
    return `
        <div class="post-item" data-post-id="${post.id}">
            <div class="post-header">
                <h3 class="post-title">${escapeHtml(post.title)}</h3>
                <div class="post-meta">
                    <span class="post-date">${formatDate(post.createdAt)}</span>
                    <span class="post-stats">
                        <span class="views">조회 ${post.viewCount}</span>
                        <span class="comments">댓글 ${post.commentCount}</span>
                        <span class="likes">좋아요 ${post.likeCount}</span>
                    </span>
                </div>
            </div>
        </div>
    `;
}

// 로딩 상태 표시
function showLoading() {
    loadingElement.style.display = 'block';
}

// 로딩 상태 숨기기
function hideLoading() {
    loadingElement.style.display = 'none';
}

// 에러 상태 표시
function showError(message) {
    postsContainer.innerHTML = `
        <div class="error-state">
            <p>${message}</p>
        </div>
    `;
}

// 빈 상태 표시
function showEmptyState() {
    postsContainer.innerHTML = `
        <div class="empty-state">
            <p>아직 게시글이 없습니다.</p>
            <p>첫 번째 게시글의 주인공이 되어보세요!</p>
        </div>
    `;
}

// 게시글 목록 렌더링
function renderPosts(posts) {
    if (!posts.length) {
        showEmptyState();
        return;
    }

    postsContainer.innerHTML = posts
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(post => createPostElement(post))
        .join('');
}

// 게시글 목록 로드
async function loadPosts() {
    try {
        showLoading();
        const posts = postStorage.getAllPosts();
        renderPosts(posts);
    } catch (error) {
        console.error('게시글 목록 로딩 중 오류:', error);
        showError('게시글을 불러오는 중 오류가 발생했습니다.');
    } finally {
        hideLoading();
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    writeButton.addEventListener('click', () => {
        window.location.href = '/pages/post/write/index.html';
    });
}

// 초기화
function initialize() {
    loadPosts();
    setupEventListeners();
}

// 페이지 로드 시 초기화
initialize();