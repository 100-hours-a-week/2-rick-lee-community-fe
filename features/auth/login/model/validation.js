// features/auth/login/model/validation.js
// 로그인창의 유효성을 검사하는 로직
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

export const validateEmail = (email) => {
    if (!email) return '이메일을 입력해주세요.';
    if (!emailRegex.test(email)) return '올바른 이메일 주소 형식을 입력해주세요.';
    return '';
};

export const validatePassword = (password) => {
    if (!password) return '비밀번호를 입력해주세요.';
    if (!passwordRegex.test(password)) return '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
    return '';
};