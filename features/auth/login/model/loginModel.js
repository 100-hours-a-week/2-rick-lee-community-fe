// features/auth/login/model/loginModel.js
import { loginApi } from '/entities/user/api/loginApi.js';

export class LoginModel {
    constructor() {
        this.formData = {
            email: '',
            password: ''
        };
    }

    /**
     * 이메일 유효성 검사
     * @param {string} email 
     * @returns {Object} 검사 결과
     */
    validateEmail(email) {
        if (!email) {
            return {
                isValid: false,
                message: '이메일을 입력해주세요.'
            };
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            return {
                isValid: false,
                message: '올바른 이메일 형식이 아닙니다.'
            };
        }

        return {
            isValid: true,
            message: '올바른 이메일 형식입니다.'
        };
    }

    /**
     * 비밀번호 유효성 검사
     * @param {string} password 
     * @returns {Object} 검사 결과
     */
    validatePassword(password) {
        if (!password) {
            return {
                isValid: false,
                message: '비밀번호를 입력해주세요.'
            };
        }

        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordPattern.test(password)) {
            return {
                isValid: false,
                message: '비밀번호는 8자 이상이며, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.'
            };
        }

        return {
            isValid: true,
            message: '올바른 비밀번호 형식입니다.'
        };
    }

    /**
     * 로그인 처리
     * @returns {Promise<Object>} 로그인 결과
     */
    async login() {
        const validation = this.validateForm();
        if (!validation.isValid) {
            return validation;
        }

        try {
            return await loginApi.login(
                this.formData.email,
                this.formData.password
            );
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: '로그인 처리 중 오류가 발생했습니다.'
            };
        }
    }

    /**
     * 폼 데이터 업데이트
     * @param {string} field 
     * @param {string} value 
     */
    updateFormData(field, value) {
        this.formData[field] = value.trim();
        return field === 'email' ? 
            this.validateEmail(value) : 
            this.validatePassword(value);
    }

    /**
     * 전체 폼 유효성 검사
     * @returns {Object} 검사 결과
     */
    validateForm() {
        const emailValidation = this.validateEmail(this.formData.email);
        if (!emailValidation.isValid) {
            return {
                field: 'email',
                ...emailValidation
            };
        }

        const passwordValidation = this.validatePassword(this.formData.password);
        if (!passwordValidation.isValid) {
            return {
                field: 'password',
                ...passwordValidation
            };
        }

        return { isValid: true };
    }
}

export const loginModel = new LoginModel();