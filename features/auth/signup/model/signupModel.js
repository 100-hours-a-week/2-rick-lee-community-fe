/**
 * 회원가입 모델 모듈
 * @module signupModel
 */
import { VALIDATION_RULES } from './validation.js';
import { signupApi } from '/entities/user/api/signupApi.js';
import { authTempStorage } from '/entities/user/model/authTempStorge.js';
import { ImageError } from '/utilities/image/imageConfig.js';

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

        // 사용자명 길이 검사
        if (field === 'username' && value.length > 20) {
            return {
                isValid: false,
                message: '사용자명은 최대 20자까지 작성 가능합니다.'
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
        // 필수 필드 확인
        const requiredFields = ['email', 'password', 'passwordConfirm', 'username'];
        
        for (const field of requiredFields) {
            if (!formData[field] && field !== 'passwordConfirm') {
                return {
                    isValid: false,
                    field,
                    message: VALIDATION_RULES[field]?.required || `${field} is required`
                };
            }
        }

        // 모든 필드 유효성 검사
        for (const [field, value] of Object.entries(formData)) {
            // profileImage는 별도로 처리하므로 여기서는 건너뜀
            if (field === 'profileImage') continue;
            
            // 각 필드 검사
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

            // API 요청 데이터 구성 (multipart/form-data로 전송하기 위한 FormData 객체)
            const requestFormData = new FormData();
            
            // 기본 필드 추가
            requestFormData.append('username', formData.username);
            requestFormData.append('email', formData.email);
            requestFormData.append('password', formData.password);
            
            // 프로필 이미지가 있고 기본 이미지가 아닌 경우에만 추가
            if (formData.profileImage && formData.profileImage.file && !formData.profileImage.isDefault) {
                requestFormData.append('profile_image', formData.profileImage.file);
            }

            // API 호출 및 결과 처리
            const result = await signupApi.register(requestFormData);
            
            if (result.success) {
                this.clearSavedData(); // 성공 시 임시 데이터 삭제
                return {
                    success: true,
                    message: result.message || '회원가입이 완료되었습니다.',
                    data: result.data
                };
            }

            return {
                success: false,
                field: this.getErrorField(result.message),
                message: result.message || '회원가입에 실패했습니다.'
            };

        } catch (error) {
            console.error('회원가입 처리 중 오류:', error);
            
            // ImageError 처리
            if (error instanceof ImageError) {
                return {
                    success: false,
                    field: 'profileImage',
                    message: error.message
                };
            }
            
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
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            // 저장할 데이터 준비 (깊은 복사 대신 필요한 필드만 추출)
            const dataToSave = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                passwordConfirm: formData.passwordConfirm
            };
            
            // 프로필 이미지 데이터 추가 (있는 경우)
            if (formData.profileImage && formData.profileImage.dataURL) {
                dataToSave.profileImageURL = formData.profileImage.dataURL;
            }
            
            authTempStorage.saveSignupForm(dataToSave);
        }, this.DEBOUNCE_DELAY);
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
        // 백엔드 에러 메시지에 따른 필드 매핑
        const errorFieldMap = {
            'duplicate_email': 'email',
            'duplicate_username': 'username',
            'invalid_email': 'email',
            'invalid_password': 'password',
            'invalid_image': 'profileImage',
            'invalid_request': 'form',
            'validation_error': 'form'
        };
        
        return errorFieldMap[errorMessage] || 'form';
    }
}

export const signupModel = new SignupModel();