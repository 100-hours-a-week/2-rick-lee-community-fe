// entities/post/api/postDetailApi.js

/**
 * 게시글 상세 API 클래스
 * 게시글 상세 데이터 및 상호작용 API 요청 처리
 */
export class PostDetailApi {
    constructor() {
        this.API_BASE_URL = 'https://api.example.com';
    }

    /**
     * 게시글 상세 정보 조회
     * @param {string} postId - 게시글 ID
     * @returns {Promise<Object>} 게시글 상세 정보
     */
    async getPostDetail(postId) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/posts/${postId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || '게시글을 불러오는데 실패했습니다.',
                    data: null
                };
            }

            return {
                success: true,
                data: data.data
            };
        } catch (error) {
            console.error('게시글 상세 조회 중 오류:', error);
            return {
                success: false,
                message: '네트워크 오류가 발생했습니다.',
                data: null
            };
        }
    }

    /**
     * 게시글 댓글 목록 조회
     * @param {string} postId - 게시글 ID
     * @returns {Promise<Object>} 댓글 목록
     */
    async getComments(postId) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/posts/${postId}/comments`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || '댓글을 불러오는데 실패했습니다.',
                    data: null
                };
            }

            return {
                success: true,
                data: data.data
            };
        } catch (error) {
            console.error('댓글 목록 조회 중 오류:', error);
            return {
                success: false,
                message: '네트워크 오류가 발생했습니다.',
                data: null
            };
        }
    }

    /**
     * 댓글 작성
     * @param {string} postId - 게시글 ID
     * @param {string} content - 댓글 내용
     * @returns {Promise<Object>} 작성 결과
     */
    async createComment(postId, content) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                },
                body: JSON.stringify({ content })
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || '댓글 작성에 실패했습니다.',
                    data: null
                };
            }

            return {
                success: true,
                data: data.data
            };
        } catch (error) {
            console.error('댓글 작성 중 오류:', error);
            return {
                success: false,
                message: '네트워크 오류가 발생했습니다.',
                data: null
            };
        }
    }

    /**
     * 댓글 수정
     * @param {string} postId - 게시글 ID
     * @param {string} commentId - 댓글 ID
     * @param {string} content - 수정할 내용
     * @returns {Promise<Object>} 수정 결과
     */
    async updateComment(postId, commentId, content) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                },
                body: JSON.stringify({ content })
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || '댓글 수정에 실패했습니다.',
                    data: null
                };
            }

            return {
                success: true,
                data: data.data
            };
        } catch (error) {
            console.error('댓글 수정 중 오류:', error);
            return {
                success: false,
                message: '네트워크 오류가 발생했습니다.',
                data: null
            };
        }
    }

    /**
     * 댓글 삭제
     * @param {string} postId - 게시글 ID
     * @param {string} commentId - 댓글 ID
     * @returns {Promise<Object>} 삭제 결과
     */
    async deleteComment(postId, commentId) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || '댓글 삭제에 실패했습니다.',
                    data: null
                };
            }

            return {
                success: true,
                data: data.data
            };
        } catch (error) {
            console.error('댓글 삭제 중 오류:', error);
            return {
                success: false,
                message: '네트워크 오류가 발생했습니다.',
                data: null
            };
        }
    }

    /**
     * 게시글 수정
     * @param {string} postId - 게시글 ID
     * @param {Object} postData - 수정할 게시글 데이터
     * @returns {Promise<Object>} 수정 결과
     */
    async updatePost(postId, postData) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                },
                body: JSON.stringify(postData)
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || '게시글 수정에 실패했습니다.',
                    data: null
                };
            }

            return {
                success: true,
                data: data.data
            };
        } catch (error) {
            console.error('게시글 수정 중 오류:', error);
            return {
                success: false,
                message: '네트워크 오류가 발생했습니다.',
                data: null
            };
        }
    }

    /**
     * 게시글 삭제
     * @param {string} postId - 게시글 ID
     * @returns {Promise<Object>} 삭제 결과
     */
    async deletePost(postId) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || '게시글 삭제에 실패했습니다.',
                    data: null
                };
            }

            return {
                success: true,
                data: data.data
            };
        } catch (error) {
            console.error('게시글 삭제 중 오류:', error);
            return {
                success: false,
                message: '네트워크 오류가 발생했습니다.',
                data: null
            };
        }
    }

    /**
     * 게시글 좋아요 토글
     * @param {string} postId - 게시글 ID
     * @param {boolean} like - 좋아요 상태
     * @returns {Promise<Object>} 처리 결과
     */
    async toggleLike(postId, like) {
        try {
            const method = like ? 'POST' : 'DELETE';
            const response = await fetch(`${this.API_BASE_URL}/posts/${postId}/likes`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || '좋아요 처리에 실패했습니다.',
                    data: null
                };
            }

            return {
                success: true,
                data: data.data
            };
        } catch (error) {
            console.error('좋아요 처리 중 오류:', error);
            return {
                success: false,
                message: '네트워크 오류가 발생했습니다.',
                data: null
            };
        }
    }
}

export const postDetailApi = new PostDetailApi();