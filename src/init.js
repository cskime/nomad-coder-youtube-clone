/*  [ Init 코드 분리 ]
    - server.js는 server configuration을 위한 file
    - Database 관련 설정 및 pre-compile을 위한 import 등 초기화 코드를 init.js로 분리함
    - init.js에서 database와 model을 모두 로드한 뒤 server app을 실행함(starts listening)

    [ node.js 실행 파일 변경 ]
    - init.js에서 setting 완료 후 server app이 시작되도록 만들기 위해 server.js에서 app을 export함
    - `package.json`에서 `dev` script는 server.js를 실행함
    - 하지만, server.js는 server setting만 할 뿐 server를 시작시키지는 않음 (listening이 init.js로 이동)
    - 따라서, `package.json`에서 `dev` script가 init.js를 실행해야 함
    - init.js가 실행될 때 server.js로부터 app을 import하는 과정에서 server app이 생성됨
 */

import "./database";
import "./models/Video";
import "./models/User";
import app from "./server";

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} 🚀🚀`);
});
