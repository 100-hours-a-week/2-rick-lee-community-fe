import BaseApi from '/utilities/api/baseApi.js';

/**
 * 사용자 프로필 관리 API 클래스
 */
export class ProfileApi extends BaseApi {
    constructor() {
        super('http://localhost:8080');
    }

    /**
     * 프로필 정보 수정 요청 처리
     * @param {Object} profileData - 수정할 프로필 정보
     * @param {string} profileData.username - 사용자명
     * @param {string} profileData.email - 이메일
     * @returns {Promise<Object>} 수정 결과 (성공 여부, 메시지, 데이터)
     */
    async updateProfile(profileData) {
        return this.authRequest(
            async () => {
                const userId = this.getUserId();
                const response = await this.request(`/users/${userId}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        username: profileData.username,
                        email: profileData.email
                    }),
                });

                // 사용자명이 변경된 경우 로컬 스토리지 업데이트
                if (profileData.username !== this.getUsername()) {
                    localStorage.setItem(this.USERNAME_KEY, profileData.username);
                }

                return this.formatResponse(
                    response,
                    'user_updated',
                    '프로필이 성공적으로 수정되었습니다.'
                );
            },
            '프로필 수정 중 오류가 발생했습니다.'
        );
    }

    /**
     * 회원 탈퇴 요청 처리
     * @returns {Promise<Object>} 탈퇴 처리 결과 (성공 여부, 메시지)
     */
    async deleteAccount() {
        return this.authRequest(
            async () => {
                const response = await this.request('/users', {
                    method: 'DELETE'
                });

                // 회원 탈퇴 성공 시 사용자 정보 삭제
                if (response.message === 'user_deleted') {
                    localStorage.removeItem(this.TOKEN_KEY);
                    localStorage.removeItem(this.USER_ID_KEY);
                    localStorage.removeItem(this.USERNAME_KEY);
                }

                return this.formatResponse(
                    response,
                    'user_deleted',
                    '회원 탈퇴가 완료되었습니다.'
                );
            },
            '회원 탈퇴 중 오류가 발생했습니다.'
        );
    }
}

export const profileApi = new ProfileApi();