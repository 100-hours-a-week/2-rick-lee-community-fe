// features/profile/modify/model/profileModifyModel.js
import { profileApi } from '/entities/user/api/profileApi.js';

export class ProfileModifyModel {
    /**
     * 닉네임 유효성 검사
     * @param {string} nickname - 검사할 닉네임
     * @returns {Object} 검사 결과
     */
    validateNickname(nickname) {
        if (!nickname || nickname.trim().length === 0) {
            return {
                isValid: false,
                message: '닉네임을 입력해 주세요'
            };
        }

        if (nickname.length > 10) {
            return {
                isValid: false,
                message: '닉네임은 최대 10자까지 가능합니다'
            };
        }

        return {
            isValid: true,
            message: ''
        };
    }

    /**
     * 프로필 정보 조회 요청
     */
    async getProfile() {
        return await profileApi.getProfile();
    }

    /**
     * 닉네임 중복 확인
     * @param {string} nickname - 확인할 닉네임
     * @returns {Promise<Object>} 중복 확인 결과
     */
    async checkNicknameDuplicate(nickname) {
        try {
            // 닉네임 형식 검증
            const validation = this.validateNickname(nickname);
            if (!validation.isValid) {
                return {
                    success: false,
                    message: validation.message
                };
            }
            
            // 서버에 닉네임 중복 확인 요청
            // 실제로는 서버에 요청을 보내야 하지만, 현재 백엔드 API가 없기 때문에
            // updateProfile을 활용하여 중복 여부 확인
            const mockData = {
                nickname: nickname,
                profileImg: null
            };
            
            const result = await profileApi.checkNickname(mockData);
            return result;
        } catch (error) {
            console.error('닉네임 중복 확인 중 오류:', error);
            return {
                success: false,
                message: '닉네임 중복 확인 중 오류가 발생했습니다.'
            };
        }
    }
    
    /**
     * 닉네임 중복 확인
     * @param {string} nickname - 확인할 닉네임
     * @returns {Promise<Object>} 중복 확인 결과
     */
    async checkNicknameDuplicate(nickname) {
        // 기본 유효성 검사
        const validation = this.validateNickname(nickname);
        if (!validation.isValid) {
            return {
                success: false,
                message: validation.message
            };
        }

        // API 호출하여 중복 확인
        const result = await profileApi.checkNickname(nickname);
        return result;
    }

    /**
     * 프로필 수정 요청
     */
    async updateProfile(profileData) {
        const validation = this.validateNickname(profileData.nickname);
        if (!validation.isValid) {
            return {
                success: false,
                message: validation.message
            };
        }

        const result = await profileApi.updateProfile(profileData);
        if (!result.success && result.message === 'duplicate_nickname') {
            return {
                success: false,
                message: '이미 사용중인 닉네임 입니다'
            };
        }

        return result;
    }

    /**
     * 회원 탈퇴 요청
     */
    async deleteAccount() {
        return await profileApi.deleteAccount();
    }
}

export const profileModifyModel = new ProfileModifyModel();