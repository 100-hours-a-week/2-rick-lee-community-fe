import BaseApi from '/utilities/api/baseApi.js';

/**
 * 비밀번호 변경 관련 API 클래스
 */
export class PasswordChangeApi extends BaseApi {
    constructor() {
        super('http://localhost:8080');
    }

    /**
     * 비밀번호 변경 요청 처리 메서드
     * @param {string} currentPassword - 현재 비밀번호
     * @param {string} newPassword - 새 비밀번호
     * @returns {Promise<Object>} 비밀번호 변경 결과 (성공 여부, 메시지, 데이터)
     */
    async changePassword(currentPassword, newPassword) {
        return this.authRequest(
            async () => {
                const userId = this.getUserId();
                const response = await this.request(`/users/${userId}/password`, {
                    method: 'PUT',
                    body: JSON.stringify({ 
                        current_password: currentPassword,
                        new_password: newPassword 
                    }),
                });

                return this.formatResponse(
                    response,
                    'password_updated',
                    '비밀번호가 성공적으로 변경되었습니다.'
                );
            },
            '비밀번호 변경 중 오류가 발생했습니다.'
        );
    }
}

export const passwordChangeApi = new PasswordChangeApi();