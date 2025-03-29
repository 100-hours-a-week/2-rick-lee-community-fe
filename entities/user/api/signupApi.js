import BaseApi from '/utilities/api/baseApi.js';

/**
 * 회원가입 관련 API 클래스
 */
export class SignupApi extends BaseApi {
    constructor() {
        super('http://localhost:8080');
    }

    /**
     * 회원가입 요청 처리 메서드
     * @param {FormData|Object} userData - 사용자 등록 정보 (FormData 또는 일반 객체)
     * @returns {Promise<Object>} 회원가입 결과 (성공 여부, 메시지, 데이터)
     */
    async register(userData) {
        try {
            let requestData;
            let options = {
                method: 'POST'
            };

            // FormData 객체인 경우 JSON 형식으로 변환
            if (userData instanceof FormData) {
                const email = userData.get('email');
                const password = userData.get('password');
                const nickname = userData.get('username'); // username을 nickname으로 변환
                const profileImage = userData.get('profile_image'); // 이미지 파일

                requestData = {
                    email,
                    password,
                    nickname,
                    profileImg: null // 기본값으로 null 설정
                };

                options.body = JSON.stringify(requestData);
                options.headers = {
                    ...this.getDefaultHeaders(),
                    'Content-Type': 'application/json;charset=UTF-8'
                };
            } else {
                requestData = {
                    email: userData.email,
                    password: userData.password,
                    nickname: userData.username || userData.nickname,
                    profileImg: null // 기본값으로 null 설정
                };
                
                options.body = JSON.stringify(requestData);
                options.headers = {
                    ...this.getDefaultHeaders(),
                    'Content-Type': 'application/json;charset=UTF-8'
                };
            }

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