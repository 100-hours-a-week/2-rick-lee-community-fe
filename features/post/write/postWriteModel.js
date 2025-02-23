// features/post/write/model/postWriteModel.js
import { postWriteApi } from '/entities/post/api/postWriteApi.js';

/**
 * 게시글 작성 관련 비즈니스 로직을 처리하는 모델
 */
export class PostWriteModel {
    /**
     * 게시글 작성 폼 유효성 검사
     * @param {string} title - 게시글 제목
     * @param {string} content - 게시글 내용
     * @returns {Object} 유효성 검사 결과
     */
    validatePostForm(title, content) {
        // 필수 입력 확인
        if (!title || !content) {
            return {
                isValid: false,
                message: '제목, 내용 모두 작성해 주세요'
            };
        }

        // 제목 길이 검사
        if (title.length > 26) {
            return {
                isValid: false,
                message: '제목은 26자를 초과할 수 없습니다.'
            };
        }

        return {
            isValid: true,
            message: ''
        };
    }

    /**
     * 게시글 작성 요청
     * @param {Object} postData - 게시글 데이터
     * @returns {Promise<Object>} 게시글 작성 결과
     */
    async createPost(postData) {
        const validation = this.validatePostForm(postData.title, postData.content);
        if (!validation.isValid) {
            return {
                success: false,
                message: validation.message
            };
        }

        return await postWriteApi.createPost(postData);
    }
}

export const postWriteModel = new PostWriteModel();