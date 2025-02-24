// features/profile/changePassword/passwordChangeModel.js
import { passwordChangeApi } from '/entities/user/api/passwordChangeApi.js';

/**
 * 비밀번호 변경 모델 클래스
 * 비밀번호 유효성 검사 및 변경 로직 담당
 */
export class PasswordChangeModel {
    constructor() {
        this.formData = {
            newPassword: '',
            passwordConfirm: ''
        };
        
        this.validationRules = {
            password: {
                required: '비밀번호를 입력해주세요.',
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
                invalid: '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.',
                mismatch: '비밀번호가 다릅니다.'
            }
        };
    }

    /**
     * 비밀번호 유효성 검사
     * @param {string} password - 검사할 비밀번호
     * @returns {Object} 검사 결과
     */
    validatePassword(password) {
        if (!password) {
            return {
                isValid: false,
                message: this.validationRules.password.required
            };
        }

        if (!this.validationRules.password.pattern.test(password)) {
            return {
                isValid: false,
                message: this.validationRules.password.invalid
            };
        }

        return {
            isValid: true,
            message: '유효한 비밀번호입니다.'
        };
    }

    /**
     * 비밀번호 확인 유효성 검사
     * @param {string} passwordConfirm - 비밀번호 확인 값
     * @param {string} password - 원본 비밀번호
     * @returns {Object} 검사 결과
     */
    validatePasswordConfirm(passwordConfirm, password) {
        if (!passwordConfirm) {
            return {
                isValid: false,
                message: '비밀번호 확인을 입력해주세요.'
            };
        }

        if (passwordConfirm !== password) {
            return {
                isValid: false,
                message: this.validationRules.password.mismatch
            };
        }

        return {
            isValid: true,
            message: '비밀번호가 일치합니다.'
        };
    }

    /**
     * 폼 데이터 업데이트
     * @param {string} field - 필드명
     * @param {string} value - 필드 값
     * @returns {Object} 유효성 검사 결과
     */
    updateFormData(field, value) {
        this.formData[field] = value;
        
        if (field === 'newPassword') {
            return this.validatePassword(value);
        } else if (field === 'passwordConfirm') {
            return this.validatePasswordConfirm(value, this.formData.newPassword);
        }
    }

    /**
     * 폼 전체 유효성 검사
     * @returns {boolean} 폼 유효성 상태
     */
    isFormValid() {
        const passwordValid = this.validatePassword(this.formData.newPassword).isValid;
        const confirmValid = this.validatePasswordConfirm(
            this.formData.passwordConfirm, 
            this.formData.newPassword
        ).isValid;
        
        return passwordValid && confirmValid;
    }

    /**
     * 비밀번호 변경 요청
     * @returns {Promise<Object>} 변경 결과
     */
    async changePassword() {
        if (!this.isFormValid()) {
            return {
                success: false,
                message: '입력 정보를 확인해주세요.'
            };
        }

        return await passwordChangeApi.changePassword({
            newPassword: this.formData.newPassword
        });
    }
}

export const passwordChangeModel = new PasswordChangeModel();