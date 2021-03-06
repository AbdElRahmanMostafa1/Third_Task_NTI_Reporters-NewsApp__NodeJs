const Reporter = require('../models/Reporter');
const jwt = require('jsonwebtoken');

const lock = async (req, res, next) => {
  try {
    const token = req.headers.authorization.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Reporter.findOne({_id: decoded, 'tokens.token': token});
    if (!user) throw new Error();

    req.token = token;
    req.user = user;

    next();
  } catch (error) {
    res.status(404).send(`please Authenticate!`);
  }
}

module.exports = lock;