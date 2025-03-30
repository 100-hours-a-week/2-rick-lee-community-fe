/**
 * 이미지 처리 관련 유틸리티 함수
 * @module imageProcessing
 */
import { IMAGE_CONFIG, ImageError } from './imageConfig.js';

/**
 * 이미지 처리 유틸리티 클래스
 * 모든 이미지 관련 변환, 검증, 처리 기능을 집중화
 */
export class ImageProcessing {
    /**
     * 이미지 파일 유효성 검사
     * @param {File|null} file - 검사할 이미지 파일
     * @returns {Object} 검사 결과 {isValid: boolean, message: string}
     */
    static validateImage(file) {
        // 파일이 없는 경우 (선택 사항으로 간주)
        if (!file) {
            return { isValid: true, message: '' };
        }

        // 파일 크기 검사
        if (file.size > IMAGE_CONFIG.MAX_SIZE) {
            return { 
                isValid: false, 
                message: IMAGE_ERROR_CODES.FILE_TOO_LARGE 
            };
        }

        // 파일 타입 검사
        if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
            return { 
                isValid: false, 
                message: IMAGE_ERROR_CODES.INVALID_TYPE 
            };
        }

        return { isValid: true, message: '' };
    }

    /**
     * 파일을 Data URL로 변환
     * @param {File} file - 변환할 파일
     * @returns {Promise<string>} Data URL 형식의 이미지 데이터
     * @throws {ImageError} 파일 읽기 실패 시
     */
    static readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new ImageError('NO_FILE'));
                return;
            }

            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new ImageError('READ_ERROR'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * 이미지 크기 조정 및 압축
     * @param {string} dataURL - 원본 이미지의 Data URL
     * @param {Object} options - 크기 조정 옵션
     * @param {number} options.maxWidth - 최대 너비 (기본값: CONFIG에서 지정)
     * @param {number} options.maxHeight - 최대 높이 (기본값: CONFIG에서 지정)
     * @param {number} options.quality - JPEG 품질 (0-1, 기본값: CONFIG에서 지정)
     * @returns {Promise<string>} 조정된 이미지의 Data URL
     * @throws {ImageError} 이미지 처리 실패 시
     */
    static resizeImage(dataURL, options = {}) {
        const { 
            maxWidth = IMAGE_CONFIG.THUMBNAIL.MAX_WIDTH, 
            maxHeight = IMAGE_CONFIG.THUMBNAIL.MAX_HEIGHT, 
            quality = IMAGE_CONFIG.THUMBNAIL.QUALITY 
        } = options;
        
        return new Promise((resolve, reject) => {
            try {
                // 이미지 객체 생성
                const img = new Image();
                img.onload = () => {
                    // 비율 유지하면서 크기 조정
                    let width = img.width;
                    let height = img.height;
                    
                    // 가로/세로 비율 계산
                    const ratio = Math.min(
                        maxWidth / width,
                        maxHeight / height
                    );
                    
                    // 이미지가 최대 크기보다 작으면 크기 조정 안함
                    if (width <= maxWidth && height <= maxHeight) {
                        resolve(dataURL);
                        return;
                    }
                    
                    // 새 크기 계산
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                    
                    // Canvas에 이미지 그리기
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // 조정된 이미지를 JPEG 형식의 Data URL로 변환
                    const resizedDataURL = canvas.toDataURL('image/jpeg', quality);
                    resolve(resizedDataURL);
                };
                
                img.onerror = () => {
                    reject(new ImageError('PROCESSING_ERROR'));
                };
                
                img.src = dataURL;
            } catch (error) {
                reject(new ImageError('PROCESSING_ERROR'));
            }
        });
    }

    /**
     * Data URL을 File 객체로 변환
     * @param {string} dataURL - 변환할 Data URL
     * @param {string} fileName - 생성할 파일 이름 (기본값: 'profile.jpg')
     * @param {string} fileType - 파일 MIME 타입 (기본값: 'image/jpeg')
     * @returns {File} 변환된 File 객체
     * @throws {ImageError} 변환 실패 시
     */
    static dataURLtoFile(dataURL, fileName = 'profile.jpg', fileType = 'image/jpeg') {
        try {
            // Data URL 형식 검증
            if (!dataURL || typeof dataURL !== 'string' || !dataURL.startsWith('data:')) {
                throw new Error('유효하지 않은 Data URL입니다.');
            }

            // Data URL에서 Base64 데이터 추출
            const arr = dataURL.split(',');
            const mime = arr[0].match(/:(.*?);/)?.[1] || fileType;
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            
            // File 객체 생성 및 반환
            return new File([u8arr], fileName, { type: mime });
        } catch (error) {
            console.error('이미지 변환 중 오류:', error);
            throw new ImageError('CONVERSION_ERROR');
        }
    }

    /**
     * 이미지 처리 파이프라인 - 파일 입력, 처리, 변환을 한번에 처리
     * @param {File} file - 처리할 이미지 파일
     * @param {Object} options - 처리 옵션
     * @returns {Promise<Object>} 처리된 이미지 정보 (dataURL, file 객체)
     * @throws {ImageError} 처리 과정 중 오류 발생 시
     */
    static async processImageFile(file, options = {}) {
        try {
            // 1. 유효성 검사
            const validation = this.validateImage(file);
            if (!validation.isValid) {
                throw new ImageError(validation.message);
            }

            // 2. Data URL로 변환
            const dataURL = await this.readFileAsDataURL(file);
            
            // 3. 필요시 리사이징
            const resizedDataURL = options.resize !== false ? 
                await this.resizeImage(dataURL, options) : dataURL;
            
            // 4. File 객체로 변환 (API 전송용)
            const imageFile = this.dataURLtoFile(
                resizedDataURL, 
                options.fileName || file.name || 'profile.jpg',
                file.type || 'image/jpeg'
            );
            
            // 처리 결과 반환
            return {
                original: {
                    file,
                    dataURL
                },
                processed: {
                    file: imageFile,
                    dataURL: resizedDataURL
                }
            };
        } catch (error) {
            if (error instanceof ImageError) {
                throw error;
            }
            console.error('이미지 처리 중 오류:', error);
            throw new ImageError('PROCESSING_ERROR');
        }
    }

    /**
     * 이미지가 기본 이미지인지 확인
     * @param {string} imagePath - 확인할 이미지 경로 또는 Data URL
     * @returns {boolean} 기본 이미지 여부
     */
    static isDefaultImage(imagePath) {
        if (!imagePath) return true;
        
        // 기본 이미지 경로가 포함되어 있는지 확인
        const defaultPath = IMAGE_CONFIG.DEFAULT_PATH;
        return imagePath.includes(defaultPath) || 
               imagePath === defaultPath;
    }
}