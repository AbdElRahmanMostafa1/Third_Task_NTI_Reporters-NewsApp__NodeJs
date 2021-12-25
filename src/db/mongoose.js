const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/news-api')
.then(()=> console.log(`DB connected successfully!`))
.catch((e) => console.log(`Oops! In DB ${e.message}`))

module.exports = mongoose;