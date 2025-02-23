// features/auth/signup/lib/imageConfig.js

/**
 * 프로필 이미지 관련 설정 상수
 */
export const IMAGE_CONFIG = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    DEFAULT_PATH: '/shared/assets/images/default-profile.svg'
};

// features/auth/signup/lib/imageError.js
/**
 * 이미지 처리 관련 커스텀 에러 클래스
 */
export class ImageError extends Error {
    /**
     * @param {string} code - 에러 코드
     */
    constructor(code) {
        const messages = {
            'NO_FILE': '파일이 선택되지 않았습니다.',
            'FILE_TOO_LARGE': '파일 크기는 5MB 이하여야 합니다.',
            'INVALID_TYPE': '지원하지 않는 이미지 형식입니다.',
            'READ_ERROR': '파일 읽기에 실패했습니다.'
        };
        
        super(messages[code] || '알 수 없는 에러가 발생했습니다.');
        this.name = 'ImageError';
        this.code = code;
    }
}