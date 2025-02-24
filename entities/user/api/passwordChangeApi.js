// entities/user/api/passwordChangeApi.js

/**
 * 비밀번호 변경 API 클래스
 * 비밀번호 변경 요청 처리를 담당
 */
export class PasswordChangeApi {
    constructor() {
        this.API_BASE_URL = 'https://api.example.com';
    }

    /**
     * 비밀번호 변경 요청 처리
     * @param {Object} passwordData - 비밀번호 변경 데이터
     * @param {string} passwordData.newPassword - 새 비밀번호
     * @returns {Promise<Object>} 비밀번호 변경 결과
     */
    async changePassword(passwordData) {
        try {
            const token = localStorage.getItem('jwt');
            if (!token) {
                return {
                    success: false,
                    message: '로그인이 필요합니다.'
                };
            }

            const response = await fetch(`${this.API_BASE_URL}/users/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    new_password: passwordData.newPassword
                })
            });

            const data = await response.json();

            switch (response.status) {
                case 200:
                    return {
                        success: true,
                        message: '비밀번호가 성공적으로 변경되었습니다.'
                    };
                case 400:
                    return {
                        success: false,
                        message: '유효하지 않은 비밀번호 형식입니다.'
                    };
                case 401:
                    return {
                        success: false,
                        message: '로그인이 필요합니다.'
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
            console.error('비밀번호 변경 요청 중 오류:', error);
            return {
                success: false,
                message: '네트워크 오류가 발생했습니다.'
            };
        }
    }
}

export const passwordChangeApi = new PasswordChangeApi();