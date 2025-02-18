// DOM 요소
const profileForm = document.getElementById('profileForm');
const nicknameInput = document.getElementById('nickname');
const emailInput = document.getElementById('email');
const charCount = document.querySelector('.char-count');

// userStorage 임포트
import { userStorage } from '/entities/user/model/userStorage.js';
const deleteAccountButton = document.getElementById('deleteAccountButton');
const deleteModal = document.getElementById('deleteModal');
const confirmDelete = document.getElementById('confirmDelete');
const cancelDelete = document.getElementById('cancelDelete');
const toast = document.getElementById('toast');



// 초기 데이터 로드
function loadUserData() {
    // API 호출 대신 임시 데이터
    const userData = {
        nickname: '만세',
        email: 'startupcode@gmail.com'
    };

    nicknameInput.value = userData.nickname;
    emailInput.value = userData.email;
    updateCharCount();
}

// 문자 수 업데이트
function updateCharCount() {
    const count = nicknameInput.value.length;
    charCount.textContent = `${count}/10`;
}

//유저 이메일 디바이스
function displayUserEmail() {
    const emailElement = document.getElementById('email');
    const currentUser = userStorage.getCurrentUser();
    
    if (emailElement) {
        emailElement.textContent = currentUser ? currentUser.email : '이메일을 불러올 수 없습니다.';
    }
}

// 닉네임 유효성 검사
function validateNickname(nickname) {
    if (!nickname) {
        return { isValid: false, message: '닉네임을 입력해주세요.' };
    }
    if (nickname.length > 10) {
        return { isValid: false, message: '닉네임은 최대 10자까지 작성 가능합니다.' };
    }
    // 중복 검사는 실제로는 API 호출이 필요
    return { isValid: true };
}

// 토스트 메시지 표시
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}


// 이벤트 리스너 설정
function setupEventListeners() {

    // 닉네임 입력
    nicknameInput.addEventListener('input', updateCharCount);

    // 폼 제출
    profileForm.addEventListener('modify', async (e) => {
        e.preventDefault();
        const nickname = nicknameInput.value.trim();
        const validation = validateNickname(nickname);

        if (!validation.isValid) {
            alert(validation.message);
            return;
        }

        // API 호출 대신 임시 처리
        showToast('수정 완료');
    });

    // 회원 탈퇴
    deleteAccountButton.addEventListener('click', () => {
        deleteModal.classList.add('show');
    });

    confirmDelete.addEventListener('click', () => {
        // API 호출 대신 임시 처리
        window.location.href = '/pages/login/index.html';
    });

    cancelDelete.addEventListener('click', () => {
        deleteModal.classList.remove('show');
    });
}

// 초기화
function initialize() {
    loadUserData();
    setupEventListeners();
    displayUserEmail();
}

// 페이지 로드 시 초기화
initialize();