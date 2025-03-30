// features/auth/signup/model/imageState.js
import { IMAGE_CONFIG } from '/utilities/image/imageConfig.js';
import { ImageProcessing } from '/utilities/image/imageProcessing.js';

/**
 * 이미지 상태 관리 클래스
 */
export class ImageState {
    /**
     * @param {Object} options - 옵션
     * @param {Function} options.onChange - 상태 변경 시 호출될 콜백
     */
    constructor(options = {}) {
        this.currentImage = null;
        this.file = null;
        this.isDefault = true;
        this.isProcessing = false;
        this.error = null;
        this.onChange = options.onChange || (() => {});
    }

    /**
     * 파일을 사용하여 이미지 상태 업데이트
     * @param {File} file - 이미지 파일
     */
    async updateWithFile(file) {
        try {
            this.isProcessing = true;
            this.error = null;
            this.notifyChange();

            // 이미지 처리
            const processedImage = await ImageProcessing.processImageFile(file);
            
            // 이전 이미지 URL 정리
            if (this.currentImage && !this.isDefault) {
                URL.revokeObjectURL(this.currentImage);
            }

            // 상태 업데이트
            this.currentImage = processedImage.processed.dataURL;
            this.file = processedImage.processed.file;
            this.isDefault = false;
            
        } catch (error) {
            this.error = error.message;
            console.error('이미지 처리 오류:', error);
        } finally {
            this.isProcessing = false;
            this.notifyChange();
        }
    }

    /**
     * Data URL로 이미지 상태 업데이트
     * @param {string} dataURL - 이미지 Data URL
     */
    async updateWithDataURL(dataURL) {
        try {
            this.isProcessing = true;
            this.error = null;
            this.notifyChange();

            // 이전 이미지 URL 정리
            if (this.currentImage && !this.isDefault) {
                URL.revokeObjectURL(this.currentImage);
            }

            // 이미지 처리 및 파일 변환
            const resizedDataURL = await ImageProcessing.resizeImage(dataURL);
            const file = ImageProcessing.dataURLtoFile(resizedDataURL);

            // 상태 업데이트
            this.currentImage = resizedDataURL;
            this.file = file;
            this.isDefault = false;
            
        } catch (error) {
            this.error = error.message;
            console.error('이미지 데이터 처리 오류:', error);
        } finally {
            this.isProcessing = false;
            this.notifyChange();
        }
    }

    /**
     * 기본 이미지로 상태 초기화
     */
    resetToDefault() {
        // 이전 이미지 URL 정리
        if (this.currentImage && !this.isDefault) {
            URL.revokeObjectURL(this.currentImage);
        }

        this.currentImage = IMAGE_CONFIG.DEFAULT_PATH;
        this.file = null;
        this.isDefault = true;
        this.error = null;
        this.notifyChange();
    }

    /**
     * 현재 상태 반환
     * @returns {Object} 현재 이미지 상태
     */
    getState() {
        return {
            dataURL: this.currentImage,
            file: this.file,
            isDefault: this.isDefault,
            isProcessing: this.isProcessing,
            error: this.error
        };
    }

    /**
     * 상태 변경 알림
     * @private
     */
    notifyChange() {
        if (this.onChange) {
            this.onChange(this.getState());
        }
    }

    /**
     * 리소스 정리
     */
    dispose() {
        // 이미지 URL 정리
        if (this.currentImage && !this.isDefault) {
            URL.revokeObjectURL(this.currentImage);
        }
        
        // 참조 정리
        this.currentImage = null;
        this.file = null;
        this.onChange = null;
    }
}