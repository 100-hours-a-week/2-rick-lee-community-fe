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
                
                // 폼 데이터가 변경될 때마다 자동 저장
                this.saveFormData();
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
        // 디바운스 타이머 초기화
        this.saveTimer = null;

        // 페이지 이탈 시 자동 저장
        window.addEventListener('beforeunload', () => {
            this.saveFormData(true); // 즉시 저장 (디바운스 없이)
        });
    }

    /**
     * 폼 데이터 저장
     * @private
     * @param {boolean} immediate - 즉시 저장 여부
     */
    saveFormData(immediate = false) {
        // 이미 예약된 저장 취소
        clearTimeout(this.saveTimer);

        const saveAction = () => {
            const formData = this.getFormData();
            signupModel.saveFormData(formData);
        };

        if (immediate) {
            saveAction();
        } else {
            this.saveTimer = setTimeout(saveAction, 500);
        }
    }

    /**
     * 저장된 데이터 불러오기
     * @private
     */
    loadSavedData() {
        const savedData = signupModel.getSavedFormData();
        if (!savedData) return;

        // 기존 입력 필드 데이터 복원
        Object.entries(this.elements.inputs).forEach(([field, input]) => {
            if (savedData[field]) {
                input.value = savedData[field];
            }
        });

        // 프로필 이미지 데이터 복원
        if (savedData.profileImageURL && this.profileManager) {
            // 이미지 URL로 프로필 이미지 초기화
            this.profileManager.initializeWithSavedData(savedData.profileImageURL);
        }

        // 입력 상태에 따라 버튼 활성화 상태 업데이트
        this.updateButtonState(this.isFormValid());
    }

    /**
     * 회원가입 처리
     * @private
     * @param {Event} e - 제출 이벤트
     */
    async handleSubmit(e) {
        e.preventDefault();
        
        // 제출 버튼 비활성화 (중복 제출 방지)
        this.elements.signupButton.disabled = true;
        
        try {
            const formData = this.getFormData();
            const result = await signupModel.signup(formData);

            if (result.success) {
                this.profileManager.dispose(); // 프로필 이미지 매니저 정리
                signupModel.clearSavedData();
                alert(result.message || '회원가입이 완료되었습니다.');
                window.location.href = '/pages/auth/login/index.html';
            } else {
                this.showError(result.field, result.message);
                this.elements.signupButton.disabled = false; // 오류 시 버튼 다시 활성화
            }
        } catch (error) {
            console.error('회원가입 처리 중 오류:', error);
            alert('회원가입 처리 중 오류가 발생했습니다.');
            this.elements.signupButton.disabled = false; // 오류 시 버튼 다시 활성화
        }
    }

    /**
     * 폼 데이터 수집
     * @private
     * @returns {Object} 폼 데이터
     */
    getFormData() {
        // 기본 입력 필드 데이터 수집
        const formData = Object.entries(this.elements.inputs).reduce((acc, [field, input]) => {
            acc[field] = input.value.trim();
            return acc;
        }, {});

        // 프로필 이미지 데이터 추가
        if (this.profileManager) {
            try {
                const imageData = this.profileManager.getCurrentImageData(); // 변경된 메서드명 사용
                if (imageData) {
                    formData.profileImage = {
                        file: imageData.file,
                        dataURL: imageData.dataURL,
                        isDefault: imageData.isDefault
                    };
                    
                    // 이전 코드와의 호환성을 위해 추가
                    formData.profileImageURL = imageData.dataURL;
                }
            } catch (error) {
                console.error('이미지 데이터 가져오기 오류:', error);
                // 오류 시 이미지 데이터 없이 진행
            }
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
        if (!button) return;
        
        button.disabled = !isValid;
        button.classList.toggle('signup-button-active', isValid);
        button.classList.toggle('signup-button-disabled', !isValid);
    }

    /**
     * 에러 메시지 표시
     * @private
     * @param {string} field - 에러 발생 필드
     * @param {string} message - 에러 메시지
     */
    showError(field, message) {
        if (field && this.elements.helpers[field]) {
            this.updateHelperText(field, { isValid: false, message });
            
            // 해당 필드로 스크롤
            const inputElement = this.elements.inputs[field];
            if (inputElement) {
                inputElement.focus();
                inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            alert(message || '오류가 발생했습니다.');
        }
    }

    /**
     * 프로필 이미지 매니저 초기화 및 이벤트 설정
     * @private
     */
    setupProfileImageManager() {
        // 이미지 상태 변경과 에러 처리를 위한 콜백 객체 생성
        const callbacks = {
            onChange: (imageState) => {
                this.handleProfileImageChange(imageState);
            },
            onError: (message) => {
                this.showError('profileImage', message);
            }
        };

        // 기존 DOM 요소 선택자 전달 (ProfileImageManager 생성자에 맞게 조정)
        const domSelectors = {
            container: '#profileImageContainer',
            preview: '#previewImage',
            plusIcon: '.plus-icon',
            dropdown: '#profileDropdown',
            uploadBtn: '#uploadImage',
            defaultBtn: '#useDefault',
            fileInput: '#profileImage',
        };

        // ProfileImageManager 인스턴스 생성 시 콜백과 선택자 전달
        this.profileManager = new ProfileImageManager({
            onChange: callbacks.onChange,
            onError: callbacks.onError,
            domSelectors
        });
    }

    /**
     * 프로필 이미지 변경 처리
     * @private
     * @param {Object} imageState - 이미지 상태 객체
     */
    handleProfileImageChange(imageState) {
        // 이미지 변경 시 폼 데이터 저장
        this.saveFormData(true);
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
        // 이벤트 리스너 정리
        clearTimeout(this.saveTimer);
        
        // 프로필 이미지 매니저 정리
        if (this.profileManager) {
            this.profileManager.dispose();
            this.profileManager = null;
        }
    }
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    const signupPage = new SignupPage();

    // 페이지 언로드 시 정리
    window.addEventListener('unload', () => {
        signupPage.destroy();
    });
});