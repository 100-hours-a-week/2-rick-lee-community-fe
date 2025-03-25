import BaseApi from '/utilities/api/BaseApi';

/**
 * 회원가입 관련 API 클래스
 */
export class SignupApi extends BaseApi {
    constructor() {
        super('http://localhost:8080');
    }

    /**
     * 회원가입 요청 처리 메서드
     * @param {Object} userData - 사용자 등록 정보
     * @param {string} userData.username - 사용자명
     * @param {string} userData.email - 이메일
     * @param {string} userData.password - 비밀번호
     * @returns {Promise<Object>} 회원가입 결과 (성공 여부, 메시지, 데이터)
     */
    async register(userData) {
        try {
            // 회원가입은 인증이 필요 없는 요청
            const response = await this.request('/users/signup', {
                method: 'POST',
                body: JSON.stringify(userData),
            }, false); // false = 인증 불필요

            return this.formatResponse(
                response,
                'register_success',
                '회원가입이 완료되었습니다.'
            );
        } catch (error) {
            return this.handleError(error, '회원가입 처리 중 오류가 발생했습니다.');
        }
    }
}

export const signupApi = new SignupApi();