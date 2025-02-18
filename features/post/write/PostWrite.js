import { postStorage } from '/entities/post/PostStorage.js'

// DOM 요소 참조
const form = document.getElementById('postForm');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const submitButton = document.getElementById('submitButton');
const backButton = document.getElementById('backButton');
const imageUpload = document.getElementById('imageUpload');
const imageInput = document.getElementById('imageInput');
const charCount = document.querySelector('.char-count');

let imageFile = null;

// 문자 수 업데이트
function updateCharCount() {
    const count = titleInput.value.length;
    charCount.textContent = `${count}/26`;
    
    if (count > 26) {
        titleInput.value = titleInput.value.slice(0, 26);
        updateCharCount();
    }
}

// 제출 버튼 상태 업데이트
function updateSubmitButton() {
    const isValid = titleInput.value.trim() && contentInput.value.trim();
    submitButton.classList.toggle('active', isValid);
}

// 이미지를 Base64로 변환
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 폼 제출 처리
async function handleSubmit(e) {
    e.preventDefault();
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!title || !content) {
        alert('제목, 내용을 모두 작성해주세요.');
        return;
    }
    
    try {
        const imageData = imageFile ? await convertImageToBase64(imageFile) : null;
        
        const postData = {
            title,
            content,
            image: imageData
        };
        
        const result = await postStorage.addPost(postData);
        
        if (result.success) {
            window.location.href = '/pages/post/list/index.html';
        } else {
            alert(result.message || '게시글 작성 중 오류가 발생했습니다.');
        }
    } catch (error) {
        console.error('게시글 작성 중 오류:', error);
        alert('게시글 작성 중 오류가 발생했습니다.');
    }
}

// 뒤로가기 처리
function handleBack() {
    if (titleInput.value.trim() || contentInput.value.trim()) {
        const confirm = window.confirm('작성 중인 내용이 있습니다. 정말 나가시겠습니까?');
        if (!confirm) return;
    }
    window.location.href = '/pages/post/list/index.html';
}

// 이미지 선택 처리
function handleImageSelect(e) {
    const file = e.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드 가능합니다.');
            return;
        }
        
        imageFile = file;
        const placeholder = imageUpload.querySelector('.upload-placeholder');
        placeholder.textContent = file.name;
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    titleInput.addEventListener('input', () => {
        updateCharCount();
        updateSubmitButton();
    });
    
    contentInput.addEventListener('input', updateSubmitButton);
    form.addEventListener('submit', handleSubmit);
    backButton.addEventListener('click', handleBack);
    imageUpload.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', handleImageSelect);
}

// 초기화
function initialize() {
    setupEventListeners();
    updateSubmitButton();
}

// 페이지 로드 시 초기화
initialize();