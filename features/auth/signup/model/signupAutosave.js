// signupAutosave.js
import { authTempStorage } from '/entities/user/model/authTempStorge.js';

export class SignupAutosave {
    constructor(signupPage, validateFieldFn) {
        this.signupPage = signupPage;
        this.validateField = validateFieldFn;
    }

    validateSignupPage(signupPage) {
        if (!signupPage) {
            throw new Error('SignupPage instance is required');
        }
    }

    initializeFormElements() {
        const elements = {
            email: this.signupPage.inputs.email,
            password: this.signupPage.inputs.password,
            passwordConfirm: this.signupPage.inputs.passwordConfirm,
            nickname: this.signupPage.inputs.nickname,
            profilePreview: this.signupPage.profileElements.preview,
            plusIcon: this.signupPage.profileElements.plusIcon
        };

        this.validateElements(elements);
        return elements;
    }

    validateElements(elements) {
        Object.entries(elements).forEach(([key, element]) => {
            if (!element) {
                throw new Error(`Required form element "${key}" not found`);
            }
        });
    }

    initialize() {
        this.loadSavedFormData();
        this.setupAutoSave();
        this.setupUnloadHandler();
    }

    setupAutoSave() {
        let debounceTimer;
        const DEBOUNCE_DELAY = 500;

        const inputElements = this.getInputElements();
        inputElements.forEach(element => {
            element.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => this.saveFormData(), DEBOUNCE_DELAY);
            });
        });
    }

    getInputElements() {
        return Object.values(this.formElements)
            .filter(element => element.tagName === 'INPUT');
    }

    setupUnloadHandler() {
        window.addEventListener('beforeunload', () => {
            this.saveFormData();
        });
    }

    saveFormData() {
        const formData = this.collectFormData();
        authTempStorage.saveSignupForm(formData);
    }

    collectFormData() {
        return {
            email: this.formElements.email.value.trim(),
            password: this.formElements.password.value,
            passwordConfirm: this.formElements.passwordConfirm.value,
            nickname: this.formElements.nickname.value.trim(),
            profileImage: this.formElements.profilePreview.src
        };
    }

    loadSavedFormData() {
        const savedData = authTempStorage.getSignupForm();
        if (savedData) {
            this.restoreFormData(savedData);
            this.triggerValidation();
        }
    }

    restoreFormData(savedData) {
        this.restoreInputFields(savedData);
        this.restoreProfileImage(savedData);
    }

    restoreInputFields(savedData) {
        Object.entries(savedData).forEach(([key, value]) => {
            if (this.formElements[key] && key !== 'profileImage') {
                this.formElements[key].value = value || '';
            }
        });
    }

    restoreProfileImage(savedData) {
        if (savedData.profileImage) {
            this.formElements.profilePreview.src = savedData.profileImage;
            this.formElements.profilePreview.classList.remove('hidden');
            this.formElements.plusIcon.style.display = 'none';
        }
    }

    triggerValidation() {
        const fieldsToValidate = Object.entries(this.formElements)
            .filter(([key]) => key !== 'profilePreview' && key !== 'plusIcon');
    
        fieldsToValidate.forEach(([key, element]) => {
            if (element.value) {
                this.validateField(key, element.value);
            }
        });
    }

    clearSavedData() {
        authTempStorage.clearSignupForm();
    }
}