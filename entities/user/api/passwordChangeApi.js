import BaseApi from '/entities/BaseApi';

export class PasswordChangeApi extends BaseApi {
constructor() {
    super('http://localhost:8080');
}

/**
 * 비밀번호 변경 요청 처리 메서드
 * @param {string} newPassword - 새 비밀번호
 * @returns {Promise<Object>} 비밀번호 변경 결과 (성공 여부, 메시지, 데이터)
 */
async changePassword(newPassword) {
    const token = localStorage.getItem('authToken');
    if (!token) {
    return { success: false, message: '로그인이 필요합니다.' };
    }

    try {
    const payload = { new_password: newPassword };
    const data = await this.request('/users/password', {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    return {
        success: true,
        message: '비밀번호가 성공적으로 변경되었습니다.',
        data,
    };
    } catch (error) {
    return {
        success: false,
        message: error.message || '네트워크 오류가 발생했습니다.',
    };
    }
}
}

export const passwordChangeApi = new PasswordChangeApi();
