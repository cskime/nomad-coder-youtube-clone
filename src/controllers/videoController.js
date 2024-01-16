import Video from "../models/Video";

export const home = async (req, res) => {
  try {
    // empty search term == serach everything
    const videos = await Video.find({});
    res.render("home", { pageTitle: "Home", videos });
  } catch (error) {
    console.log(error);
    res.render("server-error");
  }
};
export const watch = (req, res) => {
  return res.render("watch", { pageTitle: `Watching` });
};
export const getEdit = (req, res) => {
  return res.render("edit", { pageTitle: `Editing` });
};
export const postEdit = (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  /* Javascript object의 특성에 의한 문법
    1. Javascript object는 mutable value
    2. `videos` array의 item은 object이므로 직접 값을 변경할 수 있음
    3. 이 때, `id - 1`번째 object의 title을 변경하면 array 자체가 변경되는 것과 같음
    4. Javascript array도 object 이므로 직접 값을 변경할 수 있음
  */
  videos[id - 1].title = title;

  return res.redirect(`/videos/${id}`);
};
export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};
export const postUpload = async (req, res) => {
  // add a video to the videos array
  const { title, description, hashtags } = req.body;
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
    await Video.create({
      title,
      description,
      createdAt: Date.now(),
      hashtags: hashtags.split(",").map((word) => `#${word}`),
      meta: {
        views: 0,
        rating: 0,
      },
    });
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};
