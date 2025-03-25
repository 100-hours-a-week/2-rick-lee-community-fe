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

        // 백엔드 요구사항에 맞는 비밀번호 패턴
        // 8자 이상, 대문자, 소문자, 숫자, 특수문자 포함
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
            return {
                success: false,
                message: validation.message,
                field: validation.field
            };
        }

        try {
            // loginApi 호출
            const result = await loginApi.login(
                this.formData.email,
                this.formData.password
            );

            // 로그인 성공 시
            if (result.success) {
                // 사용자 데이터 저장
                loginApi.saveUserData(result.data);
                
                return {
                    success: true,
                    message: '로그인에 성공했습니다.',
                    data: result.data
                };
            }
            
            // 로그인 실패 시
            return {
                success: false,
                message: result.message || '로그인에 실패했습니다.',
                field: this.getErrorField(result.message)
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: '로그인 처리 중 오류가 발생했습니다.',
                field: 'form'
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
                isValid: false,
                field: 'email',
                message: emailValidation.message
            };
        }

        const passwordValidation = this.validatePassword(this.formData.password);
        if (!passwordValidation.isValid) {
            return {
                isValid: false,
                field: 'password',
                message: passwordValidation.message
            };
        }

        return { isValid: true };
    }

    /**
     * 에러 메시지에 해당하는 필드 반환
     * @private
     */
    getErrorField(errorMessage) {
        // 백엔드 에러 메시지에 따른 필드 매핑
        const errorFieldMap = {
            'invalid_credentials': 'password', // 이메일 또는 비밀번호가 일치하지 않음
            'user_not_found': 'email',         // 사용자를 찾을 수 없음
            'invalid_request': 'form',         // 잘못된 요청
            'unauthorized': 'form'             // 인증 실패
        };
        
        return errorFieldMap[errorMessage] || 'form';
    }
}

export const loginModel = new LoginModel();