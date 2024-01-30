# API

- Application Programming Interface
- Backend가 view template을 렌더링하지 않을 때 frontend가 backend와 통신하는 방법
- API views : Template을 렌더링하지 않는 view
- SSR(Server Side Rendering)
  - Backend가 client(browser)에서 요청한 URL에 대해 HTML view를 rendering하는 것
- CSR(Client Side Rendering)
  - Frontend가 backend에게 요청을 보낸 뒤 응답으로 받는 결과를 이용해서 view를 rendering 하는 것
  - Backend로 요청을 보낼 때, backend가 다른 URL로 바꾸지 않음

## Frontend / Backend 분리

- Frontend는 vanilla JS, React.js 등으로 HTML view를 rendering하고 상호작용(interactivity)을 담당한다.
- Backend는 인증, database 등의 역할만 담당한다.
- Node.js에서 view template을 rendering하는 일은 드물다.
- Video 조회수를 갱신하고, video에 comment를 다는 기능에서는 CSR로 구현 (Pug로 렌더링하지 않음)
- 즉, 브라우저가 특정 URL로 요청을 보내서 백엔드가 어떤 동작을 수행하게 만드는 게 아니라, frontend에서 Javascript로 URL에 요청을 보내서 응답을 받아온 뒤 view에 필요한 동작을 수행한다.
- 브라우저가 요청하는게 아니라서 page URL 변경되지 않음 (backend가 view를 렌더링하지 않음)
