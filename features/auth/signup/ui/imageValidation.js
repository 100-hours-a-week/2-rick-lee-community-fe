// features/auth/signup/ui/imageValidation.js
import { IMAGE_CONFIG } from '../lib/imageConfig.js';

/**
 * 이미지 유효성 검사 클래스
 */
export class ImageValidator {
    /**
     * 파일 유효성 검사
     * @param {File} file - 검사할 파일
     * @throws {ImageError} 유효성 검사 실패 시 에러 발생
     */
    validateFile(file) {
        if (!file) {
            throw new ImageError('NO_FILE');
        }

        if (file.size > IMAGE_CONFIG.MAX_SIZE) {
            throw new ImageError('FILE_TOO_LARGE');
        }

        if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
            throw new ImageError('INVALID_TYPE');
        }
    }

    /**
     * 파일을 Data URL로 변환
     * @param {File} file - 변환할 파일
     * @returns {Promise<string>} 변환된 Data URL
     */
    async readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new ImageError('READ_ERROR'));
            reader.readAsDataURL(file);
        });
    }
}