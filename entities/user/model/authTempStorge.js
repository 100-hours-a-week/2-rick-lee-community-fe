class AuthTempStorage {
    constructor() {
        this.storage = sessionStorage;
        this.SIGNUP_FORM_KEY = 'signupForm';
        this.LOGIN_FORM_KEY = 'loginForm';
    }

    // 회원가입 폼 데이터 임시 저장
    saveSignupForm(formData) {
        try {
            this.storage.setItem(this.SIGNUP_FORM_KEY, JSON.stringify({
                data: formData,
                timestamp: new Date().toISOString()
            }));
            return { success: true };
        } catch (error) {
            console.error('회원가입 폼 임시저장 중 오류:', error);
            return { success: false, message: '임시저장 중 오류가 발생했습니다.' };
        }
    }

    // 저장된 회원가입 폼 데이터 불러오기
    getSignupForm() {
        try {
            const form = this.storage.getItem(this.SIGNUP_FORM_KEY);
            return form ? JSON.parse(form).data : null;
        } catch (error) {
            console.error('회원가입 폼 불러오기 중 오류:', error);
            return null;
        }
    }

    // 회원가입 폼 데이터 삭제
    clearSignupForm() {
        try {
            this.storage.removeItem(this.SIGNUP_FORM_KEY);
            return { success: true };
        } catch (error) {
            console.error('회원가입 폼 삭제 중 오류:', error);
            return { success: false };
        }
    }

    // 로그인 폼 데이터 임시 저장
    saveLoginForm(formData) {
        try {
            this.storage.setItem(this.LOGIN_FORM_KEY, JSON.stringify({
                data: formData,
                timestamp: new Date().toISOString()
            }));
            return { success: true };
        } catch (error) {
            console.error('로그인 폼 임시저장 중 오류:', error);
            return { success: false, message: '임시저장 중 오류가 발생했습니다.' };
        }
    }

    // 로그인 폼 데이터 삭제
    clearLoginForm() {
        try {
            this.storage.removeItem(this.LOGIN_FORM_KEY);
            return { success: true };
        } catch (error) {
            console.error('로그인 폼 삭제 중 오류:', error);
            return { success: false };
        }
    }


// 저장된 로그인 폼 데이터 불러오기
    getLoginForm() {
        try {
            const form = this.storage.getItem(this.LOGIN_FORM_KEY);
            return form ? JSON.parse(form).data : null;
        } catch (error) {
            console.error('로그인 폼 불러오기 중 오류:', error);
            return null;
        }
    }
}
export const authTempStorage = new AuthTempStorage();