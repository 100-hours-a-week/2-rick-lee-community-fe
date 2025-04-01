# Front-end 소개

개인적인 고민과 개발을 주제로 서로 소통하는 커뮤니티 프로젝트입니다.  
Vanilla JavaScript를 기반으로 프레임워크에 의존하지 않고, 기능적이고 모듈화된 구조를 갖추고 있습니다.  
초기 화면부터 주요 기능, API 연동까지 직접 구현하였습니다.


## 🛠️ 개발 인원 및 기간

- **개발 기간** : 2024-02-19 ~ 2024-02-26
- **개발 인원** : 프론트엔드/백엔드 1명 (본인)



## 🧰 사용 기술 및 Tools

| 구분        | 기술명 |
|-------------|--------|
| Front-end   | Vanilla JS |
| Back-end    | Spring Boot |
<br/>
<br/>


## 🔗 Back-end

- **백엔드 링크**: [https://github.com/100-hours-a-week/2-rick-lee-community-be.git]


## 📁 폴더 구조

<details>
<summary>폴더 구조 보기/숨기기</summary>

```
## 📁 폴더 구조

📦 src  
├─ 📂 app                         # 애플리케이션 전역 설정 (라우팅, 상태 등)  
├─ 📂 entities                   # 비즈니스 핵심 도메인  
│  ├─ 📂 post  
│  │  └─ 📂 api                  # 게시글 관련 API  
│  └─ 📂 user  
│     ├─ 📂 api                  # 유저 관련 API  
│     └─ 📂 model                # 유저 상태, 타입 관리  
├─ 📂 features                   # 기능 단위 모듈  
│  ├─ 📂 auth                    # 인증 기능  
│  │  ├─ 📂 login  
│  │  │  ├─ 📂 model            # 로그인 상태 및 비즈니스 로직  
│  │  │  └─ 📂 ui               # 로그인 화면 구성  
│  │  └─ 📂 signup  
│  │     ├─ 📂 model            # 회원가입 상태 및 로직  
│  │     └─ 📂 ui               # 회원가입 화면 구성  
│  ├─ 📂 post                    # 게시글 기능  
│  │  ├─ 📂 delete              # 게시글 삭제  
│  │  ├─ 📂 detail              # 게시글 상세  
│  │  ├─ 📂 list                # 게시글 목록  
│  │  └─ 📂 write               # 게시글 작성  
│  └─ 📂 profile                 # 프로필 관리 기능  
│     ├─ 📂 changePassword      # 비밀번호 변경  
│     └─ 📂 modify              # 회원 정보 수정  
├─ 📂 pages                      # 실제 라우터 페이지  
│  ├─ 📂 auth  
│  │  ├─ 📂 login               # 로그인 페이지  
│  │  └─ 📂 signup              # 회원가입 페이지  
│  ├─ 📂 post  
│  │  ├─ 📂 details             # 게시글 상세 페이지  
│  │  ├─ 📂 list                # 게시글 목록 페이지  
│  │  └─ 📂 write               # 게시글 작성 페이지  
│  └─ 📂 profile  
│     ├─ 📂 changePasswd        # 비밀번호 변경 페이지  
│     └─ 📂 modify              # 프로필 수정 페이지  
├─ 📂 shared                     # 공통 컴포넌트 및 정적 리소스  
│  ├─ 📂 assets  
│  │  └─ 📂 images              # 이미지 파일  
│  └─ 📂 components  
│     └─ 📂 Header              # 공용 헤더 컴포넌트  
└─ 📂 utilities                  # 공용 유틸 함수 모음  
   ├─ 📂 api                     # axios 등 API 설정  
   └─ 📂 image                  # 이미지 관련 유틸

```

</details>

---

## 🖼️ 서비스 화면
### 로그인 / 회원가입

| 로그인     | 회원 가입 |
|----------|--------|
| ![login_page](https://github.com/user-attachments/assets/f03d3a3e-0695-445e-99ae-e7a90758511b) | ![signup_page](https://github.com/user-attachments/assets/f166b8cf-a787-4232-9b0f-2ccb38083727) |


### 게시글

| 게시글 목록          | 게시글 상세  |
|--------------|--------|
| ![게시글 목록](https://github.com/user-attachments/assets/0ca43ae7-2efc-405c-b40e-75413af75bdc) | ![게시글 상세](https://github.com/user-attachments/assets/a44e21bc-5e23-46e9-b2b2-b82a073ddff2) |

---

### 회원 정보 수정

| 회원 정보 수정 | 비밀번호 변경 |
|------------------|--------|
| ![프로필 수정](https://github.com/user-attachments/assets/9b5d6c17-2fb1-4acb-ab89-76cbcabf6456) | ![비밀번호 변경](https://github.com/user-attachments/assets/4517333e-3cd3-420e-8567-8bda4a7b8b8c) |


## 💬 프로젝트 후기

평소에 웹 페이지를 개발할 때 Vanilla가 아닌 React 라이브러리를 사용해서 개발을 하는데, 이번 프로젝트는 Vanilla만 사용해서 개발을 했습니다.  
Vanilla에서는 훅을 사용할 수 없기 때문에, 훅처럼 동작하는 코드를 만들기 위해 여러 방식으로 고민해보게 된 프로젝트였습니다.  
이번 경험을 통해 JavaScript의 동작 방식에 대해 더 깊이 이해할 수 있었고, 직접 UI 상태를 제어하고 처리하면서 프론트엔드 개발의 기초 체력을 키울 수 있었습니다.  
기능 추가를 더 하고 싶었지만 아이디어 부족으로 아쉬움이 남으며, 다음 프로젝트에서는 여러 핵심 기능을 구현하고, 현재 습득한 기술 및 지식을 적극 활용해 나가고 싶습니다.
