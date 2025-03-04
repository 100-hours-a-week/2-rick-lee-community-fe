// entities/user/api/userApi.js

/**
 * 사용자 인증 관련 API 통신을 담당하는 클래스
 * 로그인, 로그아웃 및 토큰 관리 기능을 제공
 */
class LoginApi {
    constructor() {
        // API 기본 URL 설정
        this.API_BASE_URL = 'http://localhost:5500';
        // 로컬 스토리지에서 사용할 토큰 키 이름
        this.TOKEN_KEY = 'authToken';
    }

    /**
     * API 요청을 보내고 응답을 처리하는 private 메서드
     * @param {string} endpoint - API 엔드포인트 경로
     * @param {object} options - fetch 옵션 (메서드, 헤더, 바디 등)
     * @returns {Promise<object>} API 응답 결과
     * @private
     */
    async #fetchAPI(endpoint, options = {}) {
        try {
            // API 요청 전송
            const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                }
            });

            const data = await response.json();

            // HTTP 상태 코드별 응답 처리
            switch (response.status) {
                case 200:
                    return { success: true, ...data };
                case 400:
                    return { success: false, message: '잘못된 요청입니다.' };
                case 401:
                    return { success: false, message: '이메일 또는 비밀번호가 일치하지 않습니다.' };
                case 500:
                    return { success: false, message: '서버 오류가 발생했습니다.' };
                default:
                    return { success: false, message: '알 수 없는 오류가 발생했습니다.' };
            }
        } catch (error) {
            console.error('API 요청 중 오류:', error);
            return { success: false, message: '네트워크 오류가 발생했습니다.' };
        }
    }

    /**
     * 사용자 로그인을 처리하는 메서드
     * @param {string} email - 사용자 이메일
     * @param {string} password - 사용자 비밀번호
     * @returns {Promise<object>} 로그인 결과 (성공 여부, 메시지, 토큰 등)
     */
    async login(email, password) {
        try {
            // 로그인 API 호출
            const response = await this.#fetchAPI('/users/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            // 로그인 성공시 토큰 저장
            if (response.success && response.data.token) {
                localStorage.setItem(this.TOKEN_KEY, response.data.token);
            }

            return response;
        } catch (error) {
            console.error('로그인 중 오류:', error);
            return { success: false, message: '로그인 처리 중 오류가 발생했습니다.' };
        }
    }

    /**
     * 사용자 로그아웃을 처리하는 메서드
     * 로컬 스토리지에서 토큰을 제거
     */
    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
    }

    /**
     * 저장된 인증 토큰을 반환하는 메서드
     * @returns {string|null} 저장된 토큰 또는 null
     */
    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * 사용자의 로그인 상태를 확인하는 메서드
     * @returns {boolean} 로그인 여부
     */
    isLoggedIn() {
        return !!this.getToken();
    }
}

// UserApi 클래스의 싱글톤 인스턴스 생성 및 내보내기
export const loginApi = new LoginApi();