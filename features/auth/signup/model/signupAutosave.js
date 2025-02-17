// signupAutosave.js
import { authTempStorage } from '/entities/user/model/authTempStorge.js';

export class SignupAutosave {
    constructor(signupPage) {
        this.signupPage = signupPage;
        this.formElements = {
            email: signupPage.inputs.email,
            password: signupPage.inputs.password,
            passwordConfirm: signupPage.inputs.passwordConfirm,
            nickname: signupPage.inputs.nickname,
            profilePreview: signupPage.profileElements.preview,
            plusIcon: signupPage.profileElements.plusIcon
        };
        this.init();
    }

    initialize() {
        this.loadSavedFormData();
        this.setupAutoSave();
        this.setupUnloadHandler();
    }

    setupAutoSave() {
        let timer;
        const inputElements = Object.values(this.formElements)
            .filter(element => element.tagName === 'INPUT');

        inputElements.forEach(element => {
            element.addEventListener('input', () => {
                clearTimeout(timer);
                timer = setTimeout(() => this.saveFormData(), 500);
            });
        });
    }

    setupUnloadHandler() {
        window.addEventListener('beforeunload', () => {
            this.saveFormData();
        });
    }

    saveFormData() {
        const formData = {
            email: this.formElements.email.value.trim(),
            password: this.formElements.password.value,
            passwordConfirm: this.formElements.passwordConfirm.value,
            nickname: this.formElements.nickname.value.trim(),
            profileImage: this.formElements.profilePreview.src
        };
        authTempStorage.saveSignupForm(formData);
    }

    loadSavedFormData() {
        const savedData = authTempStorage.getSignupForm();
        if (savedData) {
            // 입력 필드 데이터 복원
            Object.entries(savedData).forEach(([key, value]) => {
                if (this.formElements[key] && key !== 'profileImage') {
                    this.formElements[key].value = value || '';
                }
            });

            // 프로필 이미지 복원
            if (savedData.profileImage) {
                this.formElements.profilePreview.src = savedData.profileImage;
                this.formElements.profilePreview.classList.remove('hidden');
                this.formElements.plusIcon.style.display = 'none';
            }

            // 유효성 검사 트리거
            this.triggerValidation();
        }
    }

    triggerValidation() {
        Object.entries(this.formElements)
            .filter(([key]) => key !== 'profilePreview' && key !== 'plusIcon')
            .forEach(([key, element]) => {
                if (element.value) {
                    this.signupPage.validateField(key, element.value);
                }
            });
    }

    clearSavedData() {
        authTempStorage.clearSignupForm();
    }
}