// Header.js
import { userStorage } from '/entities/user/model/userStorage.js';

export class Header {
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

    async loadDependencies() {
        const styleUrl = '/shared/components/Header/styles.css';
        if (!document.querySelector(`link[href="${styleUrl}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = styleUrl;
            document.head.appendChild(link);
        }
    }

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

    cacheElements() {
        // Cache all required DOM elements
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

        // Validate required elements
        Object.entries(elements).forEach(([key, element]) => {
            if (!element) {
                throw new Error(`Required element "${key}" not found`);
            }
        });

        this.elements = elements;
    }

    bindEvents() {
        // Back button navigation
        this.elements.backButton?.addEventListener('click', this.handleBackNavigation.bind(this));

        // Profile dropdown events
        this.elements.profileImage?.addEventListener('click', this.handleProfileClick.bind(this));
        document.addEventListener('click', this.handleOutsideClick.bind(this));

        // Profile menu actions
        this.elements.editProfile?.addEventListener('click', () => this.navigate('/pages/auth/profile/index.html'));
        this.elements.editPassword?.addEventListener('click', () => this.navigate('/pages/auth/profile/password.html'));
        this.elements.logout?.addEventListener('click', this.handleLogout.bind(this));
    }

    updateUI() {
        this.updateProfileVisibility();
        this.updateProfileImage();
    }

    updateProfileVisibility() {
        const currentUser = userStorage.getCurrentUser();
        if (this.elements.profileContainer) {
            this.elements.profileContainer.style.display = currentUser ? 'block' : 'none';
        }
    }

    updateProfileImage() {
        const currentUser = userStorage.getCurrentUser();
        const DEFAULT_PROFILE_IMAGE = '/shared/assets/images/default-profile.svg';
        
        if (this.elements.profileImage) {
            this.elements.profileImage.src = currentUser 
                ? userStorage.getProfileImage(currentUser.id) 
                : DEFAULT_PROFILE_IMAGE;
        }
    }

    handleBackNavigation() {
        if (document.referrer) {
            history.back();
        } else {
            this.navigate('/');
        }
    }

    handleProfileClick(event) {
        event.stopPropagation();
        this.state.isDropdownVisible = !this.state.isDropdownVisible;
        this.elements.profileDropdown.style.display = 
            this.state.isDropdownVisible ? 'block' : 'none';
    }

    handleOutsideClick() {
        if (this.state.isDropdownVisible) {
            this.state.isDropdownVisible = false;
            this.elements.profileDropdown.style.display = 'none';
        }
    }

    async handleLogout() {
        try {
            await userStorage.logout();
            this.navigate('/pages/auth/login/index.html');
        } catch (error) {
            this.handleError('Logout failed', error);
        }
    }

    navigate(path) {
        window.location.href = path;
    }

    handleError(message, error) {
        console.error(message, error);
        // 여기에 에러 UI 표시 로직 추가 가능
    }

    // Public method for external updates
    refresh() {
        this.updateUI();
    }
}