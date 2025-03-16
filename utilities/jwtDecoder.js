// /utilities/JwtDecoder.js
export class JwtDecoder {
    /**
     * JWT 토큰 디코딩 함수
     * @param {string} token - JWT 토큰
     * @returns {Object} 디코딩된 페이로드
     */
    parseJwt(token) {
        const base64Url = token.split('.')[1];
        if (!base64Url) {
            throw new Error("Invalid JWT token");
        }
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    }
}
