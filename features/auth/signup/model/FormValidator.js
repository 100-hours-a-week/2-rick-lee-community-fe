//유효성 검사

export class FormValidator {
    static VALIDATION_MESSAGES = {
        REQUIRED: {
            email: '이메일을 입력해주세요.',
            password: '비밀번호를 입력해주세요.',
            passwordConfirm: '비밀번호를 한번 더 입력해주세요.',
            nickname: '닉네임을 입력해주세요.'
        },
        INVALID: {
            email: '유효한 이메일 주소 형식을 입력해주세요. (예: example@example.com)',
            password: '비밀번호는 8글자 이상, 특수문자를 포함해야 합니다.',
            passwordConfirm: '비밀번호가 일치하지 않습니다.',
            nickname: '닉네임은 10글자 이내로 입력해주세요.'
        },
        DUPLICATE: {
            email: '중복된 이메일입니다.',
            nickname: '중복된 닉네임입니다.'
        },
        SUCCESS: {
            email: '사용 가능한 이메일입니다.',
            password: '사용 가능한 비밀번호입니다.',
            passwordConfirm: '비밀번호가 일치합니다.',
            nickname: '사용 가능한 닉네임입니다.'
        }
    };

    constructor(signupPage) {
        this.signupPage = signupPage;
        this.inputs = signupPage.inputs;
        this.helperTexts = signupPage.helperTexts;
        this.buttons = signupPage.buttons;
        this.validationState = {
            email: false,
            password: false,
            passwordConfirm: false,
            nickname: false
        };
    }

    initialize() {
        console.log("FormValidator init 정상호출")
        this.setupValidationEvents();
        // 초기 상태 검증을 위해 각 필드 검사
        Object.entries(this.inputs)
            .filter(([key]) => key !== 'profileImage')
            .forEach(([key, input]) => {
                if (input.value) {
                    this.validateField(key, input.value);
                }
            });
    }
    validateField(field, value) {
        console.log(`FormValidator.validateField called for ${field} with value: ${value}`); // 디버깅 추가
        
        const validation = this.getValidationResult(field, value);
        console.log('Validation result:', validation); // 디버깅 추가
        
        this.validationState[field] = validation.isValid;
        this.updateHelperText(field, validation.message, validation.status);
        this.updateSubmitButton();
    }

    setupValidationEvents() {
        // 각 입력 필드에 대한 이벤트 리스너 설정
        Object.entries(this.inputs)
            .filter(([key]) => key !== 'profileImage')
            .forEach(([key, input]) => {
                input.addEventListener('input', () => {
                    console.log(`Validating ${key}: ${input.value}`); // 디버깅용
                    this.validateField(key, input.value);
                });

                input.addEventListener('blur', () => {
                    console.log(`Validating ${key} on blur: ${input.value}`); // 디버깅용
                    this.validateField(key, input.value);
                });

                // 비밀번호 필드의 경우, 비밀번호 확인 필드도 함께 검증
                if (key === 'password') {
                    input.addEventListener('input', () => {
                        const confirmValue = this.inputs.passwordConfirm.value;
                        if (confirmValue) {
                            this.validateField('passwordConfirm', confirmValue);
                        }
                    });
                }
            });
    }

    updateHelperText(field, message, status) {
        console.log(`Updating helper text for ${field}: ${message}, status: ${status}`); // 디버깅용
        const helperText = this.helperTexts[field];
        if (helperText) {
            helperText.textContent = message;
            helperText.classList.remove('error', 'success');
            helperText.classList.add(status);
        }
    }


    getValidationResult(field, value) {
        if (!value) {
            return {
                isValid: false,
                message: FormValidator.VALIDATION_MESSAGES.REQUIRED[field],
                status: 'error'
            };
        }

        const validators = {
            email: () => this.validateEmail(value),
            password: () => this.validatePassword(value),
            passwordConfirm: () => this.validatePasswordConfirm(value),
            nickname: () => this.validateNickname(value)
        };

        return validators[field]();
    }

    validateEmail(value) {
        if (!this.isValidEmail(value)) {
            return {
                isValid: false,
                message: FormValidator.VALIDATION_MESSAGES.INVALID.email,
                status: 'error'
            };
        }
        if (this.isEmailDuplicate(value)) {
            return {
                isValid: false,
                message: SignupPage.VALIDATION_MESSAGES.DUPLICATE.email,
                status: 'error'
            };
        }
        return {
            isValid: true,
            message: SignupPage.VALIDATION_MESSAGES.SUCCESS.email,
            status: 'success'
        };
    }
    validatePassword(value) {
        if (!this.isValidPassword(value)) {
            return {
                isValid: false,
                message: SignupPage.VALIDATION_MESSAGES.INVALID.password,
                status: 'error'
            };
        }
        return {
            isValid: true,
            message: SignupPage.VALIDATION_MESSAGES.SUCCESS.password,
            status: 'success'
        };
    }
    
    validatePasswordConfirm(value) {
        if (value !== this.inputs.password.value) {
            return {
                isValid: false,
                message: SignupPage.VALIDATION_MESSAGES.INVALID.passwordConfirm,
                status: 'error'
            };
        }
        return {
            isValid: true,
            message: SignupPage.VALIDATION_MESSAGES.SUCCESS.passwordConfirm,
            status: 'success'
        };
    }
    validateNickname(value) {
        if (value.includes(' ') || value.length > 10) {
            return {
                isValid: false,
                message: SignupPage.VALIDATION_MESSAGES.INVALID.nickname,
                status: 'error'
            };
        }
        if (this.isNicknameDuplicate(value)) {
            return {
                isValid: false,
                message: SignupPage.VALIDATION_MESSAGES.DUPLICATE.nickname,
                status: 'error'
            };
        }
        return {
            isValid: true,
            message: SignupPage.VALIDATION_MESSAGES.SUCCESS.nickname,
            status: 'success'
        };
    }
    updateSubmitButton() {
        const isAllValid = Object.values(this.validationState).every(valid => valid);
        this.buttons.signup.disabled = !isAllValid;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidPassword(password) {
        return password.length >= 8 && /[!@#$%^&*(),.?":{}|<>]/.test(password);
    }

    isEmailDuplicate(email) {
        const users = userStorage.getAllUsers();
        return users.some(user => user.email === email);
    }

    isNicknameDuplicate(nickname) {
        const users = userStorage.getAllUsers();
        return users.some(user => user.nickname === nickname);
    }
}