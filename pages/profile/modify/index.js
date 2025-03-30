// pages/profile/modify/index.js
import { profileModifyModel } from '/features/profile/modify/profileModifyModel.js';

class ProfileModifyPage {
    constructor() {
        this.elements = this.initializeElements();
        this.elements.modal.container.style.display = 'none'; //모달의 초기상태 설정
        this.setupEventListeners();
        this.loadUserProfile();
        this.currentNickname = ''; // 현재 사용자 닉네임 저장용
        this.debounceTimer = null; // 디바운스 타이머
    }

    /**
     * DOM 요소 초기화
     */
    initializeElements() {
        return {
            form: document.getElementById('profileForm'),
            profileContainer: document.getElementById('profileImageContainer'),
            previewImage: document.getElementById('previewImage'),
            email: document.getElementById('email'),
            nickname: document.getElementById('nickname'),
            modifyHelper: document.getElementById('modifyHelper'),
            charCount: document.querySelector('.char-count'),
            modifyButton: document.getElementById('modifyButton'),
            submitButton: document.getElementById('submitButton'),
            toast: document.getElementById('toast'),
            modal: {
                container: document.getElementById('deleteModal'),
                confirmBtn: document.getElementById('confirmDelete'),
                cancelBtn: document.getElementById('cancelDelete')
            },
            deleteAccountBtn: document.getElementById('deleteAccountButton')
        };
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 프로필 이미지 관련
        this.elements.profileContainer.addEventListener('mouseover', () => {
            this.elements.profileContainer.style.backgroundColor = '#E9E9E9';
        });

        this.elements.profileContainer.addEventListener('mouseout', () => {
            this.elements.profileContainer.style.backgroundColor = '';
        });

         // 닉네임 입력 이벤트 수정
    this.elements.nickname.addEventListener('input', () => {
        const nickname = this.elements.nickname.value;
        const length = nickname.length;
        this.elements.charCount.textContent = `${length}/10`;
        
        // 기본 유효성 검사
        if (!nickname || nickname.trim().length === 0) {
            this.showHelperText('닉네임을 입력해주세요');
            return;
        }
        
        if (length > 10) {
            this.showHelperText('닉네임은 최대 10자까지 가능합니다');
            return;
        }
        
        // 현재 닉네임과 같으면 검증 건너뛰기
        if (nickname === this.currentNickname) {
            this.elements.modifyHelper.textContent = '';
            return;
        }
        
        // 디바운스 적용 - 타이핑 중지 후 500ms 후에 API 호출
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(async () => {
            // 중복 확인 진행 중 표시
            this.elements.modifyHelper.textContent = '확인 중...';
            this.elements.modifyHelper.style.color = '#666';
            
            try {
                const result = await profileModifyModel.checkNicknameDuplicate(nickname);
                
                if (result.success) {
                    // 사용 가능한 닉네임
                    this.elements.modifyHelper.textContent = '사용 가능한 닉네임입니다';
                    this.elements.modifyHelper.style.color = 'green';
                } else {
                    // 중복된 닉네임
                    this.showHelperText('중복된 닉네임입니다');
                }
            } catch (error) {
                console.error('닉네임 중복 확인 중 오류:', error);
                this.elements.modifyHelper.textContent = '';
            }
        }, 500); // 500ms 디바운스
        });

        // 수정하기 버튼
        this.elements.modifyButton.addEventListener('click', this.handleModify.bind(this));

        // 회원 탈퇴 버튼 클릭 시 모달 표시
        this.elements.deleteAccountBtn.addEventListener('click', () => {
            console.log("회원탈퇴 버튼 눌림")
            this.showModal();
        });

        // 모달 확인 버튼
        this.elements.modal.confirmBtn.addEventListener('click', async () => {
            await this.handleDeleteAccount();
        });

        // 모달 취소 버튼
        this.elements.modal.cancelBtn.addEventListener('click', () => {
            this.hideModal();
        });

        // 모달 외부 클릭 시 닫기
        this.elements.modal.container.addEventListener('click', (e) => {
            if (e.target === this.elements.modal.container) {
                this.hideModal();
            }
        });

        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalVisible()) {
                this.hideModal();
            }
        });

        // 수정완료 버튼 클릭 이벤트
        this.elements.submitButton.addEventListener('click', async (e) => {
            e.preventDefault();
            await this.handleSubmit();
        });
    }

    /**
     * 수정하기 버튼 클릭 처리
     */
    async handleModify(e) {
        e.preventDefault();

        const profileData = {
            nickname: this.elements.nickname.value,
            image: null // 이미지 업로드 기능 구현 시 추가
        };

        const result = await profileModifyModel.updateProfile(profileData);

        if (result.success) {
            this.showToast('수정 완료');
        } else {
            this.showHelperText(result.message);
        }
    }

    /**
     * 회원 탈퇴 처리
     * @private
     */
    async handleDeleteAccount() {
        try {
            const result = await profileModifyModel.deleteAccount();
            
            if (result.success) {
                localStorage.removeItem('jwt'); // 로그아웃 처리
                alert('회원 탈퇴가 완료되었습니다.');
                window.location.href = '/pages/auth/login/index.html';
            } else {
                alert(result.message || '회원 탈퇴 처리 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('회원 탈퇴 처리 중 오류:', error);
            alert('회원 탈퇴 처리 중 오류가 발생했습니다.');
        } finally {
            this.hideModal();
        }
    }

    /**
     * 수정완료 버튼 클릭 처리
     * @private
     */
    async handleSubmit() {
        try {
            const profileData = {
                nickname: this.elements.nickname.value,
                image: null
            };
    
            const result = await profileModifyModel.updateProfile(profileData);
    
            if (result.success) {
                this.showToast('수정 완료');
                window.location.href = '/pages/post/list/index.html';
            } else {
                this.showHelperText(result.message);
            }
        } catch (error) {
            console.error('프로필 수정 중 오류:', error);
            this.showHelperText('프로필 수정 중 오류가 발생했습니다.');
        }
    }

    /**
     * 헬퍼 텍스트 표시
     */
    showHelperText(message) {
        this.elements.modifyHelper.textContent = message;
        this.elements.modifyHelper.style.color = 'red';
    }

    /**
     * 토스트 메시지 표시
     */
    showToast(message) {
        this.elements.toast.textContent = message;
        this.elements.toast.style.display = 'block';
        setTimeout(() => {
            this.elements.toast.style.display = 'none';
        }, 3000);
    }

    /**
     * 모달 표시
     * @private
     */
    showModal() {
        const modal = this.elements.modal.container;
        modal.style.display = 'flex';  // none에서 flex로 변경
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * 모달 숨김
     * @private
     */
    hideModal() {
        const modal = this.elements.modal.container;
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';  // 애니메이션 후 숨김
        }, 300);  // transition 시간과 동일하게 설정
        document.body.style.overflow = '';
    }
    
    /**
     * 모달 표시 상태 확인
     * @private
     * @returns {boolean} 모달이 보이는 상태이면 true
     */
    isModalVisible() {
        return this.elements.modal.container.classList.contains('show');
    }
    /**
     * 현재 사용자의 프로필 정보를 로드하고 화면에 표시
     * @private
     */
    async loadUserProfile() {
        try {
            // 프로필 정보를 불러오는 API 호출
            const result = await profileModifyModel.getProfile();
            
            if (result.success) {
                this.updateProfileUI(result.data);
            } else {
                throw new Error('프로필 정보를 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('프로필 로드 중 오류:', error);
            alert('프로필 정보를 불러오는데 실패했습니다.');
        }
    }
    /**
     * 프로필 정보로 UI 업데이트
     * @private
     * @param {Object} profileData - 프로필 데이터
     */
    updateProfileUI(profileData) {
        // 이메일 표시 (읽기 전용)
        this.elements.email.textContent = profileData.email;

        // 닉네임 입력란 설정
        this.elements.nickname.value = profileData.nickname;
        this.currentNickname = profileData.nickname; // 현재 닉네임 저장

        // 프로필 이미지 표시
        if (profileData.profile_image) {
            this.elements.previewImage.src = profileData.profile_image;
            this.elements.previewImage.classList.remove('hidden');
        }
    }
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    new ProfileModifyPage();
});