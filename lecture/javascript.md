# Javascript

강의에서 사용된 Javascript 문법, 기능

## Import and Export

- 모든 파일은 독립된 module이므로, module A가 module B의 코드를 사용하려면
  - Module B가 export한 코드를
  - Module A에서 import한 뒤 사용해야 함
- Export
  - `export default` : File(module) 전체에서 export하는 variable 또는 function
    ```javascript
    import express from "express";
    const router = express.Router();
    //...
    export default router;
    ```
  - Variable 또는 function을 개별적으로 export할 경우, 각 variable 또는 function에 `export` 키워드를 각각 사용
    ```javascript
    import express from "express";
    export const feature1 = (req, res) => res.end();
    export const feature2 = (req, res) => res.end();
    ```
  - 두 방식은 import하는 방법에서 차이를 보인다.
- Import

  - 현재 module로부터 import하려는 module의 상대 경로로 참조
    ```javascript
    /* - 파일 구조:
         server.js
         /routers
           - globalRouter.js
       - `server.js`에서 `globalRouter.js` module을 import
     */
    import globalRouter from "./routers/globalRouter";
    ```
  - default export를 import할 때는 **아무 이름이나 사용해도 됨**. nodeJS가 내부적으로 default export되는 식별자 이름으로 변환해 줌
    ```javascript
    import globalRouter from "./routers/globalRouter";
    // or
    import global from "./routers/globalRouter";
    ```
  - individual export를 import할 때는 중괄호(`{}`) 안에서 export되는 식별자 이름을 **정확히 동일하게** 사용해야 함
    ```javascript
    import { feature1, feature2 } from "./routers/globalRouter";
    ```
  - 한 file(module)에서 두 가지 방법으로 export 가능

    ```javascript
    // ModuleA.js
    export const feat1 = () => console.log("feature1");
    export const feat2 = () => console.log("feature2");
    const defaultFeat = () => console.log("default feature");
    export default defaultFeat;

    // ModuleB.js
    import defaultFeature from "ModuleA";
    import { feat1, feat2 } from "ModuleA";
    ```

## setTimeout

- `setTimeout(callback,timeout)` : `timeout`(ms) 대기 후 `callback` 실행
- `setTimeout(callback,timeout)`을 실행하면 브라우저가 `id`를 반환함
- 이 `id`를 `clearTimeout(id)`에 넣으면 해당 timeout을 취소시킬 수 있다.

### Date를 활용한 Time Formatting

- `Date` object를 통해 time format을 쉽게 변환할 수 있다.
  - '1970/1/1'을 기준으로 특정 시점까지 시간을 ms 단위로 사용함
- `toISOString` : ISO8601 format `yyyy-MM-ddThh:mm:ss.zzzZ` 문자열 반환
  - GMT 0 기준시 사용
- Date string에서 `hh:mm:ss` 부분만 잘라내기
  - `substr(startIndex, length)` : `startIndex`부터 `length`만큼의 문자열 반환
    - _Deprecaetd API이므로 `subString()`을 사용한다._
  - `subString(startIndex, endIndex)` : 문자열에서 `startIndex` ~ `endIndex`까지의 문자열 반환
- 코드 예시
  ```js
  // 00:00:00 부분만 잘라서 substring을 가져온다.
  new Date(timestamp).toISOString().substr(11, 8);
  // or
  new Date(seconds * 1000).toISOString().substring(14, 19);
  ```

## fetch

- Javascript에서 URL로 요청을 보내는 방법
- `fetch(URL,requestInit)`
- POST request : `requestInit` object의 `method`로 설정
  ```js
  fetch(`/api/videos/{VIDEO_ID}/view`, { method: "POST" });
  ```
- Request with body
  - Body에 data를 담아서 보낼 때는 text로 전송해야 함
    ```js
    fetch(`/api/videos/${videoId}/comment`, {
      method: "POST",
      body: "some data",
    });
    ```
  - 크기가 큰 여러 개의 data를 전송할 때는 **`JSON.stringify(object)`**를 사용해서 **object를 JSON string으로 변환**한 뒤 전송
    ```js
    fetch(`/api/videos/${videoId}/comment`, {
      method: "POST",
      body: JSON.stringify({ text }),
      headers: { "Content-Type": "application/json" },
    });
    ```
    - 이 때, body payload를 JSON으로 parsing해야 한다는 것을 backend에게 알려주기 위해 header에 **"Content-Type**을 `application/json`으로 명시해야 함

## Save custom data in the HTML and Get the value in the Javascript code

- `data-value` attribute를 HTML element tag에 저장해 두면
  ```html
  <article
    id="electric-cars"
    data-columns="3"
    data-index-number="12314"
    data-parent="cars"
  >
    ...
  </article>
  ```
- Javascript에서 `element.dataset.value`로 저장한 값을 사용할 수 있음
  ```js
  const article = document.querySelector("#electric-cars");
  article.dataset.columns; // "3"
  article.dataset.indexNumber; // "12314"
  article.dataset.parent; // "cars"
  ```
- `data-value` attribute의 `value`는 javascript에서 대소문자 구분 없이 모두 소문자로 표시됨
- **Javascript 쪽에서 camel case로 값을 받아오고 싶다면 HTML에서는 `-`로 구분해야 한다.**

## Browser Object URL

- `URL.createObjectURL(object)` : object URL 반환
  - Browser memory에서만 사용 가능한 URL 생성
  - Object를 browser의 in-memory에 저장해 두고 해당 object에 접근할 수 있는 URL을 반환한다.
  - URL만 보면 server에 의해 hosting되는 것처럼 보지만 실제로는 아님 (URL에 직접 접근 불가)
- `URL.revokeObjectURL(url)`
  - `URL.createObjectURL(object)`로 생성한 url을 memory에서 삭제
  - 더 이상 사용하지 않는 url을 메모리에서 삭제하여 성능 최적화

## Download file from href in `<a>` tag

```js
const a = document.createElement("a");
a.href = fileUrl;
a.download = "filename.mp4"; // mp4로 변환했으므로 확장자를 `mp4`로 명시
document.body.appendChild(a);
a.click();
```

- HTML에서 `<a>` tag에 `download` attribute를 추가하면 `href` 경로로 이동하는 대신 파일로 다운로드함
- `download="filename"` : 다운로드하는 file의 이름을 `filename`으로 변경
- Javascript에서도 `download` 속성에 `filename`을 할당함으로써 다운로드 링크로 변경
