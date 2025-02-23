// pages/post/write/index.js
import { postWriteModel } from '/features/post/write/postWriteModel.js';

class PostWritePage {
    constructor() {
        this.elements = this.initializeElements();
        this.setupEventListeners();
        this.updateSubmitButton(false);
    }

        /**
         * DOM 요소 초기화
         * @private
         */
    initializeElements() {
        return {
            form: document.getElementById('postForm'),
            title: document.getElementById('title'),
            content: document.getElementById('content'),
            imageUpload: document.getElementById('imageUpload'),
            imageInput: document.getElementById('imageInput'),
            submitButton: document.getElementById('submitButton'),
            charCount: document.querySelector('.char-count'),
            writeHelper: document.getElementById('writeHelper'),
            uploadPlaceholder: document.querySelector('.upload-placeholder span')
        };
    }

    /**
     * 이벤트 리스너 설정
     * @private
     */
    setupEventListeners() {
        // 제목 입력 이벤트
        this.elements.title.addEventListener('input', () => {
            const length = this.elements.title.value.length;
            this.elements.charCount.textContent = `${length}/26`;
            this.validateForm();
        });

        // 내용 입력 이벤트
        this.elements.content.addEventListener('input', () => {
            this.validateForm();
        });

        // 이미지 업로드 영역 클릭 이벤트
        this.elements.imageUpload.addEventListener('click', () => {
            this.elements.imageInput.click();
        });

        // 이미지 선택 이벤트
        this.elements.imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.elements.uploadPlaceholder.textContent = file.name;
            }
        });

        // 폼 제출 이벤트
        this.elements.form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    /**
     * 폼 유효성 검사 및 UI 업데이트
     * @private
     */
    validateForm() {
        const title = this.elements.title.value.trim();
        const content = this.elements.content.value.trim();
        
        const validation = postWriteModel.validatePostForm(title, content);
        
        if (validation.isValid) {
            this.updateSubmitButton(true);
            this.elements.writeHelper.style.display = 'none';
        } else {
            this.updateSubmitButton(false);
            if (title || content) { // 하나라도 입력이 있는 경우에만 헬퍼 텍스트 표시
                this.showHelperText(validation.message);
            }
        }
    }

    /**
     * 제출 버튼 상태 업데이트
     * @private
     * @param {boolean} isValid - 폼 유효성 상태
     */
    updateSubmitButton(isValid) {
        this.elements.submitButton.disabled = !isValid;
        this.elements.submitButton.style.backgroundColor = isValid ? '#7F6AEE' : '#ACA0E8';
    }

    /**
     * 헬퍼 텍스트 표시
     * @private
     * @param {string} message - 표시할 메시지
     */
    showHelperText(message) {
        this.elements.writeHelper.textContent = message;
        this.elements.writeHelper.style.display = 'block';
        this.elements.writeHelper.style.color = 'red';
    }

    /**
     * 폼 제출 처리
     * @private
     * @param {Event} e - 제출 이벤트
     */
    async handleSubmit(e) {
        e.preventDefault();

        try {
            const postData = {
                title: this.elements.title.value.trim(),
                content: this.elements.content.value.trim(),
                image: this.elements.imageInput.files[0]
            };

            const validation = postWriteModel.validatePostForm(postData.title, postData.content);
            if (!validation.isValid) {
                this.showHelperText(validation.message);
                return;
            }

            await postWriteModel.createPost(postData);
            window.location.href = '/pages/post/list/index.html';

        } catch (error) {
            this.showHelperText(error.message);
        }
    }
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    new PostWritePage();
});