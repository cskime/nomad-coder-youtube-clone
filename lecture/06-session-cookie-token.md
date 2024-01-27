# Session, Cookie, Token

- HTTP 요청은 stateless communication
  - 모든 요청들이 독립적으로, **서로의 상태(state)를 알 수 없음**
  - 다른 request가 아직 진행중인지, connection이 종료되었는지 등을 알 수 없음
- HTTP는 요청을 보내고 응답을 받으면 곧바로 연결이 종료된다.
- 즉, 요청이 끝나면 서버는 **요청을 보낸 client에 대한 정보를 잃어버림**
- 따라서, client는 서버에 요청을 보낼 때 마다 **누가 보낸 것인지 알려줘야 함** (자신의 정보를 알려줘야 함)

## Cookie

- Client(browser)와 server가 정보를 주고 받는 수단
- Cookie 생성 및 전달 과정
  1. Cookie는 server에서 만들어진다.
  2. Client 요청이 들어오면 관련된 처리 후 응답을 반환하면서 cookie를 함께 전달한다.
  3. Browser는 server가 보낸 cookie를 browser 내부의 안전한 공간에 저장해 둔다.
  4. 이후 해당 domain으로 server에 요청을 보낼 때 마다 cookie를 함께 전송한다.

### Cookie 구조

- Domain : Cookie를 만든 backend server
  - 브라우저는 domain별로 cookie를 저장함
  - 요청하는 domain에 해당하는 cookie만 서버로 전송함
- Expires
  - `Session`
    - 만료 날짜가 명시되지 않으면 브라우저에서 프로그램을 닫거나 컴퓨터를 재시작하면 session이 삭제됨
    - 사용자가 닫지 않는 한 계속 살아 있음
- Max Age : session의 만료 기한 설정
  - `cookie: { maxAge: 20000 }`

## Session

- Server에서 client를 식별하는 방법 중 하나
- Session은 server에서 생성되고, **session ID**가 cookie에 담겨 client로 전송된다.
- Client는 server 요청 시 session ID가 담긴 cookie를 함께 전송하여 server에게 로그인 된 사용자임을 알린다.
- Session ID : 로그인한 사용자를 식별하기 위한 ID
- Session DB : 로그인한 사용자의 정보를 저장하는 DB
- Client 식별 과정
  1. Client : 사용자 로그인 요청
  2. Server : Session 생성(발급)
  3. Server : Session DB에 session 및 사용자 정보 저장
  4. Server : Response를 보낼 때 session ID를 cookie에 담아서 전송
  5. Client : Session ID가 담긴 cookie를 안전한 장소에 저장
  6. Client : 로그인 이후 browser가 server에 요청을 보낼 때 마다 session ID가 담긴 cookie 전송
  7. Server : Client가 보낸 cookie로부터 session ID를 가져와서 session DB 조회
  8. Server : Session ID가 일치하는 사용자를 찾으면 로그인 처리

## Token

- Cookie를 사용할 수 없는 환경에서 사용자 인증을 위해 사용하는 값
- iOS/Android native app에서 많이 사용됨
- Process
  1. 사용자 로그인
  2. Server에서 token 생성 후 app에 전송
  3. App은 token을 안전한 곳에 저장
  4. 이후 app에서 server에 요청을 보낼 때 마다 token을 함께 전송
  5. 서버는 session DB에서 app이 보낸 token과 ID가 일치하는 사용자 정보를 찾으면 인증 처리

### JWT(JSON Web Token)

- 서버에서 **session 없이 인증**을 처리하기 위해 사용하는 toke
- Session은 사용자 정보를 모두 DB에 저장해서 사용하므로, 사용자가 늘어날수록 DB resource가 많이 필요함
- JWT는 서버에 사용자 정보를 저장하지 않고, **token의 유효성 검사만 수행**하여 인증 진행
- Process
  1. 사용자 로그인
  2. 서버에서 사용자 데이터를 서명(signing)된 token으로 변환하여 응답과 함께 전송
  3. 브라우저는 JWT를 안전한 장소에 저장해둠
  4. 로그인 이후 브라우저가 서버에 요청을 보낼 때 마다 JWT를 함께 보냄
  5. 서버는 JWT의 유효성 검사 수행 (e.g. 변조되지 않았는지, 만료되었는지 등)
  6. 유효성 검사에 성공하면 인증처리

## Session과 JWT(Token) 방식의 장단점

- Session 방식
  - 장점
    - 사용자 정보를 모두 DB에 저장하고 있으므로 추가 기능을 구현할 수 있음
    - 원격 로그아웃, 로그인 device 개수 제한 등
  - 단점
    - 사용자가 늘어남에 따라 더 많은 DB resource가 필요해짐 (비용 증가)
    - DB query에 의한 속도 최적화 필요
- JWT 방식
  - 장점
    - 서버에 사용자 정보를 저장하지 않고 간단하게 인증 처리 가능
    - DB를 추가로 사용하지 않아도 됨
  - 단점
    - JWT는 암호화되지 않았기 때문에 민감한 정보를 담지 말아야 함 (e.g. password)
    - 사용자가 많아지고 관리해야 할게 많아진다면 session 방식이 필요할 수 있음
