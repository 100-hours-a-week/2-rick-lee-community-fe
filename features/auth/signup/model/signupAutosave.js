// features/auth/signup/model/signupAutosave.js
import { authTempStorage } from '/entities/user/model/authTempStorge.js';

/**
 * 회원가입 폼 자동 저장 기능을 담당하는 클래스
 */
export class SignupAutosave {
    /**
     * SignupAutosave 생성자
     * @param {Object} signupPage - 회원가입 페이지 인스턴스
     * @param {Function} validateFieldFn - 필드 유효성 검사 함수
     */
    constructor(signupPage, validateFieldFn) {
        this.signupPage = signupPage;
        this.validateField = validateFieldFn;
        this.formElements = null;
        this.initialized = false;
    }

    /**
     * 초기화 메서드 - 필수 호출
     */
    initialize() {
        this.validateSignupPage();
        this.formElements = this.initializeFormElements();
        this.loadSavedFormData();
        this.setupAutoSave();
        this.setupUnloadHandler();
        this.initialized = true;
    }

    /**
     * 회원가입 페이지 객체 유효성 검사
     */
    validateSignupPage() {
        if (!this.signupPage) {
            throw new Error('SignupPage instance is required');
        }
    }

    /**
     * 폼 요소 초기화 및 유효성 검사
     * @returns {Object} 초기화된 폼 요소 객체
     */
    initializeFormElements() {
        const elements = {
            email: this.signupPage.inputs.email,
            password: this.signupPage.inputs.password,
            passwordConfirm: this.signupPage.inputs.passwordConfirm,
            username: this.signupPage.inputs.username,
            profilePreview: this.signupPage.profileElements?.preview,
            plusIcon: this.signupPage.profileElements?.plusIcon
        };

        this.validateElements(elements);
        return elements;
    }

    /**
     * 필수 요소가 모두 존재하는지 검사
     * @param {Object} elements - 검사할 요소 객체
     */
    validateElements(elements) {
        const requiredElements = ['email', 'password', 'passwordConfirm', 'username'];
        
        for (const key of requiredElements) {
            if (!elements[key]) {
                throw new Error(`Required form element "${key}" not found`);
            }
        }
    }

    /**
     * 자동 저장 기능 설정
     */
    setupAutoSave() {
        let debounceTimer;
        const DEBOUNCE_DELAY = 500;

        const inputElements = this.getInputElements();
        inputElements.forEach(element => {
            element.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    if (this.initialized) {
                        this.saveFormData();
                    }
                }, DEBOUNCE_DELAY);
            });
        });
    }

    /**
     * 입력 요소만 필터링하여 반환
     * @returns {Array} 입력 요소 배열
     */
    getInputElements() {
        if (!this.formElements) return [];
        
        return Object.values(this.formElements)
            .filter(element => element && element.tagName === 'INPUT');
    }

    /**
     * 페이지 이탈 시 자동 저장 설정
     */
    setupUnloadHandler() {
        window.addEventListener('beforeunload', () => {
            if (this.initialized) {
                this.saveFormData();
            }
        });
    }

    /**
     * 폼 데이터 저장
     */
    saveFormData() {
        if (!this.formElements) return;
        
        const formData = this.collectFormData();
        authTempStorage.saveSignupForm(formData);
    }

    /**
     * 현재 폼 데이터 수집
     * @returns {Object} 수집된 폼 데이터
     */
    collectFormData() {
        if (!this.formElements) return {};
        
        const formData = {
            email: this.formElements.email.value.trim(),
            password: this.formElements.password.value,
            passwordConfirm: this.formElements.passwordConfirm.value,
            username: this.formElements.username.value.trim()
        };
        
        // 프로필 이미지가 있는 경우에만 추가
        if (this.formElements.profilePreview && this.formElements.profilePreview.src) {
            // default 이미지가 아닌 경우에만 저장
            if (!this.formElements.profilePreview.src.includes('default-profile.svg')) {
                formData.profileImage = this.formElements.profilePreview.src;
            }
        }
        
        return formData;
    }

    /**
     * 저장된 폼 데이터 불러오기
     */
    loadSavedFormData() {
        if (!this.formElements) return;
        
        const savedData = authTempStorage.getSignupForm();
        if (savedData) {
            this.restoreFormData(savedData);
            this.triggerValidation();
        }
    }

    /**
     * 저장된 데이터로 폼 복원
     * @param {Object} savedData - 저장된 폼 데이터
     */
    restoreFormData(savedData) {
        this.restoreInputFields(savedData);
        this.restoreProfileImage(savedData);
    }

    /**
     * 입력 필드 값 복원
     * @param {Object} savedData - 저장된 폼 데이터
     */
    restoreInputFields(savedData) {
        if (!this.formElements) return;
        
        // 입력 필드 복원 (프로필 이미지 제외)
        const textFields = ['email', 'password', 'passwordConfirm', 'username'];
        
        for (const field of textFields) {
            if (this.formElements[field] && savedData[field] !== undefined) {
                this.formElements[field].value = savedData[field] || '';
            }
        }
    }

    /**
     * 프로필 이미지 복원
     * @param {Object} savedData - 저장된 폼 데이터
     */
    restoreProfileImage(savedData) {
        if (!this.formElements || !this.formElements.profilePreview || !this.formElements.plusIcon) return;
        
        if (savedData.profileImage) {
            this.formElements.profilePreview.src = savedData.profileImage;
            this.formElements.profilePreview.classList.remove('hidden');
            this.formElements.plusIcon.style.display = 'none';
        }
    }

    /**
     * 복원된 데이터에 대한 유효성 검사 트리거
     */
    triggerValidation() {
        if (!this.formElements || !this.validateField) return;
        
        // 값이 있는 필드에 대해서만 유효성 검사 수행
        const fieldsToValidate = ['email', 'password', 'passwordConfirm', 'username'];
        
        for (const field of fieldsToValidate) {
            const element = this.formElements[field];
            if (element && element.value) {
                this.validateField(field, element.value);
            }
        }
    }

    /**
     * 저장된 데이터 삭제
     */
    clearSavedData() {
        authTempStorage.clearSignupForm();
    }
}