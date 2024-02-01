const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const handleSubmit = (event) => {
  // code만 실행되고 page를 새로고침하는 브라우저의 기본 동작을 막는다.
  event.preventDefault();

  const videoId = videoContainer.dataset.videoId;
  const text = form.querySelector("textarea").value;

  if (text === "") {
    return;
  }

  fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    body: JSON.stringify({ text }),
    headers: {
      // Server에게 body가 JSON으로 처리되어야 한다고 알려줌
      "Content-Type": "application/json",
    },
  });
};

// <form> 안에 있는 button을 클릭할 때 발생하는 submit event를 사용해야 함
// Logout 상태에서는 <form>을 찾을 수 없으므로 예외처리
if (form) {
  form.addEventListener("submit", handleSubmit);
}
