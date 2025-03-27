import BaseApi from '/utilities/api/baseApi.js';

/**
 * 댓글 관련 API 클래스
 */
export class CommentApi extends BaseApi {
    constructor() {
        super('http://localhost:8080');
        this.COMMENTS_ENDPOINT = '/comments';
        this.POSTS_ENDPOINT = '/posts';
    }

    /**
     * 게시글의 댓글 목록 조회 API 요청
     * @param {string|number} postId - 게시글 ID
     * @returns {Promise<Object>} 댓글 목록 결과 (성공 여부, 메시지, 데이터)
     */
    async getComments(postId) {
        return this.authRequest(
            async () => {
                const response = await this.request(`${this.POSTS_ENDPOINT}/${postId}/comments`, {
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
     * 댓글 작성 API 요청
     * @param {string|number} postId - 게시글 ID
     * @param {string} content - 댓글 내용
     * @returns {Promise<Object>} 댓글 작성 결과 (성공 여부, 메시지, 데이터)
     */
    async createComment(postId, content) {
        return this.authRequest(
            async () => {
                const response = await this.request(`${this.COMMENTS_ENDPOINT}`, {
                    method: 'POST',
                    body: JSON.stringify({
                        postId: postId,
                        content: content
                    })
                });
                
                return this.formatResponse(
                    response,
                    'comment_created',
                    '댓글을 성공적으로 작성했습니다.'
                );
            },
            '댓글 작성에 실패했습니다.'
        );
    }

    /**
     * 댓글 수정 API 요청
     * @param {string|number} commentId - 댓글 ID
     * @param {string} content - 수정할 댓글 내용
     * @returns {Promise<Object>} 댓글 수정 결과 (성공 여부, 메시지, 데이터)
     */
    async updateComment(commentId, content) {
        return this.authRequest(
            async () => {
                const response = await this.request(`${this.COMMENTS_ENDPOINT}/${commentId}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        content: content
                    })
                });
                
                return this.formatResponse(
                    response,
                    'comment_updated',
                    '댓글을 성공적으로 수정했습니다.'
                );
            },
            '댓글 수정에 실패했습니다.'
        );
    }

    /**
     * 댓글 삭제 API 요청
     * @param {string|number} commentId - 댓글 ID
     * @returns {Promise<Object>} 댓글 삭제 결과 (성공 여부, 메시지, 데이터)
     */
    async deleteComment(commentId) {
        return this.authRequest(
            async () => {
                const response = await this.request(`${this.COMMENTS_ENDPOINT}/${commentId}`, {
                    method: 'DELETE'
                });
                
                return this.formatResponse(
                    response,
                    'comment_deleted',
                    '댓글을 성공적으로 삭제했습니다.'
                );
            },
            '댓글 삭제에 실패했습니다.'
        );
    }
}

export const commentApi = new CommentApi();