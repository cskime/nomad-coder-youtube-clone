const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const addComment = (text, commentId) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.className = "video__comment";
  newComment.dataset.id = commentId;
  const commentIcon = document.createElement("i");
  commentIcon.className = "fas fa-comment";
  const commentText = document.createElement("span");
  commentText.innerText = text;
  const commentRemove = document.createElement("span");
  newComment.appendChild(commentIcon);
  newComment.appendChild(commentText);
  videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
  // code만 실행되고 page를 새로고침하는 브라우저의 기본 동작을 막는다.
  event.preventDefault();

  const textarea = form.querySelector("textarea");
  const videoId = videoContainer.dataset.videoId;
  const text = textarea.value;

  if (text === "") {
    return;
  }

  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    body: JSON.stringify({ text }),
    headers: {
      // Server에게 body가 JSON으로 처리되어야 한다고 알려줌
      "Content-Type": "application/json",
    },
  });

  /* Comment 생성 후 page를 새로고침해서 새 comment를 보여줄 수도 있음
   * - window.location.reload()
   *
   * 하지만, 매번 새로고침하면 모든 comment를 계속 로드해야 하므로 비용이 많이 든다.
   * 새 comment를 만들면 해당 comment의 HTML view를 직접 만들어서 보여주고,
   * 나중에 reload 될 때는 서버에서 받아온 comment를 보여주는 방식으로 효율을 개선한다.
   */
  if (response.status === 201) {
    // 새로 생성된 comment id를 server로부터 받아옴
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
  }

  textarea.value = "";
};

// <form> 안에 있는 button을 클릭할 때 발생하는 submit event를 사용해야 함
// Logout 상태에서는 <form>을 찾을 수 없으므로 예외처리
if (form) {
  form.addEventListener("submit", handleSubmit);
}
