class UserStorage {
    constructor() {
        this.storage = localStorage;
        this.USERS_KEY = 'users';
        this.CURRENT_USER_KEY = 'currentUser';
    }

    // 모든 회원 정보 가져오기
    getAllUsers() {
        try {
            const users = this.storage.getItem(this.USERS_KEY);
            return users ? JSON.parse(users) : [];
        } catch (error) {
            console.error('회원 정보 불러오기 중 오류:', error);
            return [];
        }
    }

    // 회원 등록
    registerUser(userData) {
        try {
            const users = this.getAllUsers();
            // 이메일 중복 체크
            if (users.some(user => user.email === userData.email)) {
                return { success: false, message: '이미 등록된 이메일입니다.' };
            }
            // 새 회원 추가
            users.push({
                ...userData,
                id: Date.now().toString(),
                createdAt: new Date().toISOString()
            });
            this.storage.setItem(this.USERS_KEY, JSON.stringify(users));
            return { success: true, message: '회원가입이 완료되었습니다.' };
        } catch (error) {
            console.error('회원 등록 중 오류:', error);
            return { success: false, message: '회원가입 처리 중 오류가 발생했습니다.' };
        }
    }

    // 로그인
    login(email, password) {
        try {
            const users = this.getAllUsers();
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                this.storage.setItem(this.CURRENT_USER_KEY, JSON.stringify({
                    ...user,
                    lastLogin: new Date().toISOString()
                }));
                return { success: true, user };
            }
            return { success: false, message: '이메일 또는 비밀번호가 일치하지 않습니다.' };
        } catch (error) {
            console.error('로그인 중 오류:', error);
            return { success: false, message: '로그인 처리 중 오류가 발생했습니다.' };
        }
    }

    // 현재 로그인한 사용자 정보
    getCurrentUser() {
        try {
            const user = this.storage.getItem(this.CURRENT_USER_KEY);
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('현재 사용자 정보 불러오기 중 오류:', error);
            return null;
        }
    }

    // 로그아웃
    logout() {
        this.storage.removeItem(this.CURRENT_USER_KEY);
    }

    // 회원 정보 수정
    updateUser(userId, updateData) {
        try {
            const users = this.getAllUsers();
            const userIndex = users.findIndex(user => user.id === userId);
            
            if (userIndex === -1) {
                return { success: false, message: '사용자를 찾을 수 없습니다.' };
            }

            users[userIndex] = {
                ...users[userIndex],
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            this.storage.setItem(this.USERS_KEY, JSON.stringify(users));
            return { success: true, user: users[userIndex] };
        } catch (error) {
            console.error('회원 정보 수정 중 오류:', error);
            return { success: false, message: '회원 정보 수정 중 오류가 발생했습니다.' };
        }
    }
}

export const userStorage = new UserStorage();