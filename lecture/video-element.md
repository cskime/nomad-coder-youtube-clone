# Video Element

- HTML `<video>` element 사용법
- Custom controls 만들기

## Play/Pause

- 재생
  - function : `HTMLMediaElement.play()`
  - event : `play`
- 일시정지
  - function : `HTMLMediaElement.pause()`
  - event : `pause`

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
