import User from "../models/User";
import Video from "../models/Video";
import Comment from "../models/Comment";

export const home = async (req, res) => {
  try {
    // empty search term == serach everything
    const videos = await Video.find({})
      .sort({ createdAt: "desc" })
      .populate("owner");
    console.log(videos);
    res.render("home", { pageTitle: "Home", videos });
  } catch (error) {
    console.log(error);
    res.render("server-error");
  }
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: { $regex: new RegExp(`^${keyword}`, "i") },
    }).populate("owner");
  }
  res.render("search", { pageTitle: "Search", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner").populate("comments");

  /* */
  // const owner = await User.findById(video.owner);

  /* [ 유효하지 않은 id를 입력한 경우 ]
    - id가 URL에 있기 때문에, id를 바꿔서 입력할 수도 있음
    - 이 때, database에서 해당 id로 document를 찾을 수 없다면 `null` 반환
    - `video`가 `null`인 상태로 사용하여 발생하는 error를 별도로 처리해야 함

      [ Error handling convention ]
      - Block의 가장 바깥 scope에서는 정상 실행될 코드를 작성하고 싶음
      - `if`는 error handling을 위해 사용 후 곧바로 return
   */
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  return res.render("watch", { pageTitle: video.title, video });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }

  // Video를 upload한 사용자가 아니면 home으로 redirect
  // video.owner는 `ObjectId` type인 object
  // req.session.user._id는 `string` type인 value
  if (String(video.owner) !== req.session.user._id) {
    req.flash("error", "Not authorized");
    return res.status(403).redirect("/");
  }

  return res.render("edit", { pageTitle: `Edit ${video.title}`, video });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.sesion;
  const { title, description, hashtags } = req.body;

  /*  [ Array database 테스트 ]
      - 임의의 data를 사용해서 동작 확인
      - Fake data에 data를 변경할 때, Javascript object의 특성(mutable)에 의한 문법을 사용할 수 있음
        1. Javascript object는 mutable value
        2. `videos` array의 item은 object이므로 직접 값을 변경할 수 있음
        3. 이 때, `id - 1`번째 object의 title을 변경하면 array 자체가 변경되는 것과 같음
        4. Javascript array도 object 이므로 직접 값을 변경할 수 있음
  */
  // videos[id - 1].title = title;

  /* [ Update Model ]
    - Data updating 과정
      - id로 model을 가져옴
      - 변경되는 값들을 model에 할당
      - Save the model
    - 새 data를 일일이 업데이트하지 않고 `findByIdAndUpdate(id,query)`로 한 번에 처리 가능
    - 이 때, video document를 직접 사용하지 않게 됨
    - 특정 video가 존재하는지 확인하기 위해 `findById()`를 사용할 필요 없이 `exist(filter)`로 확인 가능
  */
  // const video = await Video.findById(id);
  // if (!video) {
  //   return res.render("404", { pageTitle: "Video not found." });
  // }
  // video.title = title;
  // video.description = description;
  // video.hashtags = hashtags
  //   .split(",")
  //   .map((word) => (word.startsWith("#") ? word : `#${word}`));
  // await video.save();

  // 특정 id에 해당하는 video data가 존재하는지 확인
  const video = await Video.exists({ _id: id });
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }

  if (String(video.owner) !== _id) {
    req.flash("error", "You are not the owner fo the video.");
    return res.status(403).redirect("/");
  }

  // `id`와 매칭되는 data를 찾아서 `updateObject`로 update할 field 및 value 전달
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });

  req.flash("success", "Changes saved.");
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { title, description, hashtags },
    files: { video, thumbnail },
  } = req;

  /*  [ Create New Model ]
      - New data 생성 과정
        - Video model로부터 instance 생성 (`new Video({})`)
        - 생성한 instance를 database에 저장 (`save()`)
      - Instance 생성 및 저장을 `Video.create({})`로 한 번에 처리 가능
  */
  // const video = new Video({
  //   title,
  //   description,
  //   createdAt: Date.now(),
  //   hashtags: hashtags.split(",").map((word) => `#${word}`),
  //   meta: {
  //     views: 0,
  //     rating: 0,
  //   },
  // });
  // await video.save();

  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl: video[0].path,
      thumbnailUrl: thumbnail[0].path,
      owner: _id,
      createdAt: Date.now(),

      /*  [ Hashtag Formatting 분리 ]
          - 콤마(`,`)로 구분되는 단순 문자열을 array로 변환하는 작업이 필요함
          - Hashtag 목록은 `,`로 구분되는 문자열로 다뤄지므로, database에 write할 때 마다 변환해야 함
          - 중복 코드를 제거하기 위해 formatting code를 분리한다.
          - Model의 schema 정의 단계에서 전처리 코드를 미리 등록해 두고 호출되도록 만듦 (Video.js 참고)
      */
      // hashtags: hashtags.split(",").map((word) => `#${wor d}`), // 분리 전
      // hashtags, // Middleware 사용
      // hashtags: formatHashtags(hashtags), // 일반 function 사용
      hashtags: Video.formatHashtags(hashtags), // Static function 사용

      /*  [ Default Value 적용 ]
          - meta는 default value를 설정했으므로, model 생성 시 값을 넣지 않아도 됨
      */
      // meta: {
      //   views: 0,
      //   rating: 0,
      // },
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;

  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }

  if (String(video.owner) !== _id) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndDelete(id);
  res.redirect("/");
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    // Backend에서 view를 rendering하지 않을 것이므로 status code만 보낸다.
    // Status code는 요청이 정상적으로 수행되었는지 알려주는 것
    // Frontend에서는 조회수를 더하지 못했다는 것을 알 필요는 없으므로 status code를 사용하지는 않을 것
    // 조회수를 올릴 때 error가 발생했다는 것을 사용자에게 알려 줄 필요 없음
    return res.sendStatus(404);
  }
  video.meta.views += 1;
  await video.save();
  res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    params: { id },
    body: { text },
    session: { user },
  } = req;

  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }

  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  await video.save();

  /* Browser에서 서버 요청을 최소화하기 위해 comment를 생성하면 직접 element를 만들어서 보여줌
   * 이후 새로고침 없이 그 comment를 삭제하려는 경우, browser에서 comment id가 필요함
   * Server가 client에 response를 받을 때 생성된 comment id를 보내주면, browser가 사용할 수 있음
   */
  // res.sendStatus(201);
  res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) {
    return res.sendStatus(404);
  }

  if (video.owner._id.toString() !== req.session.user._id) {
    return res.sendStatus(403);
  }

  const commentIds = video.comments.map((value) => value.toString());
  const index = commentIds.findIndex((value) => value === req.body.commentId);
  if (!index) {
    return res.sendStatus(403);
  }

  await Comment.findByIdAndDelete(commentIds[index]);
  video.comments.splice(index, 1);
  await video.save();

  res.sendStatus(204);
};
