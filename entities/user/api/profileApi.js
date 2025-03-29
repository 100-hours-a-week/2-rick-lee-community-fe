import BaseApi from '/utilities/api/baseApi.js';

/**
 * 사용자 프로필 관리 API 클래스
 */
export class ProfileApi extends BaseApi {
    constructor() {
        super('http://localhost:8080');
    }
    /**
     * 프로필 정보 조회 요청 처리
     * @returns {Promise<Object>} 조회 결과 (성공 여부, 메시지, 데이터)
     */
    async getProfile() {
        return this.authRequest(
            async () => {
                const userId = this.getUserId();
                const response = await this.request(`/users/${userId}`, {
                    method: 'GET'
                });
                
                return this.formatResponse(
                    response,
                    'user_found',
                    '프로필 정보를 성공적으로 불러왔습니다.'
                );
            },
            '프로필 정보 조회 중 오류가 발생했습니다.'
        );
    }

    /**
     * 닉네임 중복 확인 요청 처리
     * @param {string} nickname - 확인할 닉네임
     * @returns {Promise<Object>} 중복 확인 결과 (성공 여부, 메시지, 데이터)
     */
    async checkNickname(nickname) {
        return this.authRequest(  // authRequest 메소드로 변경 (인증 토큰 자동 첨부)
            async () => {
                const response = await this.request(`/users/check-nickname?nickname=${encodeURIComponent(nickname)}`, {
                    method: 'GET'
                });
                
                return this.formatResponse(
                    response, 
                    'nickname_available',
                    '사용 가능한 닉네임입니다.'
                );
            },
            '닉네임 중복 확인 중 오류가 발생했습니다.'
        );
    }

    /**
     * 프로필 정보 수정 요청 처리
     * @param {Object} profileData - 수정할 프로필 정보
     * @param {string} profileData.nickname - 사용자 닉네임
     * @param {File|null} profileData.profileImg - 프로필 이미지
     * @returns {Promise<Object>} 수정 결과 (성공 여부, 메시지, 데이터)
     */
    async updateProfile(profileData) {
        return this.authRequest(
            async () => {
                const userId = this.getUserId();
                const response = await this.request(`/users/${userId}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        nickname: profileData.nickname,
                        profileImg: profileData.profileImg
                    }),
                });

                // 닉네임이 변경된 경우 로컬 스토리지 업데이트
                if (profileData.nickname !== this.getUsername()) {
                    localStorage.setItem(this.USERNAME_KEY, profileData.nickname);
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
                // 현재 백엔드는 /users DELETE에 userId를 경로에 포함하지 않음
                const response = await this.request('/users', {
                    method: 'DELETE'
                });

                // 회원 탈퇴 성공 시 사용자 정보 삭제
                if (response.message === 'user_deleted') {
                    localStorage.removeItem('authToken');
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