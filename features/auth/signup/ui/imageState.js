// features/auth/signup/ui/imageState.js
import { IMAGE_CONFIG } from '../lib/imageConfig.js';

/**
 * 이미지 상태 관리 클래스
 */
export class ImageState {
    /**
     * @param {Function} onStateChange - 상태 변경 시 호출될 콜백
     */
    constructor(onStateChange) {
        this.currentImage = null;
        this.isDefault = true;
        this.onStateChange = onStateChange;
    }

    /**
     * 새로운 이미지로 상태 업데이트
     * @param {string} imageData - 새 이미지 데이터
     */
    updateImage(imageData) {
        // 이전 이미지 URL 정리
        if (this.currentImage && !this.isDefault) {
            URL.revokeObjectURL(this.currentImage);
        }

        this.currentImage = imageData;
        this.isDefault = false;
        this.notifyChange();
    }

    /**
     * 기본 이미지로 상태 초기화
     */
    resetToDefault() {
        if (this.currentImage && !this.isDefault) {
            URL.revokeObjectURL(this.currentImage);
        }

        this.currentImage = IMAGE_CONFIG.DEFAULT_PATH;
        this.isDefault = true;
        this.notifyChange();
    }

    /**
     * 현재 이미지 소스 반환
     * @returns {string} 현재 이미지 경로
     */
    getCurrentImage() {
        return this.isDefault ? IMAGE_CONFIG.DEFAULT_PATH : this.currentImage;
    }
    /**
     * 기본 이미지 사용 여부 반환
     * @returns {boolean} 기본 이미지 사용 여부
     */
    isDefaultImage() {
        return this.isDefault;
    }
    
    /**
     * 상태 변경 알림
     * @private
     */
        notifyChange() {
            if (this.onStateChange) {
                this.onStateChange(this.currentImage, this.isDefault);
            }
    }
}