import { userStorage } from '/entities/user/model/userStorage.js';
import { signupAutosave } from './model/signupAutosave.js';

class SignupHandler {
    constructor() {
        // DOM Elements
        this.form = document.getElementById('signupForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.passwordConfirmInput = document.getElementById('passwordConfirm');
        this.nicknameInput = document.getElementById('nickname');
        this.profileInput = document.getElementById('profileInput');
        this.profilePreview = document.getElementById('profilePreview');
        this.backButton = document.querySelector('.back-button');
        this.loginButton = document.querySelector('.login-button');

        // Validation Patterns
        this.emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        this.passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
        this.nicknameRegex = /^[a-zA-Z0-9가-힣]{2,10}$/;

        this.initializeEventListeners();
    }

    // Helper text update
    updateHelperText(element, message, isError = false) {
        const helperText = element.nextElementSibling;
        helperText.textContent = message;
        helperText.className = `helper-text ${isError ? 'error-text' : ''}`;
        element.className = isError ? 'error' : '';
    }

    // Validation methods
    validateEmail(email) {
        if (!email) return '이메일을 입력해주세요.';
        if (!this.emailRegex.test(email)) return '올바른 이메일 형식이 아닙니다.';
        if (userStorage.getAllUsers().some(user => user.email === email)) {
            return '이미 등록된 이메일입니다.';
        }
        return '';
    }

    validatePassword(password) {
        if (!password) return '비밀번호를 입력해주세요.';
        if (!this.passwordRegex.test(password)) {
            return '비밀번호는 8~20자의 영문 대/소문자, 숫자, 특수문자를 포함해야 합니다.';
        }
        return '';
    }

    validatePasswordConfirm(password, confirmPassword) {
        if (!confirmPassword) return '비밀번호 확인을 입력해주세요.';
        if (password !== confirmPassword) return '비밀번호가 일치하지 않습니다.';
        return '';
    }

    validateNickname(nickname) {
        if (!nickname) return '닉네임을 입력해주세요.';
        if (!this.nicknameRegex.test(nickname)) {
            return '닉네임은 2~10자의 한글, 영문, 숫자만 가능합니다.';
        }
        return '';
    }

    // Event handlers
    handleProfileClick = () => {
        this.profileInput.click();
    }

    handleSubmit = async (e) => {
        e.preventDefault();

        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        const passwordConfirm = this.passwordConfirmInput.value;
        const nickname = this.nicknameInput.value.trim();

        // Validate all fields
        const emailError = this.validateEmail(email);
        const passwordError = this.validatePassword(password);
        const passwordConfirmError = this.validatePasswordConfirm(password, passwordConfirm);
        const nicknameError = this.validateNickname(nickname);

        if (emailError || passwordError || passwordConfirmError || nicknameError) {
            if (emailError) this.updateHelperText(this.emailInput, emailError, true);
            if (passwordError) this.updateHelperText(this.passwordInput, passwordError, true);
            if (passwordConfirmError) this.updateHelperText(this.passwordConfirmInput, passwordConfirmError, true);
            if (nicknameError) this.updateHelperText(this.nicknameInput, nicknameError, true);
            return;
        }

        try {
            const userData = {
                email,
                password: 'ACAD0EB' + password + '7F6AEE',
                nickname,
                profileImage: this.profilePreview.src
            };

            const result = userStorage.registerUser(userData);

            if (result.success) {
                signupAutosave.clearSavedData();
                alert(result.message);
                window.location.href = '/pages/auth/login/index.html';
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('회원가입 처리 중 오류가 발생했습니다.');
        }
    }

    initializeEventListeners() {
        // 실시간 유효성 검사
        this.emailInput.addEventListener('input', () => {
            const error = this.validateEmail(this.emailInput.value.trim());
            this.updateHelperText(this.emailInput, error || '사용 가능한 이메일입니다.', !!error);
        });

        this.passwordInput.addEventListener('input', () => {
            const error = this.validatePassword(this.passwordInput.value);
            this.updateHelperText(this.passwordInput, error || '올바른 비밀번호 형식입니다.', !!error);
        });

        this.passwordConfirmInput.addEventListener('input', () => {
            const error = this.validatePasswordConfirm(
                this.passwordInput.value,
                this.passwordConfirmInput.value
            );
            this.updateHelperText(this.passwordConfirmInput, error || '비밀번호가 일치합니다.', !!error);
        });

        this.nicknameInput.addEventListener('input', () => {
            const error = this.validateNickname(this.nicknameInput.value.trim());
            this.updateHelperText(this.nicknameInput, error || '사용 가능한 닉네임입니다.', !!error);
        });

        // 프로필 이미지
        this.profilePreview.addEventListener('click', this.handleProfileClick);

        // 폼 제출
        this.form.addEventListener('submit', this.handleSubmit);

        // 네비게이션
        this.backButton.addEventListener('click', () => window.history.back());
        this.loginButton.addEventListener('click', () => {
            window.location.href = '/pages/auth/login/index.html';
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const signupHandler = new SignupHandler();
    signupAutosave.init();
});