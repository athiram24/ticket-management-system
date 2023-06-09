const User = require("../models/user");
const jwt = require("jsonwebtoken");



const handleErrors = (err) => {
  console.log(err.message, err.code);

  let errors = { email: "", password: "" };

  //incorrect email

  if (err.message === "incorrect email") {
    errors.email = "that email is not registered";
  }

  //incorrect password
  if (err.message === "incorrect password") {
    errors.password = "that password is incorrect";
  }
  //duplicate error

  if (err.code === 11000) {
    errors.email = " that email is already registered";
    return errors;
  }
  //validating errors
  if (err.message.includes("User validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
  return jwt.sign({ id }, "secret", {
    expiresIn: maxAge,
  });
};



const userSignupPost = async (req, res) => {
  const { fname, lname, email, phone , role , password } = req.body;

  try {
    const user = await User.create({
      fname,
      lname,
      email,
      phone,
      role,
      password,
    });

    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
  
};



const userSigninPost = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

const userLogoutGet = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });

};

const userShow = (req,res) => {

  const id = String(req.params.id);

  User.findById(id).then( (result) => {
    res.status(200).json({  user : result });
  }).catch( (err) => {
    console.log(err);
  });
};

module.exports = {
  userSigninPost,
  userSignupPost,
  userLogoutGet,
  userShow
};
