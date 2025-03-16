import BaseApi from 'entities/BaseApi';

export class PostWriteApi extends BaseApi {
constructor() {
    // 기본 URL을 http://localhost:8080으로 고정
    super('http://localhost:8080');
    this.API_ENDPOINT = '/posts';
}

/**
 * 이미지 업로드 및 URL 변환
 * @param {File} imageFile - 업로드할 이미지 파일
 * @returns {Promise<string|null>} 업로드된 이미지 URL 또는 null
 */
async uploadImage(imageFile) {
    if (!imageFile) return null;

    try {
    const formData = new FormData();
    formData.append('image', imageFile);

    // FormData를 사용하므로 Content-Type 헤더는 자동으로 처리되도록 빈 객체를 전달
    const data = await this.request('/api/upload/image', {
        method: 'POST',
        body: formData,
        headers: {} // 기본 헤더에서 'Content-Type' 제거
    });
    return data.image_url;
    } catch (error) {
    console.error('이미지 업로드 중 오류:', error);
    throw new Error('이미지 업로드에 실패했습니다.');
    }
}

/**
 * 게시글 작성 API 요청 처리
 * @param {Object} postData - 게시글 데이터
 * @param {string} postData.title - 게시글 제목
 * @param {string} postData.content - 게시글 내용
 * @param {File} [postData.image] - 업로드할 이미지 파일 (선택)
 * @returns {Promise<Object>} API 응답 데이터
 */
async createPost(postData) {
    // 인증 토큰 확인 (BaseApi는 자동 헤더 처리를 하지만, 로그인 여부는 별도 체크)
    const token = localStorage.getItem('authToken');
    if (!token) {
    throw new Error('unauthorized');
    }

    try {
    // 이미지가 있는 경우 먼저 업로드
    const imageUrl = postData.image ? await this.uploadImage(postData.image) : null;

    const payload = {
        title: postData.title,
        content: postData.content,
        image_url: imageUrl,
    };

    const data = await this.request(this.API_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    return {
        success: true,
        data: data.data,
        message: '게시글이 작성되었습니다.',
    };
    } catch (error) {
    console.error('게시글 작성 중 오류:', error);
    return {
        success: false,
        message: error.message || '게시글 작성에 실패했습니다.',
    };
    }
}
}

export const postWriteApi = new PostWriteApi();
