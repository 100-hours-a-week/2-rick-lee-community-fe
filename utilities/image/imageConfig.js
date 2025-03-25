/**
 * 이미지 관련 설정 상수 및 에러 클래스
 * @module imageConfig
 */

/**
 * 이미지 관련 설정 상수
 */
export const IMAGE_CONFIG = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    DEFAULT_PATH: '/shared/assets/images/default-profile.svg',
    THUMBNAIL: {
        MAX_WIDTH: 300,
        MAX_HEIGHT: 300,
        QUALITY: 0.85
    }
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
    CONVERSION_ERROR: '이미지 변환에 실패했습니다.'
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