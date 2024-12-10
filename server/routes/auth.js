const {
    register,
    login,
    setAvatar,
  } = require("../controllers/userController");


  const router = require("express").Router();

  router.post("/login", login);
  router.post("/register", register);
  router.post("/setavatar/:id", setAvatar);
  
  module.exports = router;