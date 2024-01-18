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
  const user = await User.findOne({ username });
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

  /* [ Login Success] 
    - username을 갖는 `User`가 존재하고, password도 일치하면 login에 성공하는 것
    - 브라우저가 현재 로그인 되어 있다는 것을 알 수 있는 방법 -> Cookie, Session
  */
  res.redirect("/");
};

export const edit = (req, res) => {
  res.send("Edit User");
};

export const remove = (req, res) => {
  res.send("Remove User");
};

export const logout = (req, res) => {
  res.send("Logout");
};

export const see = (req, res) => {
  res.send("See User");
};
