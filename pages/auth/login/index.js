// pages/auth/login/index.js

/**
 * 로그인 페이지의 메인 JavaScript 파일
 * 폼 제출, 실시간 유효성 검사, 에러 표시 등을 처리
 */

// 외부 모듈 import
import { validateEmail, validatePassword } from '/features/auth/login/model/validation.js';
import { updateHelperText } from '/features/auth/login/ui/helpers.js';
import { userApi } from '/entities/user/api/loginApi.js';

/**
 * DOM 요소 선택
 * 로그인 폼과 관련된 모든 HTML 요소들을 참조
 */
const loginForm = document.querySelector('form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailHelper = document.getElementById('email-helper');
const passwordHelper = document.getElementById('password-helper');
const signupButton = document.querySelector('.signup-button');

/**
 * 로그인 처리 함수
 * @param {string} email - 사용자 이메일
 * @param {string} password - 사용자 비밀번호
 * @returns {Promise<void>}
 */
const handleLogin = async (email, password) => {
    try {
        const loginResult = await userApi.login(email, password);
        
        if (loginResult.success) {
            alert('로그인에 성공했습니다.');
            // 로그인 성공 시 게시글 목록 페이지로 이동
            window.location.href = '/pages/post/list/index.html';
        } else {
            // 로그인 실패 시 에러 메시지 표시
            updateHelperText(
                passwordInput, 
                passwordHelper, 
                loginResult.message, 
                true
            );
        }
    } catch (error) {
        console.error('로그인 처리 중 오류:', error);
        updateHelperText(
            passwordInput, 
            passwordHelper, 
            '로그인 처리 중 오류가 발생했습니다.', 
            true
        );
    }
};

/**
 * 폼 제출 이벤트 핸들러
 * 입력값 유효성 검사 후 로그인 처리
 */
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // 이메일 유효성 검사
    const emailError = validateEmail(email);
    if (emailError) {
        updateHelperText(emailInput, emailHelper, emailError, true);
        return;
    }

    // 비밀번호 유효성 검사
    const passwordError = validatePassword(password);
    if (passwordError) {
        updateHelperText(passwordInput, passwordHelper, passwordError, true);
        return;
    }

    // 로그인 처리
    await handleLogin(email, password);
});

/**
 * 실시간 이메일 유효성 검사
 * 사용자가 입력할 때마다 이메일 형식 검사
 */
emailInput.addEventListener('input', () => {
    const error = validateEmail(emailInput.value.trim());
    updateHelperText(
        emailInput, 
        emailHelper, 
        error || '* 올바른 이메일 형식입니다.', 
        !!error
    );
});

/**
 * 실시간 비밀번호 유효성 검사
 * 사용자가 입력할 때마다 비밀번호 형식 검사
 */
passwordInput.addEventListener('input', () => {
    const error = validatePassword(passwordInput.value.trim());
    updateHelperText(
        passwordInput, 
        passwordHelper, 
        error || '* 올바른 비밀번호 형식입니다.', 
        !!error
    );
});

/**
 * 회원가입 페이지 이동 핸들러
 * 회원가입 버튼 클릭 시 회원가입 페이지로 이동
 */
signupButton.addEventListener('click', () => {
    window.location.href = '/pages/auth/signup/index.html';
});