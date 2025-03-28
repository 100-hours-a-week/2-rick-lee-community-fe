import BaseApi from '/utilities/api/baseApi.js';

/**
 * 사용자 인증 관련 API 클래스 (로그인, 로그아웃 및 토큰 관리)
 */
class LoginApi extends BaseApi {
  constructor() {
    super('http://localhost:8080');
  }

  /**
   * 사용자 로그인을 처리하는 메서드
   * @param {string} email - 사용자 이메일
   * @param {string} password - 사용자 비밀번호
   * @returns {Promise<object>} 로그인 결과 (성공 여부, 메시지, 데이터)
   */
  async login(email, password) {
    try {
      // 로그인은 인증이 필요없는 요청
      const response = await this.request('/auth/login', { // 변경: /users/login -> /auth/login
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }, false); // false = 인증 불필요

      // API 명세서에 따른 응답 구조 처리
      return this.formatResponse(
        response,
        'login_success',
        '로그인에 성공했습니다.'
      );
    } catch (error) {
      return this.handleError(error, '로그인 처리 중 오류가 발생했습니다.');
    }
  }

  /**
   * 사용자 로그아웃 처리 - 로컬 스토리지의 사용자 정보 삭제
   */
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
  }

  /**
   * 로그인 성공 시 사용자 정보 저장
   * @param {Object} userData - 사용자 정보
   * @param {string} userData.token - 인증 토큰
   * @param {number|string} userData.user_id - 사용자 ID
   * @param {string} userData.username - 사용자명
   */
  saveUserData(userData) {
    if (userData.token) {
      localStorage.setItem('authToken', userData.token); // 변경: this.TOKEN_KEY -> 'authToken'
    }
    if (userData.user_id) {
      localStorage.setItem(this.USER_ID_KEY, userData.user_id);
    }
    if (userData.username) {
      localStorage.setItem(this.USERNAME_KEY, userData.username);
    }
  }
}

// LoginApi 클래스의 싱글톤 인스턴스 생성 및 내보내기
export const loginApi = new LoginApi();