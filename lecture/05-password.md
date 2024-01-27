# Password

- Database에 password를 원본 그대로 저장하면, 해킹 당했을 때 password가 유출될 수 있다.
- 사용자 비밀번호를 DB에 저장할 때 **암호화(hashing)**해서 저장해야 한다.
- 로그인 할 때 암호를 검증하는 방법
  1. 입력한 암호를 같은 방식으로 hashing
  2. **DB에 저장된 hashing된 암호와 입력한 암호의 hash value** 비교
  3. Hash 함수는 같은 입력에 대해 항상 같은 hash value를 반환하므로, 두 hash value가 같다면 암호가 일치하는 것
- Password를 다루는 시나리오
  1. 계정 생성 시 password 입력
  2. 입력한 password의 hash value 생성
  3. User 정보에 hashed password 저장
  4. 로그인 시 password 입력
  5. 입력한 password의 hash value 생성
  6. username 등으로 user data를 탐색하고, hash value가 서로 같은지 확인
  7. 두 hash value가 같다면 로그인 처리

## Bcrypt

- Password hashing function
- Rainbow table 공격(hashing된 password를 사용한 해킹 공격)을 막아준다.
- `bcrypt` package는 node.js app에서 bcrypt hashing function을 사용할 수 있다.

### Password 저장

```js
import bcrypt from "bcrypt";

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 5);
});
```

- 회원가입 또는 password 변경 시 새로운 password를 hashing해서 저장
- `pre("save", callback)` : Mongoose에서 `save`가 호출되면 함수 실행 전에 호출되는 `callback` 등록
- `this.isModified("password")`
  - Express hook에서 `callback` 함수 내부의 `this`에는 `save()`를 호출한 document instance가 바인딩됨
  - `isModified(field)`는 `field`의 값이 변경되었는지 여부를 반환함
  - 즉, User model이 추가 / 변경되었을 때 `password` field의 값이 변경된 경우에만 저장하려고 함
- `bcrypt.hash(password, saltRounds)`
  - `password` : 입력된 password
  - `saltRounds` : Hash 적용 횟수 지정. 위 코드에서는 password hash value를 만들기 위해 hashing 5회 수행

### Password Hash Value 비교

```js
import bcrypt from "bcrypt";

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, socialOnly: false });

  const isEqual = await bcrypt.compare(password, user.password);
  if (!isEqual) {
    return res.status(400).send("Wrong password.");
  }

  // Login...
};
```

- 입력된 password를 hashing해서 값을 비교할 수도 있지만,
- `bcrypt`의 `compare(input, encrypted)` 함수를 이용하면 쉽게 비교할 수 있다.
  - `input` : 입력한 password
  - `encrypted` : DB에 저장된 hash value
