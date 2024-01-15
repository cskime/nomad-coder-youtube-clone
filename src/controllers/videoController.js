let videos = [
  {
    title: "First Video",
    rating: 5,
    comments: 2,
    createdAt: "2 minutes ago",
    views: 59,
    id: 1,
  },
  {
    title: "Second Video",
    rating: 5,
    comments: 2,
    createdAt: "2 minutes ago",
    views: 59,
    id: 2,
  },
  {
    title: "Third Video",
    rating: 5,
    comments: 2,
    createdAt: "2 minutes ago",
    views: 59,
    id: 3,
  },
];

export const trending = (req, res) => {
  return res.render("home", { pageTitle: "Home", videos });
};
export const watch = (req, res) => {
  const video = videos[req.params.id - 1];
  return res.render("watch", { pageTitle: `Watching: ${video.title}`, video });
};
export const getEdit = (req, res) => {
  const video = videos[req.params.id - 1];
  return res.render("edit", { pageTitle: `Editing: ${video.title}`, video });
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
export const search = (req, res) => res.send("Search");
export const remove = (req, res) => {
  res.send("Remove video");
};

export const upload = (req, res) => {
  res.send("Upload video");
};
