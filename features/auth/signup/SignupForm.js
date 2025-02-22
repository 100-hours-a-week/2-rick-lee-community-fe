import { FormValidator } from './model/FormValidator.js';
import { ProfileImageManager } from './model/ProfileImageManager.js';
import { SignupAutosave } from './model/SignupAutosave.js';
import { userStorage } from '/entities/user/model/userStorage.js';

export class SignupForm {
    static ROUTES = {
        LOGIN: '/pages/auth/login/index.html'
    };

    constructor() {
        // 초기화 순서 정리
        this.defaultImagePath = '/shared/assets/images/default-profile.svg';
        this.initializeDOMElements();
        
        if (this.validateDOMElements()) {
            this.initializeState();
            this.initializeManagers();
            this.setupEventListeners();
        } else {
            console.error('DOM elements initialization failed');
        }
    }

    initializeDOMElements() {
        this.form = document.getElementById('signupForm');
        
        this.inputs = {
            email: document.getElementById('email'),
            password: document.getElementById('password'),
            passwordConfirm: document.getElementById('passwordConfirm'),
            nickname: document.getElementById('nickname'),
            profileImage: document.getElementById('profileImage')
        };
    
        this.buttons = {
            signup: document.getElementById('signupButton'),
            login: document.getElementById('loginButton')
        };
    
        this.profileElements = {
            container: document.getElementById('profileImageContainer'),
            preview: document.getElementById('previewImage'),
            plusIcon: document.getElementById('plusIcon'),  // HTML에 id 추가 필요
            dropdown: document.getElementById('profileDropdown'),
            uploadBtn: document.getElementById('uploadImage'),
            defaultBtn: document.getElementById('useDefault')
        };
        
        this.helperTexts = {
            email: document.getElementById('emailHelper'),
            password: document.getElementById('passwordHelper'),
            passwordConfirm: document.getElementById('passwordConfirmHelper'),
            nickname: document.getElementById('nicknameHelper')
        };
    }

    validateDOMElements() {
        try {
            if (!this.form) {
                throw new Error('Signup form element not found');
            }

            const requiredInputs = ['email', 'password', 'passwordConfirm', 'nickname'];
            requiredInputs.forEach(key => {
                if (!this.inputs[key]) {
                    throw new Error(`Required input field "${key}" not found`);
                }
            });

            const requiredButtons = ['signup', 'login'];
            requiredButtons.forEach(key => {
                if (!this.buttons[key]) {
                    throw new Error(`Required button "${key}" not found`);
                }
            });

            return true;
        } catch (error) {
            console.error('DOM validation failed:', error);
            return false;
        }
    }

    initializeState() {
        this.validationState = {
            email: false,
            password: false,
            passwordConfirm: false,
            nickname: false
        };
    }

    initializeManagers() {
        try {
            this.validator = new FormValidator(this);
            this.profileManager = new ProfileImageManager(this);
            // 이렇게 수정
            this.autosave = new SignupAutosave(this, (key, value) => {
                this.validator.validateField(key, value);
            });
            
        } catch (error) {
            console.error('Manager initialization failed:', error);
        }
    }

    setupEventListeners() {
        // 입력 필드 이벤트
        console.log("이벤트 리스너 호출완료")
        Object.entries(this.inputs)
            .filter(([key]) => key !== 'profileImage')
            .forEach(([key, input]) => {
                if (input) {
                    ['blur', 'input'].forEach(eventType => {
                        input.addEventListener(eventType, () => {
                            this.validator.validateField(key, input.value);
                            this.updateSubmitButton();
                        });
                });
            }
        });
        
        // 프로필 이미지 이벤트 명시적 설정
        this.setupProfileImageEvents();

        // 폼 제출
        this.form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // 로그인 페이지 이동
        this.buttons.login?.addEventListener('click', () => {
            this.navigateTo(SignupForm.ROUTES.LOGIN);
        });
    }

    getProfileImageSrc() {
        return this.profileElements.preview.classList.contains('hidden') ? 
            this.defaultImagePath : 
            this.profileElements.preview.src;
    }

    setupProfileImageEvents() {
        const container = this.profileElements.container;
        const uploadBtn = this.profileElements.uploadBtn;
        const defaultBtn = this.profileElements.defaultBtn;

        if (container) {
            container.addEventListener('click', (e) => {
                console.log('Profile container clicked');
                e.stopPropagation();
                this.toggleProfileDropdown();
            });
        }

        if (uploadBtn) {
            uploadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.inputs.profileImage.click();
                this.hideProfileDropdown();
            });
        }

        if (defaultBtn) {
            defaultBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.useDefaultImage();
                this.hideProfileDropdown();
            });
        }

        document.addEventListener('click', () => this.hideProfileDropdown());
    }

    toggleProfileDropdown() {
        const dropdown = this.profileElements.dropdown;
        console.log('Toggle dropdown called');
        
        if (!dropdown) {
            console.error('Dropdown element not found');
            return;
        }
    
        const isHidden = dropdown.classList.contains('hidden');
        console.log('Dropdown is currently hidden:', isHidden);
    
        if (isHidden) {
            dropdown.style.display = 'block';  // display 속성도 직접 설정
            dropdown.classList.remove('hidden');
        } else {
            dropdown.style.display = 'none';
            dropdown.classList.add('hidden');
        }
    }

    hideProfileDropdown() {
        const dropdown = this.profileElements.dropdown;
        dropdown.classList.add('hidden');
    }

    useDefaultImage() {
        this.profileElements.preview.src = this.defaultImagePath;
        this.profileElements.preview.classList.remove('hidden');
        this.profileElements.plusIcon.style.display = 'none';
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!this.validateImageFile(file)) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.profileElements.preview.src = e.target.result;
            this.profileElements.preview.classList.remove('hidden');
            this.profileElements.plusIcon.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    validateImageFile(file) {
        if (!file) return false;

        if (file.size > 5 * 1024 * 1024) {
            alert('파일 크기는 5MB 이하여야 합니다.');
            return false;
        }

        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드 가능합니다.');
            return false;
        }

        return true;
    }

    updateSubmitButton() {
        const isValid = Object.values(this.validationState).every(valid => valid);
        if (this.buttons.signup) {
            this.buttons.signup.disabled = !isValid;
        }
    }

    handleSubmit() {
        const formData = {
            email: this.inputs.email?.value,
            password: this.inputs.password?.value,
            nickname: this.inputs.nickname?.value,
            profileImage: this.profileManager?.getProfileImageSrc()
        };

        if (Object.values(this.validationState).every(valid => valid)) {
            const result = userStorage.registerUser(formData);
            
            if (result.success) {
                this.autosave?.clearSavedData();
                alert('회원가입이 완료되었습니다.');
                this.navigateTo(SignupForm.ROUTES.LOGIN);
            } else {
                alert(result.message || '회원가입 중 오류가 발생했습니다.');
            }
        }
    }

    navigateTo(route) {
        window.location.href = route;
    }
}

// DOM이 완전히 로드된 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    try {
        new SignupForm();
    } catch (error) {
        console.error('Failed to initialize SignupForm:', error);
    }
});