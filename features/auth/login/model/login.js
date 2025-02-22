// features/auth/login/model/login.js
export const processLogin = async (email, password, userStorage, authTempStorage) => {
    const encryptedPassword = 'ACAD0EB' + password + '7F6AEE';
    try {
        const result = userStorage.login(email, encryptedPassword);
        
        if (result.success) {
            authTempStorage.clearLoginForm();
            return { 
                success: true, 
                redirectUrl: '/pages/post/list/index.html' 
            };
        }
        
        return {
            success: false,
            message: result.message || '이메일 또는 비밀번호가 일치하지 않습니다.'
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            message: '로그인 처리 중 오류가 발생했습니다.'
        };
    }
};