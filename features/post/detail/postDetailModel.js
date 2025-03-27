// /features/post/detail/model/postDetailModel.js
import { postDetailApi } from '/entities/post/api/postDetailApi.js';
import { commentApi } from '/entities/post/api/commentApi.js';
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
        // jwtToken에서 authToken으로 변경
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.warn('JWT 토큰이 존재하지 않습니다.');
            return null;
        }
        try {
            const payload = this.parseJwt(token);
            // 백엔드에서는 'sub' 필드에 사용자 ID 저장
            return payload?.sub || null;
        } catch (error) {
            console.error('JWT 토큰 파싱 오류:', error);
            return null;
        }
    }

    /**
     * 게시글 상세 정보 로드 (비동기)
     * @param {string} postId - 게시글 ID
     * @returns {Promise<Object>} 처리 결과
     */
    async loadPostDetail(postId) {
        try {
            const result = await postDetailApi.getPostDetail(postId);
            if (result.success) {
                this.post = result.data;
                // userLiked 필드 사용 (isLiked 대신)
                this.isLiked = result.data.userLiked || false;
                // 조회수 증가 API 호출 제거 (백엔드에서 자동 처리)
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
            const result = await commentApi.getComments(postId);
            if (result.success) {
                // 백엔드 응답 구조를 프론트엔드 구조로 변환
                this.comments = result.data.map(comment => {
                    return {
                        id: comment.commentId,
                        content: comment.content,
                        createdAt: comment.createdAt,
                        updatedAt: comment.updatedAt,
                        author: {
                            id: comment.authorId,
                            nickname: comment.authorNickname,
                            profileImage: comment.authorProfileImg ? 
                                this.convertByteArrayToImageUrl(comment.authorProfileImg) : 
                                '/shared/assets/images/default-profile.svg'
                        }
                    };
                });
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
     * 바이트 배열을 이미지 URL로 변환
     * @param {byte[]} byteArray - 이미지 바이트 배열
     * @returns {string} 이미지 데이터 URL
     */
    convertByteArrayToImageUrl(byteArray) {
        if (!byteArray) return null;
        
        // ArrayBuffer로 변환
        const arrayBuffer = new Uint8Array(byteArray).buffer;
        const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
        
        // Blob URL 생성
        return URL.createObjectURL(blob);
    }

    /**
     * 댓글 작성 후 목록 갱신
     * @param {string} postId - 게시글 ID
     * @param {string} content - 댓글 내용
     * @returns {Promise<Object>} 처리 결과
     */
    async createComment(postId, content) {
        try {
            // commentApi 사용
            const result = await commentApi.createComment(postId, content);
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
            // commentApi 사용 (인자 순서가 다름에 주의)
            const result = await commentApi.updateComment(commentId, content);
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
            // commentApi 사용 (postId는 사용하지 않음)
            const result = await commentApi.deleteComment(commentId);
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
        // authorId 필드 사용 (author.id 대신)
        return this.post.authorId === this.currentUserId;
    }

    /**
     * 댓글 수정 권한 확인
     * @param {string} commentAuthorId - 댓글 작성자 ID
     * @returns {boolean} 수정 권한 여부
     */
    canEditComment(commentAuthorId) {
        if (!this.currentUserId) return false;
        // 문자열과 숫자를 비교할 때는 == 연산자 사용 또는 문자열로 변환
        return String(commentAuthorId) === String(this.currentUserId);
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
