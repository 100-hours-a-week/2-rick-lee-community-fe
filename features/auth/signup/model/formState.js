// features/auth/signup/model/formState.js

/**
 * 회원가입 폼의 상태를 관리하는 클래스
 */
export class FormState {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.state = {
            email: '',
            password: '',
            passwordConfirm: '',
            nickname: '',
            profileImage: null,
            validation: {
                email: false,
                password: false,
                passwordConfirm: false,
                nickname: false
            }
        };
    }

    /**
     * 상태 업데이트
     * @param {string} key - 업데이트할 상태 키
     * @param {any} value - 새로운 값
     */
    updateState(key, value) {
        this.state[key] = value;
        this.eventEmitter.emit('stateChange', { key, value });
    }

    /**
     * 유효성 상태 업데이트
     * @param {string} key - 필드 이름
     * @param {boolean} isValid - 유효성 여부
     */
    updateValidation(key, isValid) {
        this.state.validation[key] = isValid;
        this.eventEmitter.emit('validationChange', this.state.validation);
    }

    /**
     * 전체 폼의 유효성 여부 확인
     */
    isFormValid() {
        return Object.values(this.state.validation).every(v => v);
    }
}