// entities/user/api/signupApi.js
import BaseApi from '/utilities/api/baseApi.js';
import config from '/utilities/config.js';

/**
 * 회원가입 관련 API 클래스
 */
export class SignupApi extends BaseApi {
    constructor() {
        super(config.API_BASE_URL);
    }

    /**
     * 회원가입 요청 처리 메서드 (멀티파트 방식)
     * @param {Object} userData - 사용자 등록 정보
     * @param {File} profileImage - 프로필 이미지 파일 (선택사항)
     * @returns {Promise<Object>} 회원가입 결과
     */
    async register(userData, profileImage = null) {
        try {
            const formData = new FormData();
            
            // 닉네임 통일 (username을 nickname으로 변환)
            const nickname = userData.nickname || userData.username;
            
            // 각 필드를 개별적으로 FormData에 추가 (JSON 문자열로 추가하지 않음)
            formData.append('email', userData.email);
            formData.append('password', userData.password);
            formData.append('nickname', nickname);
            
            // 이미지 파일 추가 (있는 경우)
            if (profileImage && !profileImage.isDefault) {
                formData.append('image', profileImage.file);
            }
            
            // API 요청 설정
            const options = {
                method: 'POST',
                body: formData
            };

            // 현재 백엔드 엔드포인트에 맞춤
            const response = await this.request('/users/signup', options, false);

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