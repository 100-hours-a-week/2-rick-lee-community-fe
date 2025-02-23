// features/profile/modify/model/profileModifyModel.js
import { profileModifyApi } from '/entities/user/api/userProfileApi.js';

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

        const result = await profileModifyApi.updateProfile(profileData);
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
        return await profileModifyApi.deleteAccount();
    }
}

export const profileModifyModel = new ProfileModifyModel();