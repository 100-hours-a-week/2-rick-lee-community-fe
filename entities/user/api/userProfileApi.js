import BaseApi from '/entities/BaseApi';

export class ProfileModifyApi extends BaseApi {
    constructor() {
        super('http://localhost:8080');
    }

    /**
     * 프로필 정보 수정 요청 처리
     * @param {Object} profileData - 수정할 프로필 정보
     * @param {string} profileData.nickname - 닉네임
     * @param {File} [profileData.profile_image] - 프로필 이미지 파일 (선택)
     * @returns {Promise<Object>} 수정 결과 (성공 여부, 메시지, 데이터)
     */
    async updateProfile(profileData) {
        // 토큰 유무 확인
        const token = localStorage.getItem('authToken');
        if (!token) {
        return { success: false, message: '로그인이 필요합니다.' };
        }

        // FormData 생성 (파일 업로드이므로 JSON 헤더는 제거)
        const formData = new FormData();
        formData.append('nickname', profileData.nickname);
        if (profileData.profile_image) {
        formData.append('profile_image', profileData.profile_image);
        }

        try {
        // BaseApi의 request 메서드를 사용할 때, body가 FormData인 경우
        // Content-Type 헤더는 자동으로 처리되므로 헤더 옵션은 빈 객체로 전달합니다.
        const data = await this.request('/users', {
            method: 'PUT',
            body: formData,
            headers: {} // FormData 사용 시 'Content-Type' 헤더는 생략
        });
        return {
            success: true,
            data: data.data,
            message: '프로필이 수정되었습니다.'
        };
        } catch (error) {
        return {
            success: false,
            message: error.message || '네트워크 오류가 발생했습니다.'
        };
        }
    }

    /**
     * 회원 탈퇴 요청 처리
     * @returns {Promise<Object>} 탈퇴 처리 결과 (성공 여부, 메시지)
     */
    async deleteAccount() {
        // 토큰 유무 확인
        const token = localStorage.getItem('authToken');
        if (!token) {
        return { success: false, message: '로그인이 필요합니다.' };
        }

        try {
        // DELETE 요청은 JSON 형식이므로 BaseApi의 기본 헤더를 그대로 사용
        await this.request('/users', {
            method: 'DELETE'
        });
        return {
            success: true,
            message: '회원 탈퇴가 완료되었습니다.'
        };
        } catch (error) {
        return {
            success: false,
            message: error.message || '네트워크 오류가 발생했습니다.'
        };
        }
    }
}

export const profileModifyApi = new ProfileModifyApi();
