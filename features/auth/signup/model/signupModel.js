// features/auth/signup/model/signupModel.js

import { VALIDATION_RULES } from './validation.js';
import { signupApi } from '/entities/user/api/signupApi.js';
import { authTempStorage } from '/entities/user/model/authTempStorge.js';

/**
 * SignupModel 클래스
 * 회원가입 관련 비즈니스 로직과 데이터 관리를 담당
 * 
 * 주요 기능:
 * - 폼 데이터 유효성 검사
 * - 회원가입 API 요청 처리
 * - 임시 데이터 저장 관리
 */
class SignupModel {
    /**
     * SignupModel 생성자
     * 자동 저장 관련 설정 초기화
     */
    constructor() {
        this.DEBOUNCE_DELAY = 500;
        this.debounceTimer = null;
        this.formData = {};
    }

    /**
     * 단일 필드 유효성 검사
     * @param {string} field - 검사할 필드명
     * @param {string} value - 검사할 값
     * @param {Object} formData - 전체 폼 데이터 (비밀번호 확인 등에 필요)
     * @returns {Object} 유효성 검사 결과 ({isValid, message})
     */
    validateField(field, value, formData = {}) {
        // 유효성 검사가 필요한 필드가 아닌 경우 항상 유효하다고 처리
        if (!VALIDATION_RULES[field]) {
            return {
                isValid: true,
                message: ''
            };
        }

        // 빈 값 체크
        if (!value && VALIDATION_RULES[field].required) {
            return {
                isValid: false,
                message: VALIDATION_RULES[field].required
            };
        }

        // 값이 없고 필수가 아닌 경우 유효하다고 처리
        if (!value) {
            return {
                isValid: true,
                message: ''
            };
        }

        // 패턴 검사
        if (VALIDATION_RULES[field].pattern && !VALIDATION_RULES[field].pattern.test(value)) {
            return {
                isValid: false,
                message: VALIDATION_RULES[field].invalid
            };
        }

        // 비밀번호 확인 검사
        if (field === 'passwordConfirm' && value !== formData.password) {
            return {
                isValid: false,
                message: VALIDATION_RULES.passwordConfirm.mismatch
            };
        }

        // 닉네임 길이 검사
        if (field === 'nickname' && value.length > 10) {
            return {
                isValid: false,
                message: '닉네임은 최대 10자까지 작성 가능합니다.'
            };
        }

        return {
            isValid: true,
            message: ''
        };
    }

    /**
     * 전체 폼 데이터 유효성 검사
     * @param {Object} formData - 검사할 폼 데이터
     * @returns {Object} 유효성 검사 결과
     */
    validateForm(formData) {
        for (const [field, value] of Object.entries(formData)) {
            const validation = this.validateField(field, value, formData);
            if (!validation.isValid) {
                return {
                    isValid: false,
                    field,
                    message: validation.message
                };
            }
        }
        return { isValid: true };
    }

    /**
     * 회원가입 처리
     * @param {Object} formData - 회원가입 폼 데이터
     * @returns {Promise<Object>} 회원가입 결과
     */
    async signup(formData) {
        try {
            // 전체 폼 유효성 검사
            const validation = this.validateForm(formData);
            if (!validation.isValid) {
                return {
                    success: false,
                    field: validation.field,
                    message: validation.message
                };
            }

            // API 요청 데이터 구성
            const requestData = {
                email: formData.email,
                password: 'ACAD0EB' + formData.password + '7F6AEE',
                nickname: formData.nickname,
                profile_image: formData.profile_image || null
            };

            // API 호출 및 결과 처리
            const result = await signupApi.register(requestData);
            
            if (result.success) {
                this.clearSavedData(); // 성공 시 임시 데이터 삭제
                return {
                    success: true,
                    message: '회원가입이 완료되었습니다.',
                    data: result.data
                };
            }

            return {
                success: false,
                field: this.getErrorField(result.message),
                message: this.getErrorMessage(result.message)
            };

        } catch (error) {
            console.error('회원가입 처리 중 오류:', error);
            return {
                success: false,
                message: '회원가입 처리 중 오류가 발생했습니다.'
            };
        }
    }

    /**
     * 임시 저장된 폼 데이터 저장
     * @param {Object} formData - 저장할 폼 데이터
     */
    saveFormData(formData) {
        authTempStorage.saveSignupForm(formData);
    }

    /**
     * 임시 저장된 폼 데이터 조회
     * @returns {Object|null} 저장된 폼 데이터
     */
    getSavedFormData() {
        return authTempStorage.getSignupForm();
    }

    /**
     * 임시 저장 데이터 삭제
     */
    clearSavedData() {
        authTempStorage.clearSignupForm();
    }

    /**
     * API 에러 메시지에 해당하는 필드 반환
     * @private
     */
    getErrorField(errorMessage) {
        const errorMap = {
            'duplicate_email': 'email',
            'duplicate_nickname': 'nickname',
            'invalid_request': 'form'
        };
        return errorMap[errorMessage] || 'form';
    }

    /**
     * API 에러 메시지를 사용자 친화적인 메시지로 변환
     * @private
     */
    getErrorMessage(errorMessage) {
        const messageMap = {
            'duplicate_email': VALIDATION_RULES.email.duplicate,
            'duplicate_nickname': VALIDATION_RULES.nickname.duplicate,
            'invalid_request': '입력 정보를 확인해주세요.'
        };
        return messageMap[errorMessage] || '회원가입 처리 중 오류가 발생했습니다.';
    }
}

export const signupModel = new SignupModel();