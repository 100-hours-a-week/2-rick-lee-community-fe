// entities/post/api/postWriteApi.js

/**
 * 게시글 작성 API 요청 처리를 담당하는 클래스
 */
class PostWriteApi {
    /**
     * 게시글 작성 API 엔드포인트
     * @private
     */
    #API_ENDPOINT = '/posts';

    /**
     * 이미지 업로드 및 URL 변환
     * @private
     * @param {File} imageFile - 업로드할 이미지 파일
     * @returns {Promise<string|null>} 업로드된 이미지 URL 또는 null
     */
    async #uploadImage(imageFile) {
        if (!imageFile) return null;

        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await fetch('/api/upload/image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('이미지 업로드에 실패했습니다.');
            }

            const data = await response.json();
            return data.image_url;
        } catch (error) {
            console.error('이미지 업로드 중 오류:', error);
            throw new Error('이미지 업로드에 실패했습니다.');
        }
    }

    /**
     * 게시글 작성 API 요청
     * @param {Object} postData - 게시글 데이터
     * @param {string} postData.title - 게시글 제목
     * @param {string} postData.content - 게시글 내용
     * @param {File} [postData.image] - 업로드할 이미지 파일 (선택)
     * @returns {Promise<Object>} API 응답 데이터
     * @throws {Error} API 요청 실패 시 에러
     */
    async createPost(postData) {
        try {
            const token = localStorage.getItem('jwt');
            if (!token) {
                throw new Error('unauthorized');
            }

            // 이미지가 있는 경우 먼저 업로드
            const imageUrl = postData.image ? await this.#uploadImage(postData.image) : null;

            const response = await fetch(this.#API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: postData.title,
                    content: postData.content,
                    image_url: imageUrl
                })
            });

            const data = await response.json();

            // 응답 상태 코드별 처리
            switch (response.status) {
                case 201:
                    return {
                        success: true,
                        data: data.data,
                        message: '게시글이 작성되었습니다.'
                    };
                case 400:
                    throw new Error('입력 정보를 확인해주세요.');
                case 401:
                    throw new Error('로그인이 필요합니다.');
                case 500:
                    throw new Error('서버 오류가 발생했습니다.');
                default:
                    throw new Error('알 수 없는 오류가 발생했습니다.');
            }

        } catch (error) {
            console.error('게시글 작성 중 오류:', error);
            return {
                success: false,
                message: error.message || '게시글 작성에 실패했습니다.'
            };
        }
    }
}

export const postWriteApi = new PostWriteApi();