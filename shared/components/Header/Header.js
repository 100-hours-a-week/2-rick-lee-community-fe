// Header.js
import { userStorage } from '/entities/user/model/userStorage.js';

export class Header {
    constructor(containerId) {
        this.containerId = containerId;
        this.isDropdownVisible = false;
        this.init();
    }

    async init() {
        await this.loadStyles();
        await this.loadHeader();
        this.setupProfileImage();
        this.setupDropdown();
    }

    async loadStyles() {
        if (!document.querySelector('link[href="/shared/components/Header/styles.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/shared/components/Header/styles.css';
            document.head.appendChild(link);
        }
    }

    async loadHeader() {
        try {
            const response = await fetch('/shared/components/Header/header.html');
            const html = await response.text();
            document.getElementById(this.containerId).innerHTML = html;
        } catch (error) {
            console.error('헤더 로드 중 오류:', error);
        }
    }

    setupProfileImage() {
        const currentUser = userStorage.getCurrentUser();
        const profileImage = document.getElementById('userProfileImage');
        const DEFAULT_PROFILE_IMAGE = '/shared/assets/images/default-profile.svg';
    
        if (currentUser) {
            profileImage.src = userStorage.getProfileImage(currentUser.id);
        } else {
            profileImage.src = DEFAULT_PROFILE_IMAGE;
        }
    }

    setupDropdown() {
        const profileImage = document.getElementById('profileImage');
        const dropdown = document.getElementById('profileDropdown');
        const editProfile = document.getElementById('editProfile');
        const editPassword = document.getElementById('editPassword');
        const logout = document.getElementById('logout');

        profileImage.addEventListener('click', (e) => {
            e.stopPropagation();
            this.isDropdownVisible = !this.isDropdownVisible;
            dropdown.style.display = this.isDropdownVisible ? 'block' : 'none';
        });

        document.addEventListener('click', () => {
            if (this.isDropdownVisible) {
                this.isDropdownVisible = false;
                dropdown.style.display = 'none';
            }
        });

        editProfile.addEventListener('click', () => {
            window.location.href = '/pages/auth/profile/index.html';
        });

        editPassword.addEventListener('click', () => {
            window.location.href = '/pages/auth/profile/password.html';
        });

        logout.addEventListener('click', () => {
            userStorage.logout();
            window.location.href = '/pages/auth/login/index.html';
        });
    }
}