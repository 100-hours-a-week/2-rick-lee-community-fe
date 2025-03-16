// /features/post/detail/model/postDetailModel.js
import { postDetailApi } from '/entities/post/api/postDetailApi.js';
import { JwtDecoder } from '/utilities/JwtDecoder.js';

export class PostDetailModel extends JwtDecoder {
    constructor() {
        super();
        this.post = null;
        this.comments = [];
        this.currentUserId = this.getCurrentUserId();
        this.isLiked = false;
        this.editingCommentId = null;
    }

    /**
     * 현재 사용자 ID 가져오기 (JWT 토큰 디코딩 방식)
     * @returns {string|null} 현재 사용자 ID
     */
    getCurrentUserId() {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            console.warn('JWT 토큰이 존재하지 않습니다.');
            return null;
        }
        try {
            const payload = this.parseJwt(token);
            // payload 내의 사용자 식별자 필드는 시스템에 따라 달라질 수 있음
            return payload?.id || null;
        } catch (error) {
            console.error('JWT 토큰 파싱 오류:', error);
            return null;
        }
    }

    /**
     * 게시글 상세 정보 로드 및 조회수 증가 (비동기)
     * @param {string} postId - 게시글 ID
     * @returns {Promise<Object>} 처리 결과
     */
    async loadPostDetail(postId) {
        try {
            const result = await postDetailApi.getPostDetail(postId);
            if (result.success) {
                this.post = result.data;
                this.isLiked = result.data.isLiked;
                // 조회수 증가를 별도의 비동기 요청으로 수행 (fire-and-forget)
                postDetailApi.increaseViewCount(postId).catch(err => {
                    console.error('조회수 업데이트 실패:', err);
                });
                return { success: true, data: this.post };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('게시글 상세 로드 중 오류:', error);
            return { success: false, message: '게시글을 불러오는데 실패했습니다.' };
        }
    }

    /**
     * 댓글 목록 로드
     * @param {string} postId - 게시글 ID
     * @returns {Promise<Object>} 처리 결과
     */
    async loadComments(postId) {
        try {
            const result = await postDetailApi.getComments(postId);
            if (result.success) {
                this.comments = result.data;
                return { success: true, data: this.comments };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('댓글 목록 로드 중 오류:', error);
            return { success: false, message: '댓글을 불러오는데 실패했습니다.' };
        }
    }

    /**
     * 댓글 작성 후 목록 갱신
     * @param {string} postId - 게시글 ID
     * @param {string} content - 댓글 내용
     * @returns {Promise<Object>} 처리 결과
     */
    async createComment(postId, content) {
        try {
            const result = await postDetailApi.createComment(postId, content);
            if (result.success) {
                await this.loadComments(postId);
                return { success: true };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('댓글 작성 중 오류:', error);
            return { success: false, message: '댓글 작성에 실패했습니다.' };
        }
    }

    /**
     * 댓글 수정 후 목록 갱신
     * @param {string} postId - 게시글 ID
     * @param {string} commentId - 댓글 ID
     * @param {string} content - 수정할 내용
     * @returns {Promise<Object>} 처리 결과
     */
    async updateComment(postId, commentId, content) {
        try {
            const result = await postDetailApi.updateComment(postId, commentId, content);
            if (result.success) {
                await this.loadComments(postId);
                this.editingCommentId = null;
                return { success: true };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('댓글 수정 중 오류:', error);
            return { success: false, message: '댓글 수정에 실패했습니다.' };
        }
    }

    /**
     * 댓글 삭제 후 목록 갱신
     * @param {string} postId - 게시글 ID
     * @param {string} commentId - 댓글 ID
     * @returns {Promise<Object>} 처리 결과
     */
    async deleteComment(postId, commentId) {
        try {
            const result = await postDetailApi.deleteComment(postId, commentId);
            if (result.success) {
                await this.loadComments(postId);
                return { success: true };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('댓글 삭제 중 오류:', error);
            return { success: false, message: '댓글 삭제에 실패했습니다.' };
        }
    }

    /**
     * 게시글 삭제
     * @param {string} postId - 게시글 ID
     * @returns {Promise<Object>} 처리 결과
     */
    async deletePost(postId) {
        try {
            const result = await postDetailApi.deletePost(postId);
            if (result.success) {
                return { success: true };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('게시글 삭제 중 오류:', error);
            return { success: false, message: '게시글 삭제에 실패했습니다.' };
        }
    }

    /**
     * 좋아요 상태 토글 및 카운트 업데이트
     * @param {string} postId - 게시글 ID
     * @returns {Promise<Object>} 처리 결과
     */
    async toggleLike(postId) {
        try {
            const newLikeState = !this.isLiked;
            const result = await postDetailApi.toggleLike(postId, newLikeState);
            if (result.success) {
                this.isLiked = newLikeState;
                if (this.post && typeof this.post.likeCount === 'number') {
                    this.post.likeCount = newLikeState ? this.post.likeCount + 1 : this.post.likeCount - 1;
                }
                return { success: true, isLiked: this.isLiked, likeCount: this.post?.likeCount };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('좋아요 처리 중 오류:', error);
            return { success: false, message: '좋아요 처리에 실패했습니다.' };
        }
    }

    /**
     * 게시글 수정 권한 확인
     * @returns {boolean} 수정 권한 여부
     */
    canEditPost() {
        if (!this.post || !this.currentUserId) return false;
        return this.post.author?.id === this.currentUserId;
    }

    /**
     * 댓글 수정 권한 확인
     * @param {string} commentAuthorId - 댓글 작성자 ID
     * @returns {boolean} 수정 권한 여부
     */
    canEditComment(commentAuthorId) {
        if (!this.currentUserId) return false;
        return commentAuthorId === this.currentUserId;
    }

    /**
     * 숫자 단위 포맷팅
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
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

export const postDetailModel = new PostDetailModel();
