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

## fetch

- Javascript에서 URL로 요청을 보내는 방법
- `fetch(URL,init)`
  ```js
  fetch(`/api/videos/{VIDEO_ID}/view`, { method: "POST" });
  ```
  - `init`에 전달하는 object에서 `method`를 변경하여 POST request를 보낸다.

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
