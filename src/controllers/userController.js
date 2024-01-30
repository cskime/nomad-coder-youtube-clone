import User from "../models/User";
import bcrypt from "bcrypt";
import Video from "../models/Video";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;

  const pageTitle = "Join";

  /*  [ Password Confirmation ] */
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }

  /*  [ Username과 email 중 하나라도 중복되지 않도록 만들기 ]
      1. `username`과 `email` 각각 검사
         대해 `await User.exists({ value })`
      2. `username`과 `email`을 동시에 검사
        - `await User.exists({ username, email })`은 두 값이 모두 일치(AND)하는 것만 검색함
        - `$or` operator를 사용해서 둘 중 하나라도 일치하는 것을 검색해야 함
  */
  // const usernameExists = await User.exists({ username });
  // if (usernameExists) {
  //   return res.render("join", {
  //     pageTitle,
  //     errorMessage: "This username is already taken.",
  //   });
  // }
  // const emailExists = await User.exists({ email });
  // if (emailExists) {
  //   return res.render("join", {
  //     pageTitle,
  //     errorMessage: "This email is already taken.",
  //   });
  // }

  const isExists = await User.exists({ $or: [{ username }, { email }] });
  if (isExists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username/email is already taken.",
    });
  }

  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    res.redirect("/login");
  } catch (error) {
    res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: error._message,
    });
  }
};

export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, socialOnly: false });
  const pageTitle = "Login";

  /*  [ Check username ] */
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exists.",
    });
  }

  /*  [ Check password correctness ] */
  const isMatched = await bcrypt.compare(password, user.password);
  if (!isMatched) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong password.",
    });
  }

  /* [ Login 여부 저장 ] 
  - username을 갖는 `User`가 존재하고, password도 일치하면 login에 성공하는 것
  - Login에 성공하면 user 정보를 session에 저장
  - Session은 user(or client, or browser)마다 별도로 가짐
  */
  req.session.isLoggedIn = true;
  req.session.user = user;
  res.redirect("/");
};

export const startGitHubLogin = (req, res) => {
  /* [ GitHub OAuth Request ] */
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GITHUB_CLIENT_ID,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  res.redirect(`${baseUrl}?${params}`);
};

export const finishGitHubLogin = async (req, res) => {
  /*  [ Request Access Token using Code ] 
      - OAuth 요청 후 받은 `code`로 API 요청에 필요한 `access_token`을 받기 위한 POST 요청
  */
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  /*  [ Fetch in Node.js ]
      - fetch()는 원래 브라우저에서만 사용할 수 있었으므로 `node-fetch` package를 설치했어야 했음
      - Node.js v21에서 fetch API가 공식적으로 추가되어 package 없이 사용 가능
  */
  const data = await fetch(finalUrl, {
    method: "POST", // POST request
    headers: {
      Accept: "application/json", // 응답 data를 json으로 받음
    },
  });
  const json = await data.json();

  /*  [ Using User API with Access Token ] 
      - Access token을 받은 뒤 필요한 data 요청
  */
  if ("access_token" in json) {
    const { token_type, access_token } = json;
    const apiUrl = "https://api.github.com";

    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `${token_type} ${access_token}`, // Header로 token 전달
        },
      })
    ).json();

    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `${token_type} ${access_token}`, // Header로 token 전달
        },
      })
    ).json();

    const emailObject = emailData.find(
      (email) => email.primary && email.verified
    );
    if (!emailObject) {
      // notification
      // GitHub 로그인을 했지만 verified email이 없으니 믿을 수 없으므로 사용자에게 알려줌
      return res.redirect("/login");
    }

    let user = await User.findOne({ email: emailObject.email });
    if (!user) {
      user = await User.create({
        email: emailObject.email,
        username: userData.login,
        password: "",
        name: userData.name,
        location: userData.location,
        socialOnly: true,
        avatarUrl: userData.avatar_url,
      });
    } else {
      user.avatarUrl = userData.avatar_url;
    }

    req.session.isLoggedIn = true;
    req.session.user = user;

    await User.findByIdAndUpdate(user._id, { avatarUrl: user.avatarUrl });

    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};

export const getEdit = (req, res) => {
  res.render("edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
  // ES6+ pattenr matching 문법
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email, username, location },
    file,
  } = req;

  /* 변경하려는 email, username을 다른 user가 이미 사용하고 있다면 변경할 수 없게 막는다.
   * Database 검색 시 자기 자신은 제외하도록 query
   * 1. `$nor` : 해당 expression을 만족하지 않거나, expression에서 사용한 field가 없는 document 검색
   * 2. `$or`로 email과 username 중 매칭되는 것을 찾되, `$ne`로 `_id`가 다른 document만 검색
   *
   * 해당 query의 검색 결과가 존재한다면 다른 page로 redirect
   */
  const isExists = await User.exists({
    $nor: [{ _id }],
    $or: [{ username }, { email }],
  });
  if (isExists) {
    return res.redirect("/users/edit");
  }

  /* Database에 저장된 User에 새 정보 업데이트
   * 이 때, `findByIdAndUpdate`는 update 이전의 객체를 반환하므로,
   * `{ new: true }` option을 추가해야 updated user를 가져올 수 있다.
   */
  const uploadedURL = `/${file ? file.path : avatarUrl}`;
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: uploadedURL,
      name,
      email,
      username,
      location,
    },
    { new: true }
  );

  /* Database의 user와 session에 저장된 user는 독립된 객체이므로 개별적으로 갱신해야 함
   * 1. Database 업데이트 후 반환되는 user object를 req.session.user에 업데이트
   * 2. req.session.user 객체의 property를 개별적으로 업데이트
   *
   * 1번 방법이 중복 코드가 적고 더 좋아 보인다.
   * 2번 방법을 사용핼 때 ES6+ 문법 활용
   * - ES6+ 문법 : `{...obj}`을 할당하면 obj의 property들을 그대로 할당함
   * - req.session.user = { ...req.session.user, name, email, username, location };
   */
  req.session.user = updatedUser;

  await User.findByIdAndUpdate(_id, { avatarUrl: uploadedURL });

  /* res.render("edit-profile", ...)을 써도 되지만,
   * pageTitle 등을 전달하는 코드를 중복으로 사용하지 않기 위해 redirect
   */
  res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  /* Social login을 사용하면 password를 갖지 않으므로 password 변경 기능에 대해 예외 처리 필요
   * 1. Session에 저장된 user data에서 `socialOnly` 값이 true라면(Social login user라면) redirect
   * 2. Password 변경 page는 방문할 수 있지만, 기능 막아두기
   *
   * 1번 방법이 더 좋은 것 같다. 애초에 볼 수 없어야 함
   * View template에서도 social only user는 password 변경 버튼을 볼 수 없는게 좋을 것
   */
  if (req.session.user.socialOnly) {
    return res.redirect("/");
  }
  res.render("users/change-password", { pageTitle: "Change Password" });
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;

  const user = await User.findById(_id);

  /* 현재 password가 일치하지 않으면 error
   * Status code를 400으로 보내서 브라우저에게 요청이 실패했다는 것을 명시적으로 알린다.
   */
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect.",
    });
  }

  /* 변경하려는 password가 confirmation과 일치하지 않으면 error
   * Status code도 4xx으로 보내서 브라우저가 자동으로 password 저장 기능을 활성화하지 못하게 막는다.
   */
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password does not match the confirmation.",
    });
  }

  /* [ Password update ]
   * User schema에 등록한 pre `save` middleware에서 raw password를 hashing해서 저장
   * 1. `User.create({})` 사용하면 내부적으로 `save` trigger
   * 2. `save()`를 명시적으로 호출해서 trigger
   *
   * 여기서는 session에 저장된 user data로부터 `_id`를 가져올 수 있으므로
   * user database에서 `_id`로 object를 가져와서 password 업데이트 후 명시적으로 저장한다. (2번)
   *
   * Password 변경 후 logout 시키면서 기존 session은 destroy 되므로 session.user는 갱신하지 않아도 된다.
   */
  user.password = newPassword;
  await user.save();

  // send notification

  /* Password 변경에 성공하면 logout 시킨 후 다시 로그인하게 만들기
   */
  res.redirect("/users/logout");
};

export const see = async (req, res) => {
  const { id } = req.params;

  /* [ Double Populates ]
   * 1. `User` model의 `videos` field에는 `Video`의 `ObjectId`가 저장되어 있음
   * 2. `User`의 `videos`에 population을 사용하면 `Video` model로 치환됨
   * 3. `Video` model은 `owner` field에 `User`의 `ObjectId`가 저장되어 있음
   * 4. `Video`의 `owner`에 population을 사용해서 `User` model로 치환
   *
   * `Video.pug` view에서 `video.owner`로 user 정보를 받을 수 있도록 double population
   */
  // const user = await User.findById(id).populate("videos");
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  console.log(user);

  /* User profile은 누구나 볼 수 있는 public page
   * 잘못된 user id를 사용해서 접근하면 404 page를 보여준다.
   */
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found." });
  }

  // const videos = await Video.find({ owner: id });
  res.render("users/profile", {
    pageTitle: `${user.name}'s Profile`,
    user,
    // videos,
  });
};
