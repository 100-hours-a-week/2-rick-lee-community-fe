/**
 * 이미지 관련 DOM 요소 관리 모듈
 * @module imageDOM
 */
import { IMAGE_CONFIG } from '/utilities/image/imageConfig.js';

/**
 * 이미지 관련 DOM 요소 관리 클래스
 * 순수하게 DOM 조작에만 책임을 가짐
 */
export class ImageDOM {
    /**
     * @param {Object} options - DOM 요소 선택자 옵션
     */
    constructor(options = {}) {
        // 기본 선택자 설정
        this.selectors = {
            container: '#profileImageContainer',
            preview: '#previewImage',
            plusIcon: '.plus-icon',
            dropdown: '#profileDropdown',
            uploadBtn: '#uploadImage',
            defaultBtn: '#useDefault',
            fileInput: '#profileImage',
            error: '#imageError',
            loading: '#imageLoading',
            ...options.selectors
        };

        // DOM 요소 초기화
        this.elements = this._initializeElements();
    }

    /**
     * DOM 요소 초기화 및 검증
     * @private
     * @returns {Object} DOM 요소 객체
     * @throws {Error} 필수 DOM 요소가 없을 경우
     */
    _initializeElements() {
        const elements = {};

        // 선택자로 요소 찾기
        for (const [key, selector] of Object.entries(this.selectors)) {
            elements[key] = document.querySelector(selector);
            
            // 필수 요소 존재 확인 (loading, error는 선택사항)
            if (!elements[key] && key !== 'loading' && key !== 'error') {
                console.error(`필수 DOM 요소 '${key}'(${selector})를 찾을 수 없습니다.`);
            }
        }

        return elements;
    }

    /**
     * 이미지 미리보기 업데이트
     * @param {string} imageURL - 표시할 이미지 URL 또는 Data URL
     */
    updatePreview(imageURL) {
        if (!this.elements.preview) return;
        
        this.elements.preview.src = imageURL || IMAGE_CONFIG.DEFAULT_PATH;
        this.elements.preview.classList.remove('hidden');
        
        if (this.elements.plusIcon) {
            this.elements.plusIcon.style.display = 'none';
        }
    }

    /**
     * 처리 중 상태 표시/숨기기
     * @param {boolean} isLoading - 로딩 중 여부
     */
    setLoading(isLoading) {
        if (!this.elements.loading) return;
        
        this.elements.loading.style.display = isLoading ? 'flex' : 'none';
        
        // 로딩 중일 때는 다른 요소들 비활성화
        if (this.elements.container) {
            this.elements.container.style.pointerEvents = isLoading ? 'none' : 'auto';
            this.elements.container.style.opacity = isLoading ? '0.7' : '1';
        }
    }

    /**
     * 오류 메시지 표시/숨기기
     * @param {string|null} errorMessage - 표시할 오류 메시지 (null이면 숨김)
     */
    showError(errorMessage) {
        if (!this.elements.error) return;
        
        if (errorMessage) {
            this.elements.error.textContent = errorMessage;
            this.elements.error.style.display = 'block';
        } else {
            this.elements.error.style.display = 'none';
        }
    }

    /**
     * 드롭다운 메뉴 토글
     */
    toggleDropdown() {
        if (!this.elements.dropdown) return;
        
        this.elements.dropdown.classList.toggle('hidden');
    }

    /**
     * 드롭다운 메뉴 숨기기
     */
    hideDropdown() {
        if (!this.elements.dropdown) return;
        
        this.elements.dropdown.classList.add('hidden');
    }

    /**
     * 파일 입력 요소 클릭
     */
    triggerFileInput() {
        if (!this.elements.fileInput) return;
        
        this.elements.fileInput.click();
    }

    /**
     * 이벤트 핸들러 설정
     * @param {Object} handlers - 이벤트 핸들러 객체
     */
    setupEventListeners(handlers) {
        // 이벤트 핸들러가 없으면 아무것도 하지 않음
        if (!handlers) return;
        
        // 컨테이너 클릭 (드롭다운 토글)
        if (handlers.containerClick && this.elements.container) {
            this.elements.container.addEventListener('click', (e) => {
                e.stopPropagation();
                handlers.containerClick();
            });
        }
        
        // 파일 선택 변경
        if (handlers.fileChange && this.elements.fileInput) {
            this.elements.fileInput.addEventListener('change', (e) => {
                handlers.fileChange(e.target.files[0]);
                // 같은 파일 재선택을 위해 value 초기화
                e.target.value = '';
            });
        }
        
        // 업로드 버튼 클릭
        if (handlers.uploadClick && this.elements.uploadBtn) {
            this.elements.uploadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handlers.uploadClick();
            });
        }
        
        // 기본 이미지 버튼 클릭
        if (handlers.defaultClick && this.elements.defaultBtn) {
            this.elements.defaultBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handlers.defaultClick();
            });
        }
        
        // 다른 곳 클릭 시 드롭다운 닫기
        if (handlers.documentClick) {
            document.addEventListener('click', handlers.documentClick);
        }
    }

    /**
     * 이벤트 핸들러 제거
     * @param {Object} handlers - 이벤트 핸들러 객체
     */
    removeEventListeners(handlers) {
        // 이벤트 핸들러가 없으면 아무것도 하지 않음
        if (!handlers) return;
        
        // 등록된 이벤트 리스너 제거
        if (handlers.containerClick && this.elements.container) {
            this.elements.container.removeEventListener('click', handlers.containerClick);
        }
        
        if (handlers.fileChange && this.elements.fileInput) {
            this.elements.fileInput.removeEventListener('change', handlers.fileChange);
        }
        
        if (handlers.uploadClick && this.elements.uploadBtn) {
            this.elements.uploadBtn.removeEventListener('click', handlers.uploadClick);
        }
        
        if (handlers.defaultClick && this.elements.defaultBtn) {
            this.elements.defaultBtn.removeEventListener('click', handlers.defaultClick);
        }
        
        if (handlers.documentClick) {
            document.removeEventListener('click', handlers.documentClick);
        }
    }
}