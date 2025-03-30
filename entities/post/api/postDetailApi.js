import BaseApi from '/utilities/api/baseApi.js';

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
     * 게시글 삭제 API 요청
     * @param {string|number} postId - 게시글 ID
     * @returns {Promise<Object>} 게시글 삭제 결과 (성공 여부, 메시지, 데이터)
     */
    async deletePost(postId) {
        return this.authRequest(
            async () => {
                const response = await this.request(`${this.API_ENDPOINT}/${postId}`, {
                    method: 'DELETE'
                });
                
                return this.formatResponse(
                    response,
                    'post_deleted',
                    '게시글을 성공적으로 삭제했습니다.'
                );
            },
            '게시글 삭제에 실패했습니다.'
        );
    }

    /**
     * 게시글 좋아요 추가 요청
     * @param {string|number} postId - 게시글 ID
     * @returns {Promise<Object>} 좋아요 추가 결과
     */
    async addLike(postId) {
        return this.authRequest(
            async () => {
                const response = await this.request(`${this.API_ENDPOINT}/${postId}/like`, {
                    method: 'POST'
                });
                
                return this.formatResponse(
                    response,
                    'like_created',
                    '좋아요가 추가되었습니다.'
                );
            },
            '좋아요 추가 중 오류가 발생했습니다.'
        );
    }

    /**
     * 게시글 좋아요 취소 요청
     * @param {string|number} postId - 게시글 ID
     * @returns {Promise<Object>} 좋아요 취소 결과
     */
    async removeLike(postId) {
        return this.authRequest(
            async () => {
                const response = await this.request(`${this.API_ENDPOINT}/${postId}/like`, {
                    method: 'DELETE'
                });
                
                return this.formatResponse(
                    response,
                    'like_removed',
                    '좋아요가 취소되었습니다.'
                );
            },
            '좋아요 취소 중 오류가 발생했습니다.'
        );
    }
}

export const postDetailApi = new PostDetailApi();