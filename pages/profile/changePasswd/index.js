// pages/profile/password/index.js
import { passwordChangeModel } from '/features/profile/changePassword/passwordChangeModel.js';

/**
 * 비밀번호 변경 페이지 클래스
 * 비밀번호 변경 UI 처리 담당
 */
class PasswordChangePage {
    constructor() {
        this.elements = this.initializeElements();
        this.setupEventListeners();
        this.updateSubmitButton();
    }

    /**
     * DOM 요소 초기화
     * @private
     */
    initializeElements() {
        return {
            form: document.querySelector('.password-form'),
            newPassword: document.getElementById('newPassword'),
            passwordConfirm: document.getElementById('passwordConfirm'),
            passwordHelper: document.getElementById('passwordHelper'),
            passwordConfirmHelper: document.getElementById('passwordConfirmHelper'),
            submitButton: document.getElementById('submitButton')
        };
    }

    /**
     * 이벤트 리스너 설정
     * @private
     */
    setupEventListeners() {
        // 비밀번호 입력 이벤트
        this.elements.newPassword.addEventListener('input', () => {
            const result = passwordChangeModel.updateFormData(
                'newPassword', 
                this.elements.newPassword.value
            );
            this.updateHelperText('passwordHelper', result);
            
            // 비밀번호 변경 시 비밀번호 확인 필드도 다시 검증
            if (this.elements.passwordConfirm.value) {
                const confirmResult = passwordChangeModel.updateFormData(
                    'passwordConfirm', 
                    this.elements.passwordConfirm.value
                );
                this.updateHelperText('passwordConfirmHelper', confirmResult);
            }
            
            this.updateSubmitButton();
        });

        // 비밀번호 확인 입력 이벤트
        this.elements.passwordConfirm.addEventListener('input', () => {
            const result = passwordChangeModel.updateFormData(
                'passwordConfirm', 
                this.elements.passwordConfirm.value
            );
            this.updateHelperText('passwordConfirmHelper', result);
            this.updateSubmitButton();
        });

        // 폼 제출 이벤트
        this.elements.form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    /**
     * 헬퍼 텍스트 업데이트
     * @private
     * @param {string} helperId - 헬퍼 요소 ID
     * @param {Object} result - 유효성 검사 결과
     */
    updateHelperText(helperId, result) {
        const helperElement = this.elements[helperId];
        if (helperElement) {
            helperElement.textContent = result.message;
            helperElement.classList.toggle('error', !result.isValid);
        }
    }

    /**
     * 제출 버튼 상태 업데이트
     * @private
     */
    updateSubmitButton() {
        const isValid = passwordChangeModel.isFormValid();
        this.elements.submitButton.disabled = !isValid;
        this.elements.submitButton.classList.toggle('active', isValid);
    }

    /**
     * 폼 제출 처리
     * @private
     * @param {Event} e - 제출 이벤트
     */
    async handleSubmit(e) {
        e.preventDefault();
        
        if (!passwordChangeModel.isFormValid()) {
            return;
        }
        
        try {
            this.elements.submitButton.disabled = true;
            this.elements.submitButton.textContent = '처리 중...';
            
            const result = await passwordChangeModel.changePassword();
            
            if (result.success) {
                alert(result.message);
                window.location.href = '/pages/profile/index.html';
            } else {
                this.updateHelperText('passwordHelper', {
                    isValid: false,
                    message: result.message
                });
                this.elements.submitButton.textContent = '수정하기';
                this.elements.submitButton.disabled = false;
            }
        } catch (error) {
            console.error('비밀번호 변경 중 오류:', error);
            this.updateHelperText('passwordHelper', {
                isValid: false,
                message: '비밀번호 변경 중 오류가 발생했습니다.'
            });
            this.elements.submitButton.textContent = '수정하기';
            this.elements.submitButton.disabled = false;
        }
    }
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    new PasswordChangePage();
});