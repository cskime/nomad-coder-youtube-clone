# Video Record

## Video/Audio 가져오기

```js
const stream = await navigator.mediaDevices.getUserMedia(constraints);
```

- 카메라/마이크 사용 여부를 물어보고 권한을 얻어야 함
- Promise로 반환됨
- _Video/Audio stream_ 반환

## Constraints

- 사용할 device 설정
  ```js
  const constraints = { audio: true, video: true, }, // default setting
  ```
- Video width/height 설정
  ```js
  const constraints = {
    audio: true,
    video: {
      width: 1280,
      height: {
        ideal: 720,
        min: 720,
        max: 1080,
      },
    },
  };
  ```
- Mobile device에서 front/rear camera 사용 설정
  ```js
  const constraints = {
    audio: true,
    video: {
      facingMode: "user", // for mobile devices
      // or
      facingMode: {},
    },
  };
  ```

## Preview on Video

- Media stream을 가져와서 `<video>` element에 보여주기
  ```js
  const video = document.getElementById("preview");
  const stream = await navigator.mediaDevices.getUserMedia(constraints); // 1. Stream 가져오기
  video.srcObject = stream; // 2. `<video>` element의 source로 지정
  video.play(); // 3. Video element 재생 시작
  ```

## Recording using MediaRecorder

- `MediaRecorder`를 사용해서 video/audio stream 녹화
  ```js
  const recorder = new MediaRecorder(stream, { mimeType: "video/mp4" });
  recorder.start();
  ```
  - `mimeType`으로 video 확장자/형식 지정
    - `video/mp4` 등을 설정할 수 있지만 컴퓨터에서 지원하지 않으면 녹화할 수 없음
- Record 시작/종료
  - `start()`
  - `stop()` -> `dataavailable` event를 발생시킴
- Record 종료 후 처리
  - `dataavailable` event가 발생하면 final video data(`Blob`) 반환
    ```js
    recorder.ondataavailable = (evnet) => {
      const videoFile = URL.createObjectURL(event.data);
    };
    ```
  - 녹화된 video 재생 -> `<video>` element 사용
    ```js
    recorder.ondataavailable = (evnet) => {
      const videoURL = URL.createObjectURL(event.data);
      video.srcObject = null; // stream 재생 중지
      video.src = videoURL; // 녹화한 video로 교체 (URL이므로 src에 할당)
      video.loop = true; // 반복 재생 설정
      video.play(); // video 재생
    };
    ```

## Download Video

- 사용자가 browser에서 video를 우클릭하면 다운로드 가능
- Custom button을 사용해서 다운로드하려면 `<a>` tag를 활용한 trick이 필요함
  ```js
  const handleDownload = () => {
    const a = document.createElement("a"); // fake a tag 생성
    a.href = videoFile; // video file URL로 연결
    a.download = "MyRecording.webm"; // download 설정
    document.body.appendChild(a); // a tag를 임시로 HTML에 추가
    a.click(); // 임의로 click event를 발생시켜 다운로드 시작
  };
  ```
  - `download`에 file name을 지정하면 `href`에 설정한 URL로 이동하는 대신 `download` file name으로 파일을 다운로드함
  - `.webm` 확장자로 저장하면 재생 가능 -> 브라우저에서도 재생된다.
  - `click()`은 `body`에 추가되어 있는 element에 대해서만 실행되므로, body에 넣어준다.
