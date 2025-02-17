export class ProfileImageManager {
    constructor(signupPage) {
        this.signupPage = signupPage;
        this.defaultImagePath = '/shared/assets/images/default-profile.svg';
    }

    initialize() {
        this.profileElements = {
            container: document.getElementById('profileImageContainer'),
            preview: document.getElementById('previewImage'),
            plusIcon: document.querySelector('.plus-icon'),
            dropdown: document.getElementById('profileDropdown'),
            uploadBtn: document.getElementById('uploadImage'),
            defaultBtn: document.getElementById('useDefault')
        };
        this.setupProfileImageEvents();
    }

    // 누락된 이벤트 설정 메서드 추가
    setupProfileImageEvents() {
        const { container, uploadBtn, defaultBtn } = this.profileElements;

        container.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleProfileDropdown();
        });

        uploadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.signupPage.inputs.profileImage.click();
            this.hideProfileDropdown();
        });

        defaultBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.useDefaultImage();
            this.hideProfileDropdown();
        });

        this.signupPage.inputs.profileImage.addEventListener('change', (e) => 
            this.handleImageUpload(e)
        );
        
        document.addEventListener('click', () => this.hideProfileDropdown());
    }

    // 필요한 메서드들 추가
    toggleProfileDropdown() {
        this.profileElements.dropdown.classList.toggle('hidden');
    }

    hideProfileDropdown() {
        this.profileElements.dropdown.classList.add('hidden');
    }

    useDefaultImage() {
        this.profileElements.preview.src = this.defaultImagePath;
        this.profileElements.preview.classList.remove('hidden');
        this.profileElements.plusIcon.style.display = 'none';
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('파일 크기는 5MB 이하여야 합니다.');
                return;
            }

            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드 가능합니다.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                this.profileElements.preview.src = e.target.result;
                this.profileElements.preview.classList.remove('hidden');
                this.profileElements.plusIcon.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    }

    getProfileImageSrc() {
        return this.profileElements.preview.classList.contains('hidden') ? 
            this.defaultImagePath : 
            this.profileElements.preview.src;
    }
}