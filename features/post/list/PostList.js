// pages/post/list/index.js
import { Header } from '/shared/components/Header/Header.js';
import { formatNumber, formatDate } from '/shared/utils/formatters.js';

class PostList {
    constructor() {
        this.page = 1;
        this.loading = false;
        this.hasMore = true;
        this.init();
    }

    async init() {
        // 헤더 초기화
        new Header('header');
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // 초기 게시글 로드
        await this.loadPosts();
    }

    setupEventListeners() {
        // 게시글 작성 버튼
        document.getElementById('writeButton').addEventListener('click', () => {
            window.location.href = '/pages/post/write/index.html';
        });

        // 무한 스크롤
        window.addEventListener('scroll', () => {
            if (this.shouldLoadMore()) {
                this.loadPosts();
            }
        });
    }

    shouldLoadMore() {
        if (this.loading || !this.hasMore) return false;

        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;
        const clientHeight = window.innerHeight;

        return scrollHeight - scrollTop - clientHeight < 100;
    }

    async loadPosts() {
        if (this.loading) return;

        this.loading = true;
        document.getElementById('loading').style.display = 'block';

        try {
            // 실제 구현에서는 API 호출로 대체
            const posts = await this.fetchPosts(this.page);
            this.renderPosts(posts);
            
            this.page++;
            this.hasMore = posts.length > 0;
        } catch (error) {
            console.error('게시글 로드 중 오류:', error);
        } finally {
            this.loading = false;
            document.getElementById('loading').style.display = 'none';
        }
    }

    async fetchPosts(page) {
        // 실제 구현에서는 API 호출로 대체
        // 임시 데이터 반환
        return Array(10).fill().map((_, i) => ({
            id: (page - 1) * 10 + i + 1,
            title: `제목 ${(page - 1) * 10 + i + 1}`,
            content: '더미 게시글',
            createdAt: new Date().toISOString(),
            commentCount: Math.floor(Math.random() * 150000),
            likeCount: Math.floor(Math.random() * 150000)
        }));
    }

    renderPosts(posts) {
        const container = document.getElementById('postsContainer');
        
        posts.forEach(post => {
            const postElement = this.createPostElement(post);
            container.appendChild(postElement);
        });
    }

    createPostElement(post) {
        const element = document.createElement('div');
        element.className = 'post-card';
        element.innerHTML = `
            <div class="post-header">
                <div class="post-title">${this.truncateTitle(post.title)}</div>
                <div class="post-date">${formatDate(post.createdAt)}</div>
            </div>
            <div class="post-stats">
                <span>댓글 ${formatNumber(post.commentCount)}</span>
                <span>좋아요 ${formatNumber(post.likeCount)}</span>
            </div>
        `;

        element.addEventListener('click', () => {
            window.location.href = `/pages/post/detail/index.html?id=${post.id}`;
        });

        return element;
    }

    truncateTitle(title) {
        return title.length > 26 ? title.slice(0, 26) : title;
    }
}

// 포매터 유틸리티 함수
const formatNumber = (num) => {
    if (num >= 100000) return Math.floor(num / 1000) + 'k';
    if (num >= 10000) return '1만';
    if (num >= 1000) return Math.floor(num / 1000) + 'k';
    return num.toString();
};

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).replace(/\./g, '-');
};

// 페이지 초기화
new PostList();