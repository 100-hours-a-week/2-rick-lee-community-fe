import BaseApi from '/entities/BaseApi';

/**
 * 사용자 인증 관련 API 클래스 (로그인, 로그아웃 및 토큰 관리)
 */
class LoginApi extends BaseApi {
  constructor() {
    super('http://localhost:8080');
    // 로컬 스토리지에서 사용할 토큰 키 이름
    this.TOKEN_KEY = 'authToken';
  }

  /**
   * 사용자 로그인을 처리하는 메서드
   * @param {string} email - 사용자 이메일
   * @param {string} password - 사용자 비밀번호
   * @returns {Promise<object>} 로그인 결과 (성공 여부, 메시지, 데이터)
   */
  async login(email, password) {
    try {
      const data = await this.request('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // 로그인 성공 시 토큰 저장 (응답 데이터의 구조에 따라 변경 가능)
      if (data.token) {
        localStorage.setItem(this.TOKEN_KEY, data.token);
      }

      return { success: true, data };
    } catch (error) {
      console.error('로그인 중 오류:', error);
      return { success: false, message: error.message || '로그인 처리 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 사용자 로그아웃 처리 (토큰 삭제)
   */
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * 저장된 인증 토큰을 반환
   * @returns {string|null} 저장된 토큰 또는 null
   */
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * 사용자의 로그인 상태 확인
   * @returns {boolean} 로그인 여부
   */
  isLoggedIn() {
    return !!this.getToken();
  }
}

// LoginApi 클래스의 싱글톤 인스턴스 생성 및 내보내기
export const loginApi = new LoginApi();
