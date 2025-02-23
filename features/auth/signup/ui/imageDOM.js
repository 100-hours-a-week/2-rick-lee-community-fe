// features/auth/signup/ui/imageDOM.js
/**
 * 이미지 관련 DOM 요소 관리 클래스
 */
export class ImageDOMManager {
    constructor() {
        this.elements = this.initializeElements();
    }

    /**
     * DOM 요소 초기화 및 검증
     * @throws {Error} 필수 DOM 요소가 없을 경우
     */
    initializeElements() {
        const elements = {
            container: document.getElementById('profileImageContainer'),
            preview: document.getElementById('previewImage'),
            plusIcon: document.querySelector('.plus-icon'),
            dropdown: document.getElementById('profileDropdown'),
            uploadBtn: document.getElementById('uploadImage'),
            defaultBtn: document.getElementById('useDefault'),
            fileInput: document.getElementById('profileImage')
        };

        // DOM 요소 존재 확인
        Object.entries(elements).forEach(([key, element]) => {
            if (!element) {
                throw new Error(`필수 DOM 요소 '${key}'를 찾을 수 없습니다.`);
            }
        });

        return elements;
    }

    /**
     * 이미지 미리보기 업데이트
     * @param {string} imageData - 표시할 이미지 데이터
     */
    updatePreview(imageData) {
        this.elements.preview.src = imageData;
        this.elements.preview.classList.remove('hidden');
        this.elements.plusIcon.style.display = 'none';
    }

    /**
     * 드롭다운 메뉴 토글
     */
    toggleDropdown() {
        this.elements.dropdown.classList.toggle('hidden');
    }

    /**
     * 드롭다운 메뉴 숨기기
     */
    hideDropdown() {
        this.elements.dropdown.classList.add('hidden');
    }

    /**
     * 파일 입력 요소 클릭
     */
    triggerFileInput() {
        this.elements.fileInput.click();
    }
}