import BaseApi from 'entities/BaseApi';

export class SignupApi extends BaseApi {
    constructor() {
        super('http://localhost:8080');
    }

    /**
     * 회원가입 요청 처리 메서드
     * @param {Object} userData - 사용자 등록 정보
     * @param {string} userData.email - 이메일
     * @param {string} userData.password - 비밀번호
     * @param {string} userData.nickname - 닉네임
     * @param {string} [userData.profile_image] - 프로필 이미지 URL (선택)
     * @returns {Promise<Object>} 회원가입 결과 (성공 여부, 메시지, 데이터)
     */
    async register(userData) {
        try {
        // BaseApi의 공통 request 메서드를 사용하여 API 요청
        const data = await this.request('/users/signup', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        return {
            success: true,
            data: data.data,
            message: '회원가입이 완료되었습니다.',
        };
        } catch (error) {
        return {
            success: false,
            message: error.message || '네트워크 오류가 발생했습니다.',
        };
        }
    }
}

export const signupApi = new SignupApi();
