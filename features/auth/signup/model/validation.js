// features/auth/signup/model/validation.js

/**
 * 회원가입 유효성 검사 규칙 및 메시지
 */
export const VALIDATION_RULES = {
    email: {
        required: '이메일을 입력해주세요.',
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        invalid: '올바른 이메일 주소 형식을 입력해주세요.',
        duplicate: '이미 사용중인 이메일입니다.'
    },
    password: {
        required: '비밀번호를 입력해주세요.',
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
        invalid: '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.',
        mismatch: '비밀번호가 다릅니다.'
    },
    passwordConfirm: {
        required: '비밀번호를 한 번 더 입력해주세요.',
        mismatch: '비밀번호가 다릅니다.'
    },
    nickname: {
        required: '닉네임을 입력해주세요.',
        pattern: /^[^\s]{1,10}$/,
        invalid: '닉네임은 최대 10자까지 작성 가능하며, 띄어쓰기는 불가능합니다.',
        duplicate: '이미 사용중인 닉네임입니다.'
    }
};