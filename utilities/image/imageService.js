// utilities/image/imageService.js
import config from '/utilities/config.js';
import { ImageError } from './imageConfig.js';

export class ImageService {
    constructor() {
        this.apiUrl = config.API_BASE_URL;
    }

    /**
     * 프로필 이미지 업로드
     * @param {File} file - 업로드할 이미지 파일
     * @param {string} token - 인증 토큰 (있는 경우)
     * @returns {Promise<string>} 업로드된 이미지 URL
     * @throws {ImageError} 업로드 실패 시
     */
    async uploadProfileImage(file, token = null) {
        try {
            if (!file) {
                throw new ImageError('NO_FILE');
            }

            const formData = new FormData();
            formData.append('file', file);

            const headers = new Headers();
            if (token) {
                headers.append('Authorization', `Bearer ${token}`);
            }

            const response = await fetch(`${this.apiUrl}/users/profile-image`, {
                method: 'POST',
                headers,
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'S3 업로드 실패');
            }

            const data = await response.json();
            return data.data; // API 응답에서 이미지 URL 추출
        } catch (error) {
            console.error('이미지 업로드 오류:', error);
            throw new ImageError('UPLOAD_ERROR');
        }
    }

    /**
     * 회원가입 시 프로필 이미지 업로드 처리
     * @param {Object} userData - 사용자 데이터
     * @param {File} file - 업로드할 이미지 파일
     * @returns {Promise<Object>} 회원가입 결과
     */
    async registerWithImage(userData, file) {
        try {
            // FormData 생성
            const formData = new FormData();
            
            // JSON 데이터 추가
            formData.append('data', JSON.stringify({
                email: userData.email,
                password: userData.password,
                nickname: userData.nickname || userData.username
            }));
            
            // 이미지 파일 추가 (있는 경우)
            if (file) {
                formData.append('image', file);
            }

            // API 호출
            const response = await fetch(`${this.apiUrl}/users/signup`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            return {
                success: result.success,
                message: result.message,
                data: result.data
            };
        } catch (error) {
            console.error('회원가입 처리 중 오류:', error);
            throw error;
        }
    }
}

export default new ImageService();