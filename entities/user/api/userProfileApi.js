// entities/user/api/profileModifyApi.js

/**
* 프로필 수정 API 클래스
* 회원정보 수정 및 삭제 요청 처리를 담당
*/
export class ProfileModifyApi {
    constructor() {
        this.API_BASE_URL = 'https://api.example.com';
    }
 
    /**
     * 프로필 정보 수정 요청 처리
     * @param {Object} profileData - 수정할 프로필 정보
     * @param {string} profileData.nickname - 닉네임
     * @param {File} [profileData.profile_image] - 프로필 이미지 파일(선택)
     * @returns {Promise<Object>} 수정 결과
     */
    async updateProfile(profileData) {
        try {
            const token = localStorage.getItem('jwt');
            const formData = new FormData();
            formData.append('nickname', profileData.nickname);
            
            if (profileData.profile_image) {
                formData.append('profile_image', profileData.profile_image);
            }
 
            const response = await fetch(`${this.API_BASE_URL}/users`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
 
            const data = await response.json();
 
            switch (response.status) {
                case 200:
                    return {
                        success: true,
                        data: data.data,
                        message: '프로필이 수정되었습니다.'
                    };
                case 400:
                    return {
                        success: false,
                        message: '입력 정보를 확인해주세요.'
                    };
                case 401:
                    return {
                        success: false,
                        message: '로그인이 필요합니다.'
                    };
                case 409:
                    return {
                        success: false,
                        message: '이미 사용중인 닉네임입니다.'
                    };
                case 500:
                    return {
                        success: false,
                        message: '서버 오류가 발생했습니다.'
                    };
                default:
                    return {
                        success: false,
                        message: '알 수 없는 오류가 발생했습니다.'
                    };
            }
        } catch (error) {
            console.error('프로필 수정 요청 중 오류:', error);
            return {
                success: false,
                message: '네트워크 오류가 발생했습니다.'
            };
        }
    }
 
    /**
     * 회원 탈퇴 요청 처리
     * @returns {Promise<Object>} 탈퇴 처리 결과
     */
    async deleteAccount() {
        try {
            const token = localStorage.getItem('jwt');
            const response = await fetch(`${this.API_BASE_URL}/users`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
 
            const data = await response.json();
 
            switch (response.status) {
                case 200:
                    return {
                        success: true,
                        message: '회원 탈퇴가 완료되었습니다.'
                    };
                case 401:
                    return {
                        success: false,
                        message: '로그인이 필요합니다.'
                    };
                case 500:
                    return {
                        success: false,
                        message: '서버 오류가 발생했습니다.'
                    };
                default:
                    return {
                        success: false,
                        message: '알 수 없는 오류가 발생했습니다.'
                    };
            }
        } catch (error) {
            console.error('회원 탈퇴 요청 중 오류:', error);
            return {
                success: false,
                message: '네트워크 오류가 발생했습니다.'
            };
        }
    }
 }
 
 export const profileModifyApi = new ProfileModifyApi();