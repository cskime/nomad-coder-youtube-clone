import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  avatarUrl: { type: String },
  socialOnly: { type: Boolean, default: false },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  name: { type: String, required: true },
  location: String,
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
  comments: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Comment" },
  ],
});

userSchema.pre("save", async function () {
  /* [ 중복 hashing 방지 ]
   * 모든 password에 대해 hashing을 하면, 기존 사용자가 다른 정보를 업데이트하면서 `save()`를 호출할 때 마다
   * hashed password를 다시 hasing하게 됨 -> 완전히 다른 password로 저장되어 로그인하지 못하는 문제가 생긴다.
   * 즉, 중복 hashing 문제가 생긴다.
   *
   * Mongoose의 `isModified(field)`로 password가 수정되었는지 확인하고,
   * password가 수정된 경우에만 hashing하도록 수정
   */
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
