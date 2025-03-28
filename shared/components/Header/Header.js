// shared/components/Header/Header.js

import { JwtDecoder } from '/utilities/jwtDecoder.js';

/**
 * Header 클래스
 * 웹 애플리케이션의 공통 헤더를 관리
 * 
 * 주요 기능:
 * - 헤더 UI 초기화 및 렌더링
 * - 프로필 드롭다운 메뉴 관리
 * - 인증 상태에 따른 UI 업데이트
 * - 네비게이션 처리
 */
export class Header {
    /**
     * @param {string} containerId - 헤더가 마운트될 컨테이너의 ID
     */
    constructor(containerId) {
        this.containerId = containerId;
        this.elements = {};
        this.state = {
            isInitialized: false,
            isDropdownVisible: false,
            error: null
        };
        this.jwtDecoder = new JwtDecoder(); // JwtDecoder 인스턴스 추가
        this.initialize();
    }

    /**
     * 헤더 컴포넌트 초기화
     * @private
     */
    async initialize() {
        try {
            await this.loadDependencies();
            await this.loadHeader();
            this.cacheElements();
            this.bindEvents();
            this.updateUI();
            this.state.isInitialized = true;
        } catch (error) {
            this.state.error = error;
            this.handleError('Header initialization failed', error);
        }
    }

    /**
     * 스타일시트 의존성 로드
     * @private
     */
    async loadDependencies() {
        const styleUrl = '/shared/components/Header/styles.css';
        if (!document.querySelector(`link[href="${styleUrl}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = styleUrl;
            document.head.appendChild(link);
        }
    }

    /**
     * 헤더 HTML 템플릿 로드
     * @private
     */
    async loadHeader() {
        try {
            const response = await fetch('/shared/components/Header/header.html');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const html = await response.text();
            document.getElementById(this.containerId).innerHTML = html;
        } catch (error) {
            throw new Error('Failed to load header content: ' + error.message);
        }
    }

    /**
     * DOM 요소 캐싱
     * @private
     * @throws {Error} 필수 DOM 요소가 없을 경우
     */
    cacheElements() {
        const elements = {
            container: document.getElementById(this.containerId),
            backButton: document.getElementById('backButton'),
            profileContainer: document.getElementById('profile-container'),
            profileImageContainer: document.getElementById('profileImage'), // 이미지 컨테이너
            profileImageElement: document.getElementById('userProfileImage'), // 실제 이미지 요소
            profileDropdown: document.getElementById('profileDropdown'),
            editProfile: document.getElementById('editProfile'),
            editPassword: document.getElementById('editPassword'),
            logout: document.getElementById('logout')
        };

        Object.entries(elements).forEach(([key, element]) => {
            if (!element) {
                throw new Error(`Required element "${key}" not found`);
            }
        });

        this.elements = elements;
    }

    /**
     * 이벤트 리스너 바인딩
     * @private
     */
    bindEvents() {
        this.elements.backButton?.addEventListener('click', this.handleBackNavigation.bind(this));
        this.elements.profileImageContainer?.addEventListener('click', this.handleProfileClick.bind(this));
        document.addEventListener('click', this.handleOutsideClick.bind(this));
        
        this.elements.editProfile?.addEventListener('click', () => this.navigate('/pages/profile/modify/index.html'));
        this.elements.editPassword?.addEventListener('click', () => this.navigate('/pages/profile/changePasswd/index.html'));
        this.elements.logout?.addEventListener('click', this.handleLogout.bind(this));
    }

    /**
     * UI 상태 업데이트
     * @private
     */
    updateUI() {
        this.updateProfileVisibility();
        this.updateProfileImage();
    }

    /**
     * JWT 토큰 존재 여부에 따른 프로필 표시 처리
     * @private
     */
    updateProfileVisibility() {
        // 'jwt' -> 'authToken' 변경
        const token = localStorage.getItem('authToken');
        if (this.elements.profileContainer) {
            this.elements.profileContainer.style.display = token ? 'block' : 'none';
        }
    }

    /**
     * 사용자 프로필 이미지 업데이트
     * @private
     */
    updateProfileImage() {
        // 'jwt' -> 'authToken' 변경
        const token = localStorage.getItem('authToken');
        const DEFAULT_PROFILE_IMAGE = '/shared/assets/images/default-profile.svg';
        
        if (this.elements.profileImageElement) {
            if (token) {
                // JWT 토큰이 있는 경우, API에서 프로필 이미지 URL 가져오기
                this.fetchProfileImage();
            } else {
                this.elements.profileImageElement.src = DEFAULT_PROFILE_IMAGE;
            }
            
            // 이미지 요소가 항상 보이도록 스타일 적용
            this.elements.profileImageElement.style.display = 'block';
            this.elements.profileImageElement.style.width = '100%';
            this.elements.profileImageElement.style.height = '100%';
            
            // 컨테이너도 표시 확인
            if (this.elements.profileImageContainer) {
                this.elements.profileImageContainer.style.display = 'block';
            }
        }
    }

    /**
     * API에서 프로필 이미지 URL 가져오기
     * @private
     */
    async fetchProfileImage() {
        try {
            // 'jwt' -> 'authToken' 변경
            const token = localStorage.getItem('authToken');
            
            if (!token) return;
            
            // JWT 토큰에서 사용자 ID 추출
            const userData = this.jwtDecoder.parseJwt(token);
            const userId = userData.sub; // 토큰의 subject 필드가 사용자 ID
            
            // 수정된 API 경로로 요청 (RESTful)
            const response = await fetch(`http://localhost:8080/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const imgElement = this.elements.profileImageElement;
            if (!imgElement) return;
            
            if (response.ok) {
                try {
                    const data = await response.json();
                    // 응답 데이터 구조에 따라 이미지 URL 추출
                    if (data.data && data.data.profileImg) {
                        // 이미지가 바이트 배열이거나 URL인 경우 처리
                        imgElement.src = typeof data.data.profileImg === 'string' && data.data.profileImg.startsWith('http') 
                            ? data.data.profileImg 
                            : window.location.origin + '/shared/assets/images/default-profile.svg';
                    } else {
                        imgElement.src = window.location.origin + '/shared/assets/images/default-profile.svg';
                    }
                } catch (jsonError) {
                    console.error('Failed to parse JSON response:', jsonError);
                    imgElement.src = window.location.origin + '/shared/assets/images/default-profile.svg';
                }
            } else {
                console.warn('Failed to fetch profile image, status:', response.status);
                imgElement.src = window.location.origin + '/shared/assets/images/default-profile.svg';
            }
        } catch (error) {
            console.error('Network error while fetching profile image:', error);
            if (this.elements.profileImageElement) {
                this.elements.profileImageElement.src = window.location.origin + '/shared/assets/images/default-profile.svg';
            }
        }
    }

    /**
     * 뒤로가기 처리
     * @private
     */
    handleBackNavigation() {
        if (document.referrer) {
            history.back();
        } else {
            this.navigate('/');
        }
    }

    /**
     * 프로필 이미지 클릭 이벤트 처리
     * @private
     * @param {Event} event - 클릭 이벤트
     */
    handleProfileClick(event) {
        event.stopPropagation();
        this.state.isDropdownVisible = !this.state.isDropdownVisible;
        this.elements.profileDropdown.style.display = 
            this.state.isDropdownVisible ? 'block' : 'none';
    }

    /**
     * 외부 영역 클릭 시 드롭다운 숨김 처리
     * @private
     */
    handleOutsideClick() {
        if (this.state.isDropdownVisible) {
            this.state.isDropdownVisible = false;
            this.elements.profileDropdown.style.display = 'none';
        }
    }

    /**
     * 로그아웃 처리
     * @private
     */
    async handleLogout() {
        try {
            // 'jwt' -> 'authToken' 변경
            localStorage.removeItem('authToken');
            this.navigate('/pages/auth/login/index.html');
        } catch (error) {
            this.handleError('Logout failed', error);
        }
    }

    /**
     * 페이지 이동
     * @private
     * @param {string} path - 이동할 경로
     */
    navigate(path) {
        window.location.href = path;
    }

    /**
     * 에러 처리
     * @private
     * @param {string} message - 에러 메시지
     * @param {Error} error - 에러 객체
     */
    handleError(message, error) {
        console.error(message, error);
    }

    /**
     * UI 새로고침
     * @public
     */
    refresh() {
        this.updateUI();
    }
}