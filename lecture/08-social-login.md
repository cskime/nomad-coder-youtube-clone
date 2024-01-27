# Social Login

- Social network들은 OAuth로 로그인을 구현하므로 흐름은 비슷하다.
- GitHub login을 연동해 보면 다른 social login도 쉽게 구현할 수 있음
- GitHug social login 과정
  1. GitHub에 신원을 요청하기 위해 GitHub으로 redirect
  2. 사용자는 GitHub에서 email, password 등을 사용해서 로그인
     - GitHub이 password, security, email auth 등을 **대신 처리**해 준다.
  3. 사용자가 우리 웹사이트에 정보를 공유하는 것을 승인
     - 한 번 승인하고 나면, 이후 다시 OAuth 요청이 와도 **곧바로 redirect**됨
     - 이전에 authorize한 것을 기억하고 있음
  4. GitHub은 user를 token과 함께 다시 우리 웹사이트로 redirect
     - token은 짧은 시간 안에 만료될 것
  5. GitHub이 전달한 token으로 GitHub 사용자 정보를 가져와서 로그인을 위해 저장하고 사용

## GitHub Login

- GitHub login을 구현하려면 "OAuth application"를 먼저 만들어야 함
  - Homepage URL : `http://localhost:4000/`
  - Authorization callback URL : `http://localhost:4000/users/github/finish`
- [참고 : Authorizing OAuth apps | GitHub](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)

### 1. GitHub authorize URL로 redirect

```html
<a
  href="https://github.com/login/oauth/authorize?client_id={ID}}&allow_signup=false&scope=read:user user:email"
>
  Continue with GitHub &rarr;
</a>
```

- `client_id` : required parameter (OAuth app 생성 시 받은 ID)
- Default로 public data에만 접근할 수 있고, 다른 데이터를 더 사용하기 위해 추가 parameter 필요
  - `scope` : 사용자의 어떤 정보를 가져올 것인지 설정
    - 다른 private data도 받고 싶을 때 설정
      - `admin`, `public_key`, `notifications`, `user`, `delete`, ...
    - 필요한 정보만 요청해야 한다.
      - `read:user` : User profile 접근 요청 (read-only)
      - `user:email` : User email 접근 요청
    - `scope`에서 명시한 내용들이 나중에 API로 사용자 정보를 요청할 때 응답에 포함된다.
  - `allow_signup` : 사용자가 GitHub 계정이 없을 때 signup도 할 수 있게 할 건지 결정
    - `true`로 설정하면 GitHub 로그인 page로 redirect 됐을 때 GitHub 계정 생성 버튼이 추가된다.
- 이 때, URL이 너무 길고 여러 곳에서 반복해서 사용하기 어려우므로,
  1. HTML에서는 우리 서버의 다른 URL을 요청하고,
     ```html
     <a href="/users/github/start">Continue with GitHub &rarr;</a>
     ```
  2. Router에 추가한 뒤,
     ```js
     userRouter.get("/github/start", publicOnlyMiddleware, startGitHubLogin);
     ```
  3. Controller에서 Javascript로 URL을 생성한 뒤 redirect한다.
     ```js
     export const startGitHubLogin = (req, res) => {
       /* [ GitHub OAuth Request ] */
       const baseUrl = "https://github.com/login/oauth/authorize";
       const config = {
         client_id: process.env.GITHUB_CLIENT_ID,
         allow_signup: false,
         scope: "read:user user:email",
       };
       const params = new URLSearchParams(config).toString();
       res.redirect(`${baseUrl}?${params}`);
     };
     ```
     - `URLSearchParameters`을 사용해서 query parameter 조합
       - URL query parameter 생성에 사용
       - Schema를 정의한 object를 인수로 받아 *url encoded string*을 반환한다.
       - 이 때, object key는 parameter 형식과 일치해야 함

### 2. 사용자가 authorize한 뒤 처리

1. 사용자가 요청을 authorize하면 다시 우리 웹사이트로 redirect됨
   - GitHub OAuth app 만들 때 "Authorization callback URL"에 설정한 URL로 redirect됨
   - URL : `http://localhost:4000/users/github/finish?code={TEMP_TOKEN}`
   - Redirect URL의 query parameter에 `code`로 임시 token을 전달해 줌
   - `code`는 임시 token으로 약 10분동안 유효하다.
2. GitHub에서 전달해 준 token을 `access_token`으로 변환
   - `POST https://github.com/login/oauth/access_token`으로 아래 body data와 함께 request를 보낸다.
     - `client_id` : OAuth app의 ID
     - `client_secret` : OAuth app의 client secret key
       - **backend에만 존재해야 함. 외부에 공개되면 안됨**
       - OAuth secret key도 `.env`에 저장해서 관리해야 함
     - `code` : redirect로 받은 code
3. 응답으로 `access_token`을 받고, 이후 GitHub 사용자 정보를 조회할 때 사용
   - `access_token` -> API 호출에 사용
   - `token_type`
   - `scope`

### 3. access_token으로 User 정보 접근

- GitHub User 정보는 `GET https://api.github.com/user`으로 요청
  - Header에 `access_token`을 전달해야 함
  - `Authorization: token ${ACCESS_TOKEN}`
- User의 email 정보는 `GET https://api.github.com/user/emails`로 요청
  - User API의 응답에 email 정보가 없을 수 있으므로 email 목록을 따로 요청해서 가져옴
  - Header 동일
    ```json
    [
      {
        "email": "kcsol1005@gmail.com",
        "primary": true,
        "verified": true,
        "visibility": "public"
      },
      {
        "email": "42177438+cskime@users.noreply.github.com",
        "primary": false,
        "verified": true,
        "visibility": null
      },
      {
        "email": "sol1005@chungbuk.ac.kr",
        "primary": false,
        "verified": true,
        "visibility": null
      }
    ]
    ```
  - Email 목록 중 `primary`이면서 `verified`인 email을 찾는다.
    ```js
    const emailObject = emailData.find(
      (email) => email.primary && email.verified
    );
    ```

## 일반 사용자와 GitHub Login 사용자의 중복 처리

- GitHub 로그인 시 `userData`와 `emailData` 가져오기
  ```js
  const finishGitHubLogin = async (req, res) => {
    ...
    // GitHub API 호출 후 User 및 email data 가져오기
    const userData = await (await fetch(...)).json();
    const emailData = await (await fetch(...)).json();
  }
  ```
- GitHub으로 로그인해서 받은 email이 이미 database에 있는 경우 로그인 처리

  ```js
  const finishGitHubLogin = async (req, res) => {
    ...
    // GitHub email과 동일한 email로 저장된 user가 있는지 확인
    const emailObject = emailData.find(
      (email) => email.primary && email.verified
    );
    const existingUser = await User.findOne({ email: emailObject.email });

    if (existingUser) {
      // 동일한 email을 가진 User가 있다면 로그인 처리
      req.session.isLoggedIn = true;
      req.session.user = existingUser;
      return res.redirect("/");
    } else {
      // 동일한 email이 없다면 GitHub 사용자 정보로 가입 처리
      const user = await User.create({
        email: emailObject.email,
        username: userData.login,
        password: "",
        name: userData.name,
        location: userData.location,
        socialOnly: true,
      });
      req.session.isLoggedIn = true;
      req.session.user = existingUser;
      return res.redirect("/");
    }
  };
  ```

- 사용자가 GitHub으로 로그인했는지 확인할 수 있도록 User schema에 추가

  ```js
  const userSchema = new mongoose.Schema({
    // Social 계정으로 가입했을 때는 password가 없음
    // username과 password로 로그인 할 수 없으므로 알려주는 용도
    socialOnly: { type: Boolean, default: false },
    ...
  });
  ```

- GitHub으로 계정을 만들고 password로 로그인을 시도할 때 처리 추가
  - Password를 새로 만드는 페이지 추가
  - Social login으로 유도
