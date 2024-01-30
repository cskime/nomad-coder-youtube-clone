# Video Element

- HTML `<video>` element 사용법
- Custom controls 만들기

## Source

- `src` : Media source URL
- `HTMLMediaElement.srcObject`
  - Media 관련 source들. URL을 사용하는 `src` attribute와는 다르다.
  - Source object : `MediaStream`, `MediaSource`, `Blob`, `File`

## Play/Pause

- 재생
  - function : `HTMLMediaElement.play()`
  - event : `play`
- 일시정지
  - function : `HTMLMediaElement.pause()`
  - event : `pause`
- `HTMLMediaElement.loop` : Media가 끝까지 재생되었을 때 반복 재생 여부 (get/set)

## Volume

- 음소거 : `video.muted`
- 볼륨 조절 : `video.volume`

## Playtime

- `loadedmetadata` : Video의 meta data가 load된 후 발생하는 event
  - Meta data : Video source를 제외한 video의 다른 정보들 (Duration, dimension 등)
- `timeupdate` : Video의 `HTMLMediaElement.currentTime`이 변경될 때 마다 발생하는 event
- `HTMLMediaElement.duration` : Video의 전체 running time (sec 단위)
  - Read only
- `HTMLMediaElement.currentTime` : Video가 현재 재생되고 있는 시간 (sec 단위)
  - Get/set 모두 가능
  - Custom range input으로 video 재생 위치를 조절할 때 `currentTime` 값을 변경

## Full Screen

- `Element.requestFullScreen()` : Video를 full screen으로 열어준다.
  - `Element`의 하위 element들이 모두 full screen에 포함됨
- `Document.exitFullScreen` : Full screen mode 종료
- `Document.fullScreenElement` : 현재 full screen으로 보여지고 있는 element

## Video 종료 감지

- Video element에서 발생하는 `ended` event(`HTMLMediaElement`)를 통해 video가 끝나는 시점을 알 수 있다.
