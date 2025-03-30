/**
 * API 요청을 위한 기본 클래스
 * 모든 API 클래스의 부모 클래스로 공통 기능 제공
 */
export default class BaseApi {
    /**
     * BaseApi 생성자
     * @param {string} baseUrl - API 서버의 기본 URL
     */
    constructor(baseUrl) {
      this.baseUrl = baseUrl;
      this.TOKEN_KEY = 'authToken';
      this.USER_ID_KEY = 'userId';
      this.USERNAME_KEY = 'username';
    }
  
    /**
     * 기본 HTTP 헤더를 반환하는 메서드
     * @returns {Object} 기본 HTTP 헤더
     */
    getDefaultHeaders() {
      return {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
    }
  
    /**
     * 저장된 인증 토큰을 반환
     * @returns {string|null} 저장된 토큰 또는 null
     */
    getToken() {
      return localStorage.getItem(this.TOKEN_KEY);
    }
  
    /**
     * 저장된 사용자 ID를 반환
     * @returns {string|null} 저장된 사용자 ID 또는 null
     */
    getUserId() {
      return localStorage.getItem(this.USER_ID_KEY);
    }
  
    /**
     * 저장된 사용자명을 반환
     * @returns {string|null} 저장된 사용자명 또는 null
     */
    getUsername() {
      return localStorage.getItem(this.USERNAME_KEY);
    }
  
    /**
     * 인증 헤더 생성
     * @returns {Object} 인증 헤더 객체
     */
    getAuthHeader() {
      const token = this.getToken();
      return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
  
    /**
     * 사용자의 로그인 상태 확인
     * @returns {boolean} 로그인 여부
     */
    isLoggedIn() {
      return !!this.getToken();
    }
  
    /**
     * 인증이 필요한 요청인지 확인하고 필요한 경우 로그인 오류 반환
     * @returns {Object|null} 로그인이 필요한 경우 오류 객체, 그렇지 않으면 null
     */
    checkAuth() {
      if (!this.isLoggedIn()) {
        return {
          success: false,
          message: '로그인이 필요합니다.'
        };
      }
      return null;
    }
  
    /**
     * API 응답을 표준 형식으로 변환
     * @param {Object} response - API 응답 객체
     * @param {string} expectedMessage - 기대하는 응답 메시지
     * @param {string} successMessage - 성공 시 반환할 메시지
     * @returns {Object} 표준화된 응답 객체
     */
    formatResponse(response, expectedMessage, successMessage) {
      if (response.message === expectedMessage) {
        return {
          success: true,
          message: successMessage,
          data: response.data
        };
      }
      throw new Error('응답 형식이 올바르지 않습니다.');
    }
  
    /**
     * 에러 처리 및 표준 오류 응답 생성
     * @param {Error} error - 발생한 오류
     * @param {string} defaultMessage - 기본 오류 메시지
     * @returns {Object} 표준화된 오류 응답 객체
     */
    handleError(error, defaultMessage) {
      console.error('API 오류:', error);
      
      if (error.response && error.response.message) {
        return {
          success: false,
          message: error.response.message,
          error: error.response.error
        };
      }
      
      return {
        success: false,
        message: error.message || defaultMessage
      };
    }
  
    /**
     * API 요청을 수행하는 공통 메서드
     * @param {string} endpoint - API 엔드포인트 경로
     * @param {Object} options - fetch 함수에 전달할 옵션
     * @param {boolean} requiresAuth - 인증이 필요한지 여부
     * @returns {Promise<any>} API 응답 데이터
     */
    async request(endpoint, options = {}, requiresAuth = true) {
      // 인증이 필요하고 로그인 상태가 아닌 경우
      if (requiresAuth) {
        const authError = this.checkAuth();
        if (authError) {
          return Promise.reject(authError);
        }
  
        // 인증 헤더 추가
        options.headers = {
          ...this.getDefaultHeaders(),
          ...this.getAuthHeader(),
          ...(options.headers || {})
        };
      } else {
        // 인증이 필요 없는 경우 기본 헤더만 설정
        options.headers = {
          ...this.getDefaultHeaders(),
          ...(options.headers || {})
        };
      }
      
      // FormData를 사용하는 경우 Content-Type 헤더 제거
      if (options.body instanceof FormData) {
        delete options.headers['Content-Type'];
      }
      
      const url = this.baseUrl + endpoint;
      
      try {
        const response = await fetch(url, options);
        
        // 응답 본문을 JSON으로 파싱
        const data = await response.json();
        
        // 응답 상태 코드가 성공(2xx)이 아닌 경우 에러 처리
        if (!response.ok) {
          const error = new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
          error.response = data;
          error.status = response.status;
          throw error;
        }
        
        return data;
      } catch (error) {
        // 네트워크 오류 또는 JSON 파싱 오류 처리
        if (!error.response) {
          console.error('API 요청 오류:', error);
          error.message = '네트워크 연결 오류가 발생했습니다.';
        }
        throw error;
      }
    }
  
    /**
     * 인증이 필요한 API 요청을 감싸는 헬퍼 메서드
     * @param {Function} apiCall - API 호출 함수
     * @param {string} defaultErrorMessage - 기본 오류 메시지
     * @returns {Promise<Object>} 표준화된 응답 객체
     */
    async authRequest(apiCall, defaultErrorMessage) {
      // 로그인 상태 확인
      const authError = this.checkAuth();
      if (authError) {
        return authError;
      }
  
      try {
        return await apiCall();
      } catch (error) {
        return this.handleError(error, defaultErrorMessage);
      }
    }
  }