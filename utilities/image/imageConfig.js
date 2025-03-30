// utilities/image/imageConfig.js
import config from '/utilities/config.js';

/**
 * 이미지 관련 설정 상수
 */
export const IMAGE_CONFIG = {
    MAX_SIZE: config.IMAGE.MAX_SIZE,
    ALLOWED_TYPES: config.IMAGE.ALLOWED_TYPES,
    DEFAULT_PATH: config.DEFAULT_PROFILE_IMAGE,
    S3_BUCKET_URL: config.S3_BUCKET_URL,
    THUMBNAIL: config.IMAGE.THUMBNAIL
};

/**
 * 이미지 처리 관련 에러 코드
 */
export const IMAGE_ERROR_CODES = {
    NO_FILE: '파일이 선택되지 않았습니다.',
    FILE_TOO_LARGE: '파일 크기는 5MB 이하여야 합니다.',
    INVALID_TYPE: '지원하지 않는 이미지 형식입니다.',
    READ_ERROR: '파일 읽기에 실패했습니다.',
    PROCESSING_ERROR: '이미지 처리 중 오류가 발생했습니다.',
    CONVERSION_ERROR: '이미지 변환에 실패했습니다.',
    UPLOAD_ERROR: 'S3 업로드 중 오류가 발생했습니다.'
};

/**
 * 이미지 처리 관련 커스텀 에러 클래스
 */
export class ImageError extends Error {
    /**
     * @param {string} code - 에러 코드
     */
    constructor(code) {
        const message = IMAGE_ERROR_CODES[code] || '알 수 없는 에러가 발생했습니다.';
        super(message);
        this.name = 'ImageError';
        this.code = code;
    }
}