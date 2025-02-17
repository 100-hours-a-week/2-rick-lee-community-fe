import { postStorage } from '/entities/post/model/postStorage.js';
import { userStorage } from '/entities/user/model/userStorage.js';

class PostList {
    constructor() {
        this.postListElement = document.getElementById('postList');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.writeButton = document.getElementById('writeButton');
        this.page = 1;
        this.loading = false;
        this.hasMore = true;

        this.initializeUI();
        this.setupEventListeners();
    }

    initializeUI() {
        // 현재 로그인한 사용자 정보 표시
        const currentUser = userStorage.getCurrentUser();
        if (currentUser) {
            document.getElementById('userName').textContent = currentUser.nickname;
        }

        // 초기 게시글 로드
        this.loadPosts();
    }

    setupEventListeners() {
        // 게시글 작성 버튼
        this.writeButton.addEventListener('click', () => {
            window.location.href = '/pages/post/write/index.html';
        });

        // 무한 스크롤
        window.addEventListener('scroll', () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
                if (!this.loading && this.hasMore) {
                    this.loadPosts();
                }
            }
        });
    }

    async loadPosts() {
        if (this.loading) return;

        this.loading = true;
        this.loadingIndicator.style.display = 'block';

        try {
            const posts = await this.fetchPosts();
            this.renderPosts(posts);

            if (posts.length < 10) { // 한 페이지당 10개 게시글
                this.hasMore = false;
            } else {
                this.page += 1;
            }
        } catch (error) {
            console.error('게시글 로드 중 오류:', error);
        } finally {
            this.loading = false;
            this.loadingIndicator.style.display = 'none';
        }
    }

    async fetchPosts() {
        // postStorage에서 게시글 가져오기
        const allPosts = postStorage.getAllPosts();
        const start = (this.page - 1) * 10;
        return allPosts.slice(start, start + 10);
    }

    formatNumber(number) {
        if (number >= 100000) return Math.floor(number / 1000) + 'k';
        if (number >= 10000) return '1만';
        if (number >= 1000) return Math.floor(number / 1000) + 'k';
        return number.toString();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).replace(/\./g, '-');
    }

    truncateTitle(title) {
        return title.length > 26 ? title.substring(0, 26) : title;
    }

    renderPosts(posts) {
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post-card';
            postElement.innerHTML = `
                <h2 class="post-title">${this.truncateTitle(post.title)}</h2>
                <div class="post-meta">
                    <div class="post-stats">
                        <span>댓글 ${this.formatNumber(post.comments || 0)}</span>
                        <span>좋아요 ${this.formatNumber(post.likes || 0)}</span>
                    </div>
                    <div class="post-date">${this.formatDate(post.createdAt)}</div>
                </div>
            `;

            postElement.addEventListener('click', () => {
                window.location.href = `/pages/post/detail/index.html?id=${post.id}`;
            });

            this.postListElement.appendChild(postElement);
        });
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new PostList();
});