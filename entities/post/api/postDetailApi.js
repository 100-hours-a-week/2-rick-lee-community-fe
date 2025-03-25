import BaseApi from '/utilities/api/BaseApi';

/**
 * 게시글 상세 정보 관련 API 클래스
 */
export class PostDetailApi extends BaseApi {
    constructor() {
        super('http://localhost:8080');
        // posts 관련 엔드포인트 설정
        this.API_ENDPOINT = '/posts';
    }

    /**
     * 게시글 상세 정보 조회 API 요청
     * @param {string|number} postId - 게시글 ID
     * @returns {Promise<Object>} 게시글 상세 정보 결과 (성공 여부, 메시지, 데이터)
     */
    async getPostDetail(postId) {
        return this.authRequest(
            async () => {
                const response = await this.request(`${this.API_ENDPOINT}/${postId}`, {
                    method: 'GET'
                });
                
                return this.formatResponse(
                    response,
                    'post_fetched',
                    '게시글을 성공적으로 불러왔습니다.'
                );
            },
            '게시글을 불러오는데 실패했습니다.'
        );
    }

    /**
     * 게시글 댓글 목록 조회 API 요청
     * @param {string|number} postId - 게시글 ID
     * @returns {Promise<Object>} 댓글 목록 결과 (성공 여부, 메시지, 데이터)
     */
    async getComments(postId) {
        return this.authRequest(
            async () => {
                const response = await this.request(`${this.API_ENDPOINT}/${postId}/comments`, {
                    method: 'GET'
                });
                
                return this.formatResponse(
                    response,
                    'comments_retrieved',
                    '댓글을 성공적으로 불러왔습니다.'
                );
            },
            '댓글을 불러오는데 실패했습니다.'
        );
    }

    /**
     * 게시글 좋아요 추가/취소 요청
     * @param {string|number} postId - 게시글 ID
     * @param {boolean} isLiked - 현재 좋아요 상태 (true: 좋아요 취소, false: 좋아요 추가)
     * @returns {Promise<Object>} 좋아요 처리 결과 (성공 여부, 메시지, 데이터)
     */
    async toggleLike(postId, isLiked) {
        return this.authRequest(
            async () => {
                // 현재 좋아요 상태에 따라 HTTP 메서드 결정 (true면 DELETE, false면 POST)
                const method = isLiked ? 'DELETE' : 'POST';
                const response = await this.request(`${this.API_ENDPOINT}/${postId}/like`, {
                    method
                });
                
                const expectedMessage = isLiked ? 'like_removed' : 'like_created';
                const successMessage = isLiked ? '좋아요가 취소되었습니다.' : '좋아요가 추가되었습니다.';
                
                return this.formatResponse(
                    response,
                    expectedMessage,
                    successMessage
                );
            },
            '좋아요 처리 중 오류가 발생했습니다.'
        );
    }
}

export const postDetailApi = new PostDetailApi();