// pages/auth/signup/index.js

import { signupModel } from '/features/auth/signup/model/signupModel.js';
import { ProfileImageManager } from '/features/auth/signup/ui/profileImageManager.js';

/**
 * SignupPage 클래스
 * 회원가입 페이지의 UI 로직과 이벤트 처리를 담당
 * 
 * 주요 기능:
 * - 폼 UI 요소 관리
 * - 이벤트 처리
 * - 프로필 이미지 관리
 * - 실시간 유효성 검사 UI 업데이트
 */
export class SignupPage {
    /**
     * SignupPage 생성자
     * UI 컴포넌트 초기화 및 이벤트 설정
     */
    constructor() {
        this.initializeElements();
        this.setupProfileImageManager();
        this.setupEventListeners();
        this.setupAutoSave();
        this.loadSavedData();
    }

    /**
     * DOM 요소 초기화
     * @private
     */
    initializeElements() {
        this.elements = {
            form: document.getElementById('signupForm'),
            inputs: {
                email: document.getElementById('email'),
                password: document.getElementById('password'),
                passwordConfirm: document.getElementById('passwordConfirm'),
                nickname: document.getElementById('nickname')
            },
            helpers: {
                email: document.getElementById('emailHelper'),
                password: document.getElementById('passwordHelper'),
                passwordConfirm: document.getElementById('passwordConfirmHelper'),
                nickname: document.getElementById('nicknameHelper')
            },
            profileImage: {
                container: document.getElementById('profileImageContainer'),
                preview: document.getElementById('previewImage'),
                dropdown: document.getElementById('profileDropdown'),
                uploadBtn: document.getElementById('uploadImage'),
                defaultBtn: document.getElementById('useDefault'),
                fileInput: document.getElementById('profileImage')
            },
            signupButton: document.getElementById('signupButton'),
            loginButton: document.getElementById('loginButton')
        };

        // 초기 버튼 비활성화
        this.updateButtonState(false);
    }

    /**
     * 이벤트 리스너 설정
     * @private
     */
    setupEventListeners() {
        // 입력 필드 이벤트
        Object.entries(this.elements.inputs).forEach(([field, input]) => {
            input.addEventListener('input', () => {
                const formData = this.getFormData();
                const result = signupModel.validateField(field, input.value, formData);
                this.updateHelperText(field, result);
                this.updateButtonState(this.isFormValid());
            });
        });

        // 폼 제출 이벤트
        this.elements.form.addEventListener('submit', this.handleSubmit.bind(this));

        // 로그인 버튼 이벤트
        if (this.elements.loginButton) {
            this.elements.loginButton.addEventListener('click', this.handleLoginClick.bind(this));
        }
    }

    /**
     * 자동 저장 설정
     * @private
     */
    setupAutoSave() {
        let timer;
        Object.values(this.elements.inputs).forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    signupModel.saveFormData(this.getFormData());
                }, 500);
            });
        });
    }

    /**
     * 저장된 데이터 불러오기
     * @private
     */
    loadSavedData() {
        const savedData = signupModel.getSavedFormData();
        if (savedData) {
            // 기존 입력 필드 데이터 복원
            Object.entries(savedData).forEach(([field, value]) => {
                if (this.elements.inputs[field]) {
                    this.elements.inputs[field].value = value || '';
                }
            });

            // 프로필 이미지 데이터 복원
            if (savedData.profile_image) {
                this.profileManager.getCurrentImage(
                    savedData.profile_image,
                    savedData.is_default_profile
                );
            }

            this.updateButtonState(this.isFormValid());
        }
    }


    /**
     * 회원가입 처리
     * @private
     * @param {Event} e - 제출 이벤트
     */
    async handleSubmit(e) {
        e.preventDefault();
        const formData = this.getFormData();
        const result = await signupModel.signup(formData);

        if (result.success) {
            this.profileManager.destroy(); // 프로필 이미지 매니저 정리
            signupModel.clearSavedData();
            alert(result.message);
            window.location.href = '/pages/auth/login/index.html';
        } else {
            this.showError(result.field, result.message);
        }
    }

    /**
     * 폼 데이터 수집
     * @private
     * @returns {Object} 폼 데이터
     */
    getFormData() {
        const formData = Object.entries(this.elements.inputs).reduce((acc, [field, input]) => {
            acc[field] = input.value.trim();
            return acc;
        }, {});

        // 프로필 이미지 데이터 추가
        if (this.profileManager) {
            formData.profile_image = this.profileManager.getCurrentImage();
            formData.is_default_profile = this.profileManager.isDefaultImage();
        }

        return formData;
    }

    /**
     * 폼 전체 유효성 상태 확인
     * @private
     * @returns {boolean} 폼 유효성 상태
     */
    isFormValid() {
        const formData = this.getFormData();
        return signupModel.validateForm(formData).isValid;
    }

    /**
     * 헬퍼 텍스트 업데이트
     * @private
     * @param {string} field - 필드명
     * @param {Object} result - 유효성 검사 결과
     */
    updateHelperText(field, result) {
        const helper = this.elements.helpers[field];
        if (helper) {
            helper.textContent = result.message;
            helper.className = `helper-text ${result.isValid ? '' : 'error'}`;
        }
    }

    /**
     * 제출 버튼 상태 업데이트
     * @private
     * @param {boolean} isValid - 폼 유효성 상태
     */
    updateButtonState(isValid) {
        const button = this.elements.signupButton;
        button.classList.remove('signup-button-active', 'signup-button-disabled');
        button.classList.add(isValid ? 'signup-button-active' : 'signup-button-disabled');
    }

    /**
     * 에러 메시지 표시
     * @private
     * @param {string} field - 에러 발생 필드
     * @param {string} message - 에러 메시지
     */
    showError(field, message) {
        if (this.elements.helpers[field]) {
            this.updateHelperText(field, { isValid: false, message });
        } else {
            alert(message);
        }
    }

    /**
     * 프로필 이미지 매니저 초기화 및 이벤트 설정
     * @private
     */
    setupProfileImageManager() {
        // 이미지 상태 변경과 에러 처리를 위한 콜백 객체 생성
        const callbacks = {
            onImageChange: (imageData, isDefault) => {
                this.handleProfileImageChange(imageData, isDefault);
            },
            onError: (message) => {
                this.showError('profileImage', message);
            }
        };

        // ProfileImageManager 인스턴스 생성 시 콜백 전달
        this.profileManager = new ProfileImageManager(callbacks);
    }

    /**
     * 프로필 이미지 변경 처리
     * @private
     * @param {string} imageData - 이미지 데이터 URL
     * @param {boolean} isDefault - 기본 이미지 여부
     */
    handleProfileImageChange(imageData, isDefault) {
        const formData = this.getFormData();
        formData.profile_image = imageData;
        formData.is_default_profile = isDefault;

        // 자동 저장
        signupModel.saveFormData(formData);
    }
    /**
     * 로그인 페이지로 이동
     * @private
     * @param {Event} e - 클릭 이벤트 객체
     */
    handleLoginClick(e) {
        e.preventDefault(); // 폼 제출 방지
        window.location.href = '/pages/auth/login/index.html';
    }

    /**
     * 페이지 정리
     * @public
     */
    destroy() {
        this.profileManager?.destroy();
    }
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    const signupPage = new SignupPage();

    window.addEventListener('unload', () => {
        signupPage.destroy();
    });
});