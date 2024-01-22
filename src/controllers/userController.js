import User from "../models/User";
import bcrypt from "bcrypt";

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
    console.log(userData);

    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `${token_type} ${access_token}`, // Header로 token 전달
        },
      })
    ).json();
    console.log(emailData);

    const emailObject = emailData.find(
      (email) => email.primary && email.verified
    );
    if (!emailObject) {
      // notification
      // GitHub 로그인을 했지만 verified email이 없으니 믿을 수 없으므로 사용자에게 알려줌
      return res.redirect("/login");
    }

    const user = await User.findOne({ email: emailObject.email });
    if (!user) {
      // create an account
      const user = await User.create({
        email: emailObject.email,
        username: userData.login,
        password: "",
        name: userData.name,
        location: userData.location,
        socialOnly: true,
        avatarUrl: userData.avatar_url,
      });
    }
    req.session.isLoggedIn = true;
    req.session.user = user;
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
      user: { _id },
    },
    body: { name, email, username, location },
  } = req;

  // 변경하려는 email, username 등이 이미 존재한다면 변경할 수 없게 막는다.
  // body에 있는 email, username이 session에 저장된 것과 같다면 자기 자신의 정보
  // 다르다면, 다른 user들의 email, username과 비교해 본다.
  // 중복된다면 다시 edit page로 redirect

  const isExists = await User.exists({
    // $nor: [{ _id }],
    $or: [{ username }, { email }, { _id: { $ne: _id } }],
  });
  if (isExists) {
    console.log("isExists :", isExists);
    return res.redirect("/users/edit");
  }

  // Database에 저장된 User에 새 정보 업데이트
  // 이 때, `findByIdAndUpdate`는 update 이전의 객체를 반환하므로
  // `{ new: true }` option을 추가해야 updated user를 가져올 수 있다.
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    { name, email, username, location },
    { new: true }
  );

  // Database의 user와 session에 저장된 user는 독립된 객체
  // Updated user data를 session에도 갱신시켜 주어야 한다.
  req.session.user = updatedUser;

  // Session에 저장된 user의 data를 개별적으로 업데이트
  // ES6+ 문법 : `{...obj}`을 할당하면 obj의 property들을 그대로 할당함
  // req.session.user = { ...req.session.user, name, email, username, location };

  // res.render("edit-profile", ...)을 써도 되지만,
  // pageTitle 등을 전달하는 코드를 중복으로 사용하지 않기 위해 redirect
  res.redirect("/users/edit");
};

export const see = (req, res) => {
  res.send("See User");
};
