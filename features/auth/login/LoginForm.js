// DOM Elements
import { userStorage } from "../../../entities/user/model/userStorage.js";
import { authTempStorage } from "../../../entities/user/model/authTempStorge.js";

const loginForm = document.querySelector('form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailHelper = document.getElementById('email-helper');
const passwordHelper = document.getElementById('password-helper');
const signupButton = document.querySelector('.signup-button');

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation (8자 이상, 20자 이하, 대문자, 소문자, 숫자, 특수문자 포함)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

// Validation functions
const validateEmail = (email) => {
    if (!email) {
        return '이메일을 입력해주세요.';
    }
    if (!emailRegex.test(email)) {
        return '올바른 이메일 주소 형식을 입력해주세요.';
    }
    return '';
};

const validatePassword = (password) => {
    if (!password) {
        return '비밀번호를 입력해주세요.';
    }
    if (!passwordRegex.test(password)) {
        return '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
    }
    return '';
};

// Update helper text function
const updateHelperText = (element, helperElement, message, isError = false) => {
    helperElement.textContent = message;
    if (isError) {
        helperElement.classList.add('error-text');
        element.classList.add('error');
    } else {
        helperElement.classList.remove('error-text');
        element.classList.remove('error');
    }
};

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // 입력값 유효성 검사
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError) {
        updateHelperText(emailInput, emailHelper, emailError, true);
        return;
    }

    if (passwordError) {
        updateHelperText(passwordInput, passwordHelper, passwordError, true);
        return;
    }

    try {
        // UserStorage의 login 메서드 사용
        const encryptedPassword = 'ACAD0EB' + password + '7F6AEE'; // 비밀번호 암호화
        const result = userStorage.login(email, encryptedPassword);

        if (result.success) {
            // 로그인 성공
            // 임시 저장된 로그인 폼 데이터 삭제 (만약 authTempStorage를 사용중이라면)
            authTempStorage.clearLoginForm();
            
            // 성공 메시지 표시
            alert('로그인에 성공했습니다.');
            
            // 메인 페이지 또는 대시보드로 이동
            window.location.href = '/index.html'; // 또는 원하는 페이지 경로
        } else {
            // 로그인 실패
            updateHelperText(
                passwordInput, 
                passwordHelper, 
                result.message || '이메일 또는 비밀번호가 일치하지 않습니다.', 
                true
            );
        }
    } catch (error) {
        console.error('Login error:', error);
        updateHelperText(
            passwordInput, 
            passwordHelper, 
            '로그인 처리 중 오류가 발생했습니다.', 
            true
        );
    }
});

// Real-time validation
emailInput.addEventListener('input', () => {
    const error = validateEmail(emailInput.value.trim());
    updateHelperText(emailInput, emailHelper, error || '* 올바른 이메일 형식입니다.', !!error);
});

passwordInput.addEventListener('input', () => {
    const error = validatePassword(passwordInput.value.trim());
    updateHelperText(passwordInput, passwordHelper, error || '* 올바른 비밀번호 형식입니다.', !!error);
});

signupButton.addEventListener('click', () => {
    window.location.href = '../pages/signup.html';
});

