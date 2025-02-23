// shared/components/Header/Header.js

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
            profileImage: document.getElementById('userProfileImage'),
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
        this.elements.profileImage?.addEventListener('click', this.handleProfileClick.bind(this));
        document.addEventListener('click', this.handleOutsideClick.bind(this));
        
        this.elements.editProfile?.addEventListener('click', () => this.navigate('/pages/auth/profile/index.html'));
        this.elements.editPassword?.addEventListener('click', () => this.navigate('/pages/auth/profile/password.html'));
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
        const token = localStorage.getItem('jwt');
        if (this.elements.profileContainer) {
            this.elements.profileContainer.style.display = token ? 'block' : 'none';
        }
    }

    /**
     * 사용자 프로필 이미지 업데이트
     * @private
     */
    updateProfileImage() {
        const token = localStorage.getItem('jwt');
        const DEFAULT_PROFILE_IMAGE = '/shared/assets/images/default-profile.svg';
        
        if (this.elements.profileImage) {
            if (token) {
                // JWT 토큰이 있는 경우, API에서 프로필 이미지 URL 가져오기
                this.fetchProfileImage();
            } else {
                this.elements.profileImage.src = DEFAULT_PROFILE_IMAGE;
            }
        }
    }

    /**
     * API에서 프로필 이미지 URL 가져오기
     * @private
     */
    async fetchProfileImage() {
        try {
            const token = localStorage.getItem('jwt');
            const response = await fetch('/api/user/profile/image', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.elements.profileImage.src = data.imageUrl || '/shared/assets/images/default-profile.svg';
            }
        } catch (error) {
            this.handleError('Failed to fetch profile image', error);
            this.elements.profileImage.src = '/shared/assets/images/default-profile.svg';
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
            localStorage.removeItem('jwt');
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