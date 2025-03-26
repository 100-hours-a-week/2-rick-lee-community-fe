/**
 * 프로필 이미지 관리 모듈
 * @module profileImageManager
 */
import { ImageDOM } from './imageDOM.js';
import { ImageState } from '../model/imageState.js';
import { ImageError } from '/utilities/image/imageConfig.js';

/**
 * 프로필 이미지 관리 클래스
 * UI 계층의 컨트롤러로, DOM과 상태 간의 중개자 역할
 */
export class ProfileImageManager {
    /**
     * @param {Object} options - 초기화 옵션
     * @param {Function} options.onChange - 이미지 변경 시 호출될 콜백
     * @param {Function} options.onError - 오류 발생 시 호출될 콜백
     * @param {Object} options.domSelectors - DOM 요소 선택자 (옵션)
     */
    constructor(options = {}) {
        // 콜백 검증
        if (!options.onChange) {
            console.warn('onChange 콜백이 제공되지 않았습니다.');
        }
        
        // 이벤트 콜백
        this.callbacks = {
            onChange: options.onChange || (() => {}),
            onError: options.onError || console.error
        };
        
        // 상태 및 DOM 초기화
        this.dom = new ImageDOM({ selectors: options.domSelectors });
        this.state = new ImageState({ 
            onChange: this._handleStateChange.bind(this) 
        });
        
        // 이벤트 핸들러 등록
        this._setupEventHandlers();
    }

    /**
     * 이벤트 핸들러 설정
     * @private
     */
    _setupEventHandlers() {
        // 이벤트 핸들러 객체 생성
        this.handlers = {
            containerClick: () => this.dom.toggleDropdown(),
            fileChange: (file) => this._handleFileSelect(file),
            uploadClick: () => {
                this.dom.triggerFileInput();
                this.dom.hideDropdown();
            },
            defaultClick: () => {
                this.state.resetToDefault();
                this.dom.hideDropdown();
            },
            documentClick: () => this.dom.hideDropdown()
        };
        
        // DOM에 이벤트 리스너 등록
        this.dom.setupEventListeners(this.handlers);
    }

    /**
     * 파일 선택 처리
     * @private
     * @param {File} file - 선택된 이미지 파일
     */
    async _handleFileSelect(file) {
        try {
            // 파일이 없으면 무시
            if (!file) return;
            
            // UI 상태 업데이트
            this.dom.setLoading(true);
            this.dom.showError(null);
            
            // 이미지 상태 업데이트 (처리 포함)
            await this.state.updateWithFile(file);
            
        } catch (error) {
            // 오류 메시지 표시
            const message = error instanceof ImageError 
                ? error.message 
                : '이미지 처리 중 오류가 발생했습니다.';
                
            this.dom.showError(message);
            this.callbacks.onError(message);
            
        } finally {
            // 로딩 상태 해제
            this.dom.setLoading(false);
        }
    }

    /**
     * 상태 변경 처리
     * @private
     * @param {Object} state - 변경된 상태
     */
    _handleStateChange(state) {
        // 로딩 상태 업데이트
        this.dom.setLoading(state.isProcessing);
        
        // 오류 표시
        if (state.error) {
            this.dom.showError(state.error);
        } else {
            this.dom.showError(null);
        }
        
        // 이미지 미리보기 업데이트
        if (state.dataURL) {
            this.dom.updatePreview(state.dataURL);
        }
        
        // 상위 컴포넌트에 변경 알림
        this.callbacks.onChange({
            dataURL: state.dataURL,
            file: state.file,
            isDefault: state.isDefault
        });
    }

    /**
     * 현재 이미지 데이터 반환 (API 요청용)
     * @returns {Object} 현재 이미지 정보 (file, dataURL, isDefault)
     */
    getCurrentImageData() {
        // 상태 객체가 없거나 예상 구조가 아닌 경우 기본값 반환
        if (!this.state) {
            console.warn('이미지 상태가 초기화되지 않았습니다.');
            return {
                file: null,
                dataURL: null,
                isDefault: true
            };
        }
        
        // ImageState 클래스가 수정된 경우에 따라 적절한 방법 사용
        // 방법 1: state 객체가 직접 상태 정보를 가지고 있는 경우
        if (typeof this.state.dataURL !== 'undefined') {
            return {
                file: this.state.file,
                dataURL: this.state.dataURL,
                isDefault: this.state.isDefault
            };
        }
        
        // 방법 2: 새로운 getState 메서드 사용 (있는 경우)
        if (typeof this.state.getState === 'function') {
            return this.state.getState();
        }
        
        // 기본 폴백: 기본 이미지로 간주
        return {
            file: null,
            dataURL: null,
            isDefault: true
        };
    }

    /**
     * 저장된 이미지 데이터로 상태 초기화
     * @param {string} dataURL - 이전에 저장된 이미지 Data URL
     */
    initializeWithSavedData(dataURL) {
        if (!dataURL) return;
        
        try {
            this.state.updateWithDataURL(dataURL);
        } catch (error) {
            console.error('저장된 이미지 복원 중 오류:', error);
            this.callbacks.onError('저장된 이미지를 불러올 수 없습니다.');
        }
    }

    /**
     * 컴포넌트 정리 (메모리 누수 방지)
     */
    dispose() {
        // 이벤트 리스너 제거
        this.dom.removeEventListeners(this.handlers);
        
        // 상태 객체 정리
        if (this.state) {
            this.state.dispose();
        }
        
        // 참조 정리
        this.state = null;
        this.dom = null;
        this.handlers = null;
        this.callbacks = null;
    }
}