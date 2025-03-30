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
            console.log('API 응답 전체:', result); // 디버깅용 로그
            
            if (result.success) {
                // 백엔드 응답 구조에 맞게 데이터 추출
                // 'data' 또는 'data.posts'에서 게시글 목록 추출
                let posts = [];
                if (result.data) {
                    // 백엔드 응답 구조에 맞게 조정
                    if (Array.isArray(result.data)) {
                        posts = result.data;
                    } else if (result.data.posts) {
                        posts = result.data.posts;
                    }
                }
                
                console.log('추출된 게시글 데이터:', posts); // 디버깅용 로그
                
                // 게시글 데이터 저장
                this.posts = this.transformPostData(posts);
                
                // 페이지네이션 저장 (있는 경우)
                if (result.pagination) {
                    this.pagination = result.pagination;
                } else if (result.data && result.data.pagination) {
                    this.pagination = result.data.pagination;
                }
                
                return { success: true, data: this.posts };
            } else {
                this.error = result.message || '게시글을 불러오는데 실패했습니다.';
                return { success: false, message: this.error };
            }
        } catch (error) {
            console.error('게시글 목록 로드 중 오류:', error);
            this.error = error.message || '게시글을 불러오는데 실패했습니다.';
            return { success: false, message: this.error };
        } finally {
            this.loading = false;
        }
    }

    /**
     * 백엔드 데이터를 프론트엔드 형식으로 변환
     * @param {Array} posts - 백엔드에서 받은 게시글 데이터
     * @returns {Array} 변환된 게시글 데이터
     */
    transformPostData(posts) {
        if (!Array.isArray(posts)) return [];
        
        return posts.map(post => {
            return {
                id: post.postId || post.post_id || post.id,
                title: post.title || '제목 없음',
                content: post.content,
                // 작성자 정보 (중첩 객체가 아닐 수 있음)
                author: {
                    id: post.user_id || (post.author ? post.author.user_id : null),
                    nickname: post.nickname || post.authorNickname || (post.author ? post.author.nickname : '작성자 정보 없음')
                },
                // 날짜 정보
                createdAt: post.created_at || post.createdAt,
                updatedAt: post.updated_at || post.updatedAt,
                // 통계 정보
                viewCount: post.view_counts || post.viewCount || 0,
                commentCount: post.comment_count || post.commentCount || 0,
                likeCount: post.like_count || post.likeCount || 0
            };
        });
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
        if (value === null || value === undefined) return '0';
        
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
        if (isNaN(date.getTime())) return ''; // 유효하지 않은 날짜
        
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