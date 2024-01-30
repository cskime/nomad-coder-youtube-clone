# FFmpeg

- FFmpeg를 사용해서 webm -> mp4 변환
  - `.webm`은 모든 환경에서 재생하지 못할 수도 있음 (e.g. iOS에서는 실행 불가)
  - 범용적으로 실행할 수 있는 format으로 변환
- FFmpeg를 사용해서 video thumbnail 추출
- Video, audio, multimedia files & stream를 다를 수 있는 software
- Video 압축, 포맷, 변환, 화질, 오디오 추출, screenshot 등등
- Console에서 실행해야 함 (not from a browser)
  - **backend에서** 실행
  - FFmpeg를 사용해서 다운로드한 video 파일을 매번 mp4로 변환하려면 server 비용이 필요함
  - Video 용량이 클수록 server 자원이 더 필요할 것
- Server 없이 동작하기 위해 **WebAssembly** 사용 -> `ffmpeg.wasm`
  - Server가 아닌 사용자의 컴퓨터 자원을 사용해서 Video 처리 작업을 실행할 것

## Web Assembly

- Website가 속도가 빠른 Javascript가 아닌 다른 코드를 실행할 수 있게 해 줌 (e.g. C, go, Rust, ...)
- Javascript는 Video 변환 등의 처리를 실행할 만큼 빠르지 않기 때문에 client에서 직접 처리하기 어려움

## FFmpeg.wasm

- `FFmpeg.wasm`을 사용하면 C로 작성된 FFmpeg 프로그램을 브라우저에서 web assembly를 통해 실행시킬 수 있음
- 이 Javascript code는 브라우저에서 실행되지만, file system을 사용하는 등 컴퓨터 자체에서 실행되는 것처럼 보인다.
  - 브라우저는 보안 상 이유로 file system에 직접 접근할 수 없음
  - `FFmpeg.wasm`은 브라우저 안에서 특별한 공간을 만들어서 file system처럼 다룰 수 있음
  - Media file을 읽고 변환해서 내보낼 수 있는데, 내보낸 file은 브라우저 안에 저장됨
  - 브라우저에 저장된 file은 `URL.createObjectURL()` 함수로 URL을 추출해서 접근할 수 있음
- npm package 설치
  - `@ffmpeg/ffmpeg` : FFmpeg class
  - `@ffmpeg/util` : FFmpeg에서 사용하는 utility

### Transcode a video from `.webm` to `mp4`

1. Import
   ```js
   import { FFmpeg } from "@ffmpeg/ffmpeg";
   import { fetchFile } from "@ffmpeg/util";
   ```
2. Instance 생성 및 FFmpeg load
   ```js
   const ffmpeg = new FFmpeg();
   await ffmpeg.load({ log: true });
   ```
3. FFmpeg로 변환할 media file을 `ffmpeg.wasm`에 write
   ```js
   await ffmpeg.writeFile("recording.webm", await fetchFile(videoFile));
   ```
   - `fetchFile(videoFile)` : blob으로부터 file data를 가져옴
4. 변환
   ```js
   await ffmpeg.exec(["-i", "recording.webm", "-r", "60", "output.mp4"]);
   ```
   - 3에서 write한 file(`recording.webm`)을 input으로 받아서(`-i`)
   - `-r`, `60` : 영상을 초당 60프레임 인코딩으로 변환(`output.mp4`)
   - 변환된 file이 저장되는 위치는 `ffmpeg.wasm`의 file system
   - FFmpeg가 파일을 변환하는데 수초~수분 소요될 수 있음
5. 변환된 file을 Javascript로 read
   ```js
   const mp4File = await ffmpeg.readFile("output.mp4");
   ```
   - Javascript는 file을 unsigned integer array(`Uint8Array`)로 표현 (실제 파일, 여기선 videoFile)
6. 변환된 file을 브라우저에서 사용할 수 있는 blob으로 변환
   ```js
   const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
   ```
   - `Blob`
     - Binary 정보를 가진 file의 종류. File-like javascript object
     - Binary data를 사용해서 생성
   - `buffer`
     - Blob의(video file의) binary data(raw data).
     - `buffer`를 통해 file의 binary data에 접근
7. Blob의 URL을 얻어서 다운로드
   ```js
   const mp4Url = URL.createObjectURL(mp4Blob);
   const a = document.createElement("a");
   a.href = mp4Url;
   a.download = "MyRecording.mp4"; // mp4로 변환했으므로 확장자를 `mp4`로 명시
   document.body.appendChild(a);
   a.click();
   ```

### Create thumbnail image from the video

1. 영상에서 thumbnail로 사용할 부분을 따와서 JPEG 파일로 저장
   ```js
   await ffmpeg.exec([
     "-i",
     videoInputName,
     "-ss",
     "00:00:01",
     "-frames:v",
     "1",
     "thumbnail.jpg",
   ]);
   ```
   - `-ss`, `00:00:01` : Video에서 screenshot으로 사용할 부분 지정
   - `-frames:v`, `1` : Screenshot 개수 지정
   - `thumbnail.jpg` : Screenshot filename
2. Read the screenshot
   ```js
   const thumbnailFile = await ffmpeg.readFile(thumbnailOutputName);
   ```
3. Create Blob
   ```js
   const thumbnailBlob = new Blob([thumbnailFile.buffer], {
     type: "image/jpeg",
   });
   ```
4. Create URL from Blob and download it
   ```js
   const thumbnailUrl = URL.createObjectURL(thumbnailBlob);
   const thumbnailAnchor = document.createElement("a");
   thumbnailAnchor.href = thumbnailUrl;
   thumbnailAnchor.download = "MyThumbnail.jpeg";
   document.body.appendChild(thumbnailAnchor);
   thumbnailAnchor.click();
   ```

### Delete unused files

- 다운로드까지 완료하고 더 이상 사용하지 않는 file을 `ffmpeg.wasm`의 file system에서 삭제
  ```js
  await ffmpeg.deleteFile("recording.webm"); // video input file 삭제
  await ffmpeg.deleteFile("output.mp4"); // video output file 삭제
  await ffmpeg.deleteFile("thumbnail.jpg"); // video output file 삭제
  ```
