import BaseApi from '/entities/BaseApi';

export class PostDetailApi extends BaseApi {
    constructor() {
        super('http://localhost:8080');
        // posts 관련 엔드포인트 설정
        this.API_ENDPOINT = '/posts';
    }

    /**
     * 게시글 상세 정보 조회 API 요청
     * @param {string} postId - 게시글 ID
     * @returns {Promise<Object>} 게시글 상세 정보 결과 (성공 여부, 메시지, 데이터)
     */
    async getPostDetail(postId) {
        try {
            // 조회수 증가를 위한 비동기 요청 (fire-and-forget)
            this.increaseViewCount(postId).catch(err => console.error('조회수 증가 실패:', err));

            // 게시글 상세 정보 조회 요청
            const data = await this.request(`${this.API_ENDPOINT}/${postId}`, {
                method: 'GET',
            });
            return {
                success: true,
                data: data.data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || '게시글을 불러오는데 실패했습니다.',
                data: null,
            };
        }
    }

    /**
     * 게시글 조회수 증가 API 요청
     * @param {string} postId - 게시글 ID
     * @returns {Promise<Object>} 응답 결과 (성공 여부, 메시지, 데이터)
     */
    async increaseViewCount(postId) {
        try {
            // 별도의 엔드포인트로 조회수 증가 요청 (예: /posts/{postId}/view)
            const data = await this.request(`${this.API_ENDPOINT}/${postId}/view`, {
                method: 'POST',
            });
            return {
                success: true,
                data: data.data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || '조회수 증가 실패',
                data: null,
            };
        }
    }

    /**
     * 게시글 댓글 목록 조회 API 요청
     * @param {string} postId - 게시글 ID
     * @returns {Promise<Object>} 댓글 목록 결과 (성공 여부, 메시지, 데이터)
     */
    async getComments(postId) {
        try {
            // 댓글 조회 요청 (GET)
            const data = await this.request(`${this.API_ENDPOINT}/${postId}/comments`, {
                method: 'GET',
            });
            return {
                success: true,
                data: data.data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || '댓글을 불러오는데 실패했습니다.',
                data: null,
            };
        }
    }
}

export const postDetailApi = new PostDetailApi();
