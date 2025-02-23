// pages/auth/login/index.js
import { loginModel } from '/features/auth/login/model/loginModel.js';

class LoginPage {
    constructor() {
        this.elements = this.initializeElements();
        this.setupEventListeners();
    }

    /**
     * DOM 요소 초기화
     */
    initializeElements() {
        return {
            form: document.querySelector('form'),
            inputs: {
                email: document.getElementById('email'),
                password: document.getElementById('password')
            },
            helpers: {
                email: document.getElementById('email-helper'),
                password: document.getElementById('password-helper')
            },
            signupButton: document.querySelector('.signup-button')
        };
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        this.elements.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // 실시간 유효성 검사
        Object.entries(this.elements.inputs).forEach(([field, input]) => {
            input.addEventListener('input', () => {
                const result = loginModel.updateFormData(field, input.value);
                this.updateHelperText(field, result);
            });
        });

        // 회원가입 페이지 이동
        this.elements.signupButton.addEventListener('click', () => {
            window.location.href = '/pages/auth/signup/index.html';
        });
    }

    /**
     * 폼 제출 처리
     */
    async handleSubmit(e) {
        e.preventDefault();
        
        const result = await loginModel.login();
        
        if (result.success) {
            alert('로그인에 성공했습니다.');
            window.location.href = '/pages/post/list/index.html';
        } else {
            this.updateHelperText(result.field || 'password', {
                isValid: false,
                message: result.message
            });
        }
    }

    /**
     * 헬퍼 텍스트 업데이트
     */
    updateHelperText(field, result) {
        const helper = this.elements.helpers[field];
        if (helper) {
            helper.textContent = result.message;
            helper.className = `helper-text ${result.isValid ? '' : 'error'}`;
        }
    }
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    new LoginPage();
});