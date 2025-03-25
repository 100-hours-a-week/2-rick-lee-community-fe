import BaseApi from '/utilities/api/BaseApi';

/**
 * 게시글 목록 조회 관련 API 클래스
 */
export class PostListApi extends BaseApi {
    constructor() {
        super('http://localhost:8080');
        // 게시글 관련 엔드포인트 설정
        this.API_ENDPOINT = '/posts';
    }

    /**
     * 게시글 목록 조회 요청 처리
     * @param {Object} options - 조회 옵션
     * @param {number} options.page - 페이지 번호 (기본값: 1)
     * @param {number} options.per_page - 페이지당 게시글 수 (기본값: 10)
     * @returns {Promise<Object>} 게시글 목록 조회 결과 (성공 여부, 메시지, 데이터, 페이지 정보)
     */
    async getPosts(options = {}) {
        return this.authRequest(
            async () => {
                // API 명세서에 맞는 파라미터 구성 (page, per_page)
                const { page = 1, per_page = 10 } = options;
                const queryParams = new URLSearchParams({
                    page,
                    per_page
                }).toString();

                const response = await this.request(`${this.API_ENDPOINT}?${queryParams}`, {
                    method: 'GET'
                });

                // API 명세서에 따른 응답 구조 처리
                if (response.message === 'posts_list_retrieved' && response.data) {
                    return {
                        success: true,
                        message: '게시글 목록을 성공적으로 불러왔습니다.',
                        data: response.data.posts,
                        pagination: response.data.pagination
                    };
                } else {
                    throw new Error('응답 형식이 올바르지 않습니다.');
                }
            },
            '게시글 목록을 불러오는데 실패했습니다.'
        );
    }
}

export const postListApi = new PostListApi();