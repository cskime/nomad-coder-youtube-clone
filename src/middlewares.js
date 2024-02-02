import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const isHeroku = process.env.NODE_ENV === "production";

const s3ImageUploader = multerS3({
  s3,
  bucket: "wetubeee/images", // S3 bucket name
});
const s3VideoUploader = multerS3({
  s3,
  bucket: "wetubeee/videos", // S3 bucket name
});

export const localsMiddleware = (req, res, next) => {
  // Pug template에서 사용할 전역 property 설정
  res.locals.isLoggedIn = req.session.isLoggedIn;
  res.locals.user = req.session.user || {};
  res.locals.isHeroku = isHeroku;
  next();
};

export const protectorMiddleware = (req, res, next) => {
  /* 로그인하지 않은 사용자가 접근할 때 Login page로 redirect
   * Profile edit, logout 등 로그인을 해야 접근할 수 있는 router에 대해 적용
   */
  if (req.session.isLoggedIn) {
    return next();
  }
  req.flash("error", "Log in first.");
  res.redirect("/login");
};

export const publicOnlyMiddleware = (req, res, next) => {
  /* 로그인한 사용자가 접근할 때 home으로 redirect
   * Login 화면 등 로그인 한 뒤에는 접근할 수 없는 router에 대해 적용
   */
  if (!req.session.isLoggedIn) {
    return next();
  }
  req.flash("error", "Not authorized");
  res.redirect("/");
};

/* [ Multer ]
 * `dest` : 사용자로부터 받은 file을 저장할 경로 (hard drive)
 */
export const uploadFilesMiddleware = multer({ dest: "uploads/" });

export const uploadAvatar = multer({
  dest: "uploads/avatars/",
  limits: { fileSize: 1 * 1024 }, // 1MB 업로드 제한 (bytes)
  storage: isHeroku ? s3ImageUploader : undefined,
});
export const uploadVideo = multer({
  dest: "uploads/videos/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 업로드 제한 (bytes)
  storage: isHeroku ? s3VideoUploader : undefined,
});
