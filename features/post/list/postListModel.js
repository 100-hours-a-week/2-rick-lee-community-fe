// features/post/list/model/postListModel.js
import { postListApi } from '/entities/post/api/postListApi.js';

/**
 * 게시글 목록 모델 클래스
 * 게시글 데이터 가공 및 관리를 담당
 */
export class PostListModel {
    constructor() {
        this.posts = [];
        this.pagination = null;
        this.loading = false;
        this.error = null;
    }

    /**
     * 게시글 목록 로드
     * @param {Object} options - 조회 옵션
     * @returns {Promise<Object>} 처리 결과
     */
    async loadPosts(options = {}) {
        try {
            this.loading = true;
            this.error = null;
            
            const result = await postListApi.getPosts(options);
            
            if (result.success) {
                this.posts = result.data.posts;
                this.pagination = result.pagination;
                return { success: true, data: this.posts };
            } else {
                this.error = result.message;
                return { success: false, message: result.message };
            }
        } catch (error) {
            this.error = error.message || '게시글을 불러오는데 실패했습니다.';
            return { success: false, message: this.error };
        } finally {
            this.loading = false;
        }
    }

    /**
     * 게시글 제목 포맷팅 (26자 제한)
     * @param {string} title - 원본 제목
     * @returns {string} 포맷팅된 제목
     */
    formatTitle(title) {
        if (!title) return '';
        return title.length > 26 ? title.substring(0, 26) + '...' : title;
    }

    /**
     * 숫자 단위 포맷팅 (K 단위)
     * @param {number} value - 포맷팅할 숫자
     * @returns {string} 포맷팅된 문자열
     */
    formatNumber(value) {
        if (!value && value !== 0) return '0';
        
        if (value >= 100000) {
            return `${Math.floor(value / 1000)}k`;
        } else if (value >= 10000) {
            return `${Math.floor(value / 1000)}k`;
        } else if (value >= 1000) {
            return `${Math.floor(value / 1000)}k`;
        }
        
        return value.toString();
    }

    /**
     * 날짜 포맷팅
     * @param {string} dateString - ISO 형식 날짜 문자열
     * @returns {string} 포맷팅된 날짜
     */
    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        // 하루 이내인 경우
        if (diff < 24 * 60 * 60 * 1000) {
            const hours = date.getHours();
            const minutes = date.getMinutes();
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
        
        // 일주일 이내인 경우
        if (diff < 7 * 24 * 60 * 60 * 1000) {
            const days = ['일', '월', '화', '수', '목', '금', '토'];
            return `${days[date.getDay()]}요일`;
        }
        
        // 그 외
        return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
    }

    /**
     * HTML 특수문자 이스케이프
     * @param {string} text - 원본 텍스트
     * @returns {string} 이스케이프된 텍스트
     */
    escapeHtml(text) {
        if (!text) return '';
        
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
}

export const postListModel = new PostListModel();