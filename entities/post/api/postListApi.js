// entities/post/api/postListApi.js

/**
 * 게시글 목록 API 클래스
 * 게시글 데이터 요청 처리를 담당
 */
export class PostListApi {
    constructor() {
        this.API_BASE_URL = 'https://api.example.com';
    }

    /**
     * 게시글 목록 조회 요청
     * @param {Object} options - 조회 옵션
     * @param {number} options.page - 페이지 번호
     * @param {number} options.limit - 페이지당 게시글 수
     * @param {string} options.sort - 정렬 기준
     * @returns {Promise<Object>} 게시글 목록 조회 결과
     */
    async getPosts(options = {}) {
        try {
            const { page = 1, limit = 10, sort = 'latest' } = options;
            
            const queryParams = new URLSearchParams({
                page,
                limit,
                sort
            }).toString();

            const response = await fetch(`${this.API_BASE_URL}/posts?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || '게시글을 불러오는데 실패했습니다.',
                    data: null
                };
            }

            return {
                success: true,
                data: data.data,
                pagination: data.pagination
            };
        } catch (error) {
            console.error('게시글 목록 조회 중 오류:', error);
            return {
                success: false,
                message: '네트워크 오류가 발생했습니다.',
                data: null
            };
        }
    }
}

export const postListApi = new PostListApi();