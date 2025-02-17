import { authTempStorage } from '/entities/user/model/authTempStorge.js';

class SignupAutosave {
    constructor() {
        this.formElements = {
            email: document.getElementById('email'),
            password: document.getElementById('password'),
            passwordConfirm: document.getElementById('passwordConfirm'),
            nickname: document.getElementById('nickname'),
            profileInput: document.getElementById('profileInput'),
            profilePreview: document.getElementById('profilePreview')
        };
    }

    // 폼 데이터 저장
    saveFormData() {
        const formData = {
            email: this.formElements.email.value.trim(),
            password: this.formElements.password.value,
            passwordConfirm: this.formElements.passwordConfirm.value,
            nickname: this.formElements.nickname.value.trim()
        };
        authTempStorage.saveSignupForm(formData);
    }

    // 저장된 폼 데이터 불러오기
    loadSavedFormData() {
        const savedData = authTempStorage.getSignupForm();
        if (savedData) {
            this.formElements.email.value = savedData.email || '';
            this.formElements.password.value = savedData.password || '';
            this.formElements.passwordConfirm.value = savedData.passwordConfirm || '';
            this.formElements.nickname.value = savedData.nickname || '';
            
            // 데이터 로드 후 유효성 검사 이벤트 트리거
            Object.values(this.formElements).forEach(element => {
                if (element.value) {
                    element.dispatchEvent(new Event('input'));
                }
            });
        }
    }

    // 자동 저장 이벤트 설정
    setupAutoSave() {
        let timer;
        const inputElements = [
            this.formElements.email,
            this.formElements.password,
            this.formElements.passwordConfirm,
            this.formElements.nickname
        ];

        inputElements.forEach(element => {
            element.addEventListener('input', () => {
                clearTimeout(timer);
                timer = setTimeout(() => this.saveFormData(), 500); // 0.5초 후 저장
            });
        });
    }

    // 프로필 이미지 자동 저장
    setupProfileAutoSave() {
        this.formElements.profileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    alert('이미지 크기는 5MB 이하여야 합니다.');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.formElements.profilePreview.src = e.target.result;
                    this.saveFormData();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 임시 저장 데이터 삭제
    clearSavedData() {
        authTempStorage.clearSignupForm();
    }

    // 초기화
    init() {
        this.loadSavedFormData();
        this.setupAutoSave();
        this.setupProfileAutoSave();
    }
}

export const signupAutosave = new SignupAutosave();