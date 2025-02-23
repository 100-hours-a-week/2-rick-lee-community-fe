// features/auth/api/signupApi.js

/**
 * 회원가입 API 클래스
 * 회원가입 요청 처리를 담당
 */
export class SignupApi {
    constructor() {
        this.API_BASE_URL = 'https://api.example.com';
    }

    /**
     * 회원가입 요청 처리
     * @param {Object} userData - 사용자 등록 정보
     * @param {string} userData.email - 이메일
     * @param {string} userData.password - 비밀번호
     * @param {string} userData.nickname - 닉네임
     * @param {string} [userData.profile_image] - 프로필 이미지 URL (선택)
     * @returns {Promise<Object>} 회원가입 결과
     */
    async register(userData) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/users/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            switch (response.status) {
                case 201:
                    return {
                        success: true,
                        data: data.data,
                        message: '회원가입이 완료되었습니다.'
                    };
                case 400:
                    return {
                        success: false,
                        message: '입력 정보를 확인해주세요.'
                    };
                case 500:
                    return {
                        success: false,
                        message: '서버 오류가 발생했습니다.'
                    };
                default:
                    return {
                        success: false,
                        message: '알 수 없는 오류가 발생했습니다.'
                    };
            }
        } catch (error) {
            console.error('회원가입 요청 중 오류:', error);
            return {
                success: false,
                message: '네트워크 오류가 발생했습니다.'
            };
        }
    }
}

export const signupApi = new SignupApi();