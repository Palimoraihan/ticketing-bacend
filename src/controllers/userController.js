const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateAuthToken = async (user) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
  return token;
};

const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Validate role
    if (role && !['admin', 'agent', 'customer'].includes(role)) {
      return res.status(400).send({ error: 'Invalid role' });
    }

    const user = await User.create({
      username,
      email,
      password,
      role: role || 'customer'
    });

    const token = await generateAuthToken(user);
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.validatePassword(password))) {
      throw new Error('Invalid login credentials');
    }

    const token = await generateAuthToken(user);
    res.send({ user, token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const getProfile = async (req, res) => {
  res.send(req.user);
};

const updateProfile = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['username', 'email', 'password'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
}; 