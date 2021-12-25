const express = require('express');

const router = express.Router();
const News = require('../models/News');
const lock = require('../middleware/lock');

router.post('/news', lock, async (req, res) => {
  try {
    const news = new News({...req.body, owner: req.user._id});
    await news.save();
    res.status(200).send(news);
  } catch (error) {
    res.status(500).send(error.message)
  }
});

router.get('/news', lock, async (req, res) => {
  try {
    const news = await News.find({owner: req.user._id});
    res.status(200).send(news);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/news/:id', lock,async (req, res) => {
  try {
    const news = await News.findOne({_id: req.params.id, owner: req.user._id});
    res.status(200).send(news);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.patch('/news/:id', lock, async (req, res) => {
  const news = await News.findOne({_id: req.params.id, owner: req.user._id});
  if (!news) return res.status(404).send(` Not found :( `);

  const updates = Object.keys(req.body);
  const allowedUpdates = ['description'];

  try {
    const isMatch = updates.every(update => allowedUpdates.includes(update));
    if (!isMatch) return res.status(401).send(`Update isn't available`);
    updates.forEach(up => news[up] = req.body[up]);
    await news.save();
    res.status(200).send(news);
  } catch (error) {
    res.status(500).send(error.message);
  };
});

router.delete('/news/:id', lock, async (req, res) => {
  try {
    const news = await News.findOneAndDelete({_id: req.params.id, owner: req.user._id});
    if (!news) return res.status(404).send('Not Found!')
    res.status(200).send('Deleted Successfully!')
  } catch (error) {
    res.status(500).send(error.message)
  }
});

module.exports = router;