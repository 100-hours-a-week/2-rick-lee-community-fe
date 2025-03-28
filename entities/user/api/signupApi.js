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
                // FormData에서 값 추출
                const email = userData.get('email');
                const password = userData.get('password');
                const nickname = userData.get('username'); // username을 nickname으로 변환
                const profileImage = userData.get('profile_image'); // 이미지 파일

                // JSON 형식으로 요청 데이터 구성
                requestData = {
                    email,
                    password,
                    nickname,
                    profileImg: null // 기본값으로 null 설정
                };

                // 이미지 파일이 있는 경우 별도 처리 필요
                // 현재 백엔드가 JSON으로 이미지를 받는 것으로 보이지 않으므로
                // 이미지는 별도 API로 처리해야 할 수 있음
                // TODO: 이미지 업로드 로직은 백엔드와 협의 필요

                options.body = JSON.stringify(requestData);
                options.headers = {
                    ...this.getDefaultHeaders(),
                    'Content-Type': 'application/json;charset=UTF-8'
                };
            } else {
                // 일반 객체인 경우 필드명 매핑 후 JSON으로 변환
                requestData = {
                    email: userData.email,
                    password: userData.password,
                    nickname: userData.username || userData.nickname, // username 또는 nickname 사용
                    profileImg: null // 기본값으로 null 설정
                };

                // profileImage 데이터가 있는 경우 처리
                // 현재 백엔드에서는 JSON으로 이미지를 받지 않는 것으로 가정
                
                options.body = JSON.stringify(requestData);
                options.headers = {
                    ...this.getDefaultHeaders(),
                    'Content-Type': 'application/json;charset=UTF-8'
                };
            }

            // 회원가입은 인증이 필요 없는 요청
            const response = await this.request('/users', options, false); // 변경: /users/signup -> /users

            return this.formatResponse(
                response,
                'user_created', // 변경: register_success -> user_created
                '회원가입이 완료되었습니다.'
            );
        } catch (error) {
            return this.handleError(error, '회원가입 처리 중 오류가 발생했습니다.');
        }
    }
}

export const signupApi = new SignupApi();