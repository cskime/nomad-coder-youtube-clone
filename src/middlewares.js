export const localsMiddleware = (req, res, next) => {
  // Pug template에서 사용할 전역 property 설정
  res.locals.isLoggedIn = req.session.isLoggedIn;
  res.locals.user = req.session.user;
  next();
};
