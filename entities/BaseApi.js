/**
 * 공통 API 요청 처리 클래스
 */
class BaseApi {
    /**
     * @param {string} baseURL - API 기본 URL, 기본값은 빈 문자열 (상대 경로 사용)
     */
    constructor(baseURL = 'localhost:8080') {
    this.baseURL = baseURL;
    }

    /**
     * 공통 API 요청 메서드
     * @param {string} endpoint - API 엔드포인트 경로
     * @param {object} options - fetch 옵션 (메서드, 헤더, 바디 등)
     * @returns {Promise<object>} 응답 데이터
     */
    async request(endpoint, options = {}) {
    // 기본 헤더 설정 (토큰이 존재하면 Authorization 헤더 추가)
    const token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
        });
        const data = await response.json();

        if (!response.ok) {
        let errorMessage;
        switch (response.status) {
            case 400:
            errorMessage = '잘못된 요청입니다.';
            break;
            case 401:
            errorMessage = '인증에 실패했습니다.';
            break;
            case 500:
            errorMessage = '서버 오류가 발생했습니다.';
            break;
            default:
            errorMessage = '알 수 없는 오류가 발생했습니다.';
        }
        throw new Error(errorMessage);
        }
        return data;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
    }
    }
}