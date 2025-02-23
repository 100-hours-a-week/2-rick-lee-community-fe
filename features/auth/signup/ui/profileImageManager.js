// features/auth/signup/ui/profileImageManager.js
import { ImageValidator } from './imageValidation.js';
import { ImageState } from './imageState.js';
import { ImageDOMManager } from './imageDOM.js';

/**
 * ProfileImageManager 클래스
 * 회원가입 프로필 이미지 관리를 담당
 */
export class ProfileImageManager {
    // 프라이빗 필드 선언
    #eventHandlers;
    #callbacks;
    #validator;
    #state;
    #domManager;

    /**
     * @typedef {Object} ProfileImageCallbacks
     * @property {(imageData: string, isDefault: boolean) => void} onImageChange - 이미지 변경 콜백
     * @property {(message: string) => void} onError - 에러 발생 콜백
     */

    /**
     * @param {ProfileImageCallbacks} callbacks - 이미지 관련 콜백 함수들
     */
    constructor(callbacks) {
        if (!callbacks?.onImageChange || !callbacks?.onError) {
            throw new Error('필수 콜백이 누락되었습니다.');
        }

        this.#callbacks = callbacks;
        this.#validator = new ImageValidator();
        this.#state = new ImageState(this.#handleStateChange.bind(this));
        this.#domManager = new ImageDOMManager();
        
        this.#eventHandlers = this.#createEventHandlers();
        this.#setupEventListeners();
    }

    /**
     * 이벤트 핸들러 생성
     * @private
     */
    #createEventHandlers() {
        return new Map([
            ['containerClick', (e) => {
                e.stopPropagation();
                this.#domManager.toggleDropdown();
            }],
            ['fileChange', this.#handleImageUpload.bind(this)],
            ['documentClick', () => this.#domManager.hideDropdown()],
            ['uploadClick', (e) => {
                e.stopPropagation();
                this.#domManager.triggerFileInput();
                this.#domManager.hideDropdown();
            }],
            ['defaultClick', (e) => {
                e.stopPropagation();
                this.#state.resetToDefault();
                this.#domManager.hideDropdown();
            }]
        ]);
    }

    // ... 나머지 메서드들에서도 private 필드 접근 시 # 사용
    #setupEventListeners() {
        try {
            const elements = this.#domManager.elements;
            if (!elements) {
                throw new Error('DOM 요소가 초기화되지 않았습니다.');
            }

            elements.container.addEventListener('click', this.#eventHandlers.get('containerClick'));
            elements.fileInput.addEventListener('change', this.#eventHandlers.get('fileChange'));
            elements.uploadBtn.addEventListener('click', this.#eventHandlers.get('uploadClick'));
            elements.defaultBtn.addEventListener('click', this.#eventHandlers.get('defaultClick'));
            document.addEventListener('click', this.#eventHandlers.get('documentClick'));
        } catch (error) {
            this.#handleError('이미지 관리자 초기화 중 오류가 발생했습니다.');
            console.error('이벤트 리스너 설정 오류:', error);
        }
    }

    #handleStateChange(imageData, isDefault) {
        try {
            this.#callbacks.onImageChange(imageData, isDefault);
        } catch (error) {
            console.error('상태 변경 처리 중 오류:', error);
            this.#handleError('이미지 상태 업데이트 중 오류가 발생했습니다.');
        }
    }

    async #handleImageUpload(event) {
        try {
            const file = event.target.files?.[0];
            if (!file) {
                throw new Error('파일이 선택되지 않았습니다.');
            }

            this.#validator.validateFile(file);
            const imageData = await this.#validator.readFileAsDataURL(file);
            
            if (!imageData) {
                throw new Error('이미지 데이터를 읽을 수 없습니다.');
            }

            this.#state.updateImage(imageData);
            this.#domManager.updatePreview(imageData);

        } catch (error) {
            console.error('이미지 처리 중 오류:', error);
            this.#handleError(error.message || '이미지 처리 중 오류가 발생했습니다.');
        } finally {
            if (event.target) {
                event.target.value = '';
            }
        }
    }

    #handleError(message) {
        try {
            this.#callbacks.onError(message);
        } catch (error) {
            console.error('에러 처리 중 오류:', error);
        }
    }

    /**
     * 현재 이미지 데이터 반환
     * @public
     */
    getCurrentImage() {
        return this.#state.getCurrentImage();
    }

    /**
     * 기본 이미지 사용 여부 반환
     * @public
     */
    isDefaultImage() {
        return this.#state.isDefaultImage();
    }

    /**
     * 컴포넌트 정리
     * @public
     */
    destroy() {
        try {
            const elements = this.#domManager.elements;
            
            // 이벤트 리스너 제거
            elements.container.removeEventListener('click', this.#eventHandlers.get('containerClick'));
            elements.fileInput.removeEventListener('change', this.#eventHandlers.get('fileChange'));
            elements.uploadBtn.removeEventListener('click', this.#eventHandlers.get('uploadClick'));
            elements.defaultBtn.removeEventListener('click', this.#eventHandlers.get('defaultClick'));
            document.removeEventListener('click', this.#eventHandlers.get('documentClick'));
            
            // 리소스 정리
            this.#eventHandlers.clear();
            this.#state = null;
            this.#domManager = null;
            this.#validator = null;
            this.#callbacks = null;
        } catch (error) {
            console.error('컴포넌트 정리 중 오류:', error);
        }
    }
}