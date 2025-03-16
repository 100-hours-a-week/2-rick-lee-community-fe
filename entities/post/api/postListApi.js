import BaseApi from 'entities/BaseApi';

export class PostListApi extends BaseApi {
    constructor() {
        super('http://localhost:8080');
        // 게시글 관련 엔드포인트 설정
        this.API_ENDPOINT = '/posts';
    }

    /**
     * 게시글 목록 조회 요청 처리
     * @param {Object} options - 조회 옵션
     * @param {number} options.page - 페이지 번호
     * @param {number} options.limit - 페이지당 게시글 수
     * @param {string} options.sort - 정렬 기준
     * @returns {Promise<Object>} 게시글 목록 조회 결과 (성공 여부, 메시지, 데이터, 페이지 정보)
     */
    async getPosts(options = {}) {
        const { page = 1, limit = 10, sort = 'latest' } = options;
        const queryParams = new URLSearchParams({
        page,
        limit,
        sort,
        }).toString();

        try {
        // BaseApi의 request 메서드로 GET 요청 수행
        const data = await this.request(`${this.API_ENDPOINT}?${queryParams}`, {
            method: 'GET',
        });
        return {
            success: true,
            data: data.data,
            pagination: data.pagination,
        };
        } catch (error) {
        return {
            success: false,
            message: error.message || '네트워크 오류가 발생했습니다.',
            data: null,
        };
        }
    }
}

export const postListApi = new PostListApi();
