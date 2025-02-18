class PostStorage {
    constructor() {
        this.storage = localStorage;
        this.POSTS_KEY = 'posts';
    }

    // 모든 게시글 정보 가져오기
    getAllPosts() {
        try {
            const posts = this.storage.getItem(this.POSTS_KEY);
            return posts ? JSON.parse(posts) : [];
        } catch (error) {
            console.error('게시글 정보 불러오기 중 오류:', error);
            return [];
        }
    }

    // 게시글 등록 (저장)
    addPost(postData) {
        try {
            const posts = this.getAllPosts();
            const newPost = {
                ...postData,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                viewCount: postData.viewCount || 0,
                commentCount: postData.commentCount || 0,
                likeCount: postData.likeCount || 0,
                liked: false
            };
            posts.push(newPost);
            this.storage.setItem(this.POSTS_KEY, JSON.stringify(posts));
            return { success: true, post: newPost };
        } catch (error) {
            console.error('게시글 등록 중 오류:', error);
            return { success: false, message: '게시글 등록 처리 중 오류가 발생했습니다.' };
        }
    }

    // 특정 게시글 정보 가져오기
    getPostById(postId) {
        try {
            const posts = this.getAllPosts();
            return posts.find(p => p.id === postId) || null;
        } catch (error) {
            console.error('게시글 가져오기 중 오류:', error);
            return null;
        }
    }

    // 게시글 업데이트 (제목, 내용, 좋아요 수, 댓글 수, 조회수 등)
    updatePost(postId, updateData) {
        try {
            const posts = this.getAllPosts();
            const index = posts.findIndex(p => p.id === postId);
            if (index === -1) {
                return { success: false, message: '게시글을 찾을 수 없습니다.' };
            }
            posts[index] = {
                ...posts[index],
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            this.storage.setItem(this.POSTS_KEY, JSON.stringify(posts));
            return { success: true, post: posts[index] };
        } catch (error) {
            console.error('게시글 업데이트 중 오류:', error);
            return { success: false, message: '게시글 업데이트 중 오류가 발생했습니다.' };
        }
    }

    // 게시글 삭제
    deletePost(postId) {
        try {
            const posts = this.getAllPosts();
            const filteredPosts = posts.filter(p => p.id !== postId);
            if (posts.length === filteredPosts.length) {
                return { success: false, message: '게시글을 찾을 수 없습니다.' };
            }
            this.storage.setItem(this.POSTS_KEY, JSON.stringify(filteredPosts));
            return { success: true, message: '게시글이 삭제되었습니다.' };
        } catch (error) {
            console.error('게시글 삭제 중 오류:', error);
            return { success: false, message: '게시글 삭제 중 오류가 발생했습니다.' };
        }
    }

    // 좋아요 토글: liked 상태와 likeCount 변경
    toggleLike(postId) {
        try {
            const post = this.getPostById(postId);
            if (!post) {
                return { success: false, message: '게시글을 찾을 수 없습니다.' };
            }
            post.liked = !post.liked;
            post.likeCount = post.liked ? post.likeCount + 1 : post.likeCount - 1;
            return this.updatePost(postId, { liked: post.liked, likeCount: post.likeCount });
        } catch (error) {
            console.error('좋아요 처리 중 오류:', error);
            return { success: false, message: '좋아요 처리 중 오류가 발생했습니다.' };
        }
    }
}

export const postStorage = new PostStorage();
