import { FormInitializer } from './model/FormInitializer.js';
import { FormValidator } from './model/FormValidator.js';
import { ProfileImageManager } from './model/ProfileImageManager.js';
import { SignupAutosave } from './model/signupAutosave.js';

export class SignupForm {
    static ROUTES = {
        LOGIN: '/pages/auth/login/index.html'
    };

    constructor() {
        this.formInitializer = new FormInitializer();
        const { form, inputs, buttons, helperTexts } = this.formInitializer.initialize();
        console.log('Initialized elements:', { form, inputs, buttons, helperTexts }); // 디버깅 추가
        this.form = form;
        this.inputs = inputs;
        this.buttons = buttons;
        this.helperTexts = helperTexts;

        this.initializeState();
        this.initializeManagers();
        this.setupEventListeners();
    }

    initializeState() {
        this.validationState = {
            email: false,
            password: false,
            passwordConfirm: false,
            nickname: false
        };
    }

    initializeManagers() {
        this.validator = new FormValidator(this);
        this.validator.initialize();

        this.profileManager = new ProfileImageManager(this);
        this.profileManager.initialize();

        this.autosave = new SignupAutosave(this);
        this.autosave.initialize();
    }

    setupEventListeners() {
        console.log('Setting up event listeners for inputs:', this.inputs); // 디버깅 추가
        Object.entries(this.inputs)
            .filter(([key]) => key !== 'profileImage')
            .forEach(([key, input]) => {
                console.log(`Setting up listeners for ${key}`, input); // 디버깅 추가

                ['blur', 'input'].forEach(eventType => {
                    input.addEventListener(eventType, () => {
                        console.log(`Event triggered: ${eventType} on ${key}`); // 디버깅용
                        this.validator.validateField(key, input.value);
                    });
                });
            });

        // 폼 제출
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    
        // 페이지 이동
        ['back', 'login'].forEach(btnType => {
            this.buttons[btnType].addEventListener('click', () => {
                this.navigateTo(SignupPage.ROUTES.LOGIN);
            });
        });
    }
    handleSubmit() {
        const formData = {
            email: this.inputs.email.value,
            password: this.inputs.password.value,
            nickname: this.inputs.nickname.value,
            profileImage: this.profileManager.getProfileImageSrc()
        };

        if (Object.values(this.validator.validationState).every(valid => valid)) {
            const result = userStorage.registerUser(formData);
            
            if (result.success) {
                this.autosave.clearSavedData();
                alert('회원가입이 완료되었습니다.');
                this.navigateTo(SignupPage.ROUTES.LOGIN);
            } else {
                alert(result.message);
            }
        }
    }
    navigateTo(ROUTES) {
        window.location.href = ROUTES;
    }
}
new SignupForm();