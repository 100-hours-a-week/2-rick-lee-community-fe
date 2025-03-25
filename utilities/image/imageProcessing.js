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
        
        // 오