import BaseApi from '/utilities/api/baseApi.js';

/**
 * 게시글 작성 및 수정 관련 API 클래스
 */
export class PostWriteApi extends BaseApi {
    constructor() {
        super('http://localhost:8080');
        this.API_ENDPOINT = '/posts';
    }

    /**
     * 게시글 작성 API 요청 처리
     * @param {Object} postData - 게시글 데이터
     * @param {string} postData.title - 게시글 제목
     * @param {string} postData.content - 게시글 내용
     * @returns {Promise<Object>} API 응답 데이터
     */
    async createPost(postData) {
        return this.authRequest(
            async () => {
                const response = await this.request(this.API_ENDPOINT, {
                    method: 'POST',
                    body: JSON.stringify({
                        title: postData.title,
                        content: postData.content
                    })
                });
                
                return this.formatResponse(
                    response,
                    'post_created',
                    '게시글이 성공적으로 작성되었습니다.'
                );
            },
            '게시글 작성에 실패했습니다.'
        );
    }

    /**
     * 게시글 수정 API 요청 처리
     * @param {string|number} postId - 게시글 ID
     * @param {Object} postData - 게시글 데이터
     * @param {string} postData.title - 게시글 제목
     * @param {string} postData.content - 게시글 내용
     * @returns {Promise<Object>} API 응답 데이터
     */
    async updatePost(postId, postData) {
        return this.authRequest(
            async () => {
                const response = await this.request(`${this.API_ENDPOINT}/${postId}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        title: postData.title,
                        content: postData.content
                    })
                });
                
                return this.formatResponse(
                    response,
                    'post_updated',
                    '게시글이 성공적으로 수정되었습니다.'
                );
            },
            '게시글 수정에 실패했습니다.'
        );
    }

    /**
     * 게시글 삭제 API 요청 처리
     * @param {string|number} postId - 게시글 ID
     * @returns {Promise<Object>} API 응답 데이터
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
                    '게시글이 성공적으로 삭제되었습니다.'
                );
            },
            '게시글 삭제에 실패했습니다.'
        );
    }
}

export const postWriteApi = new PostWriteApi();