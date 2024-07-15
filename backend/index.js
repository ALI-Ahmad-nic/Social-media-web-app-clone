const express = require("express");
const jwt = require('jsonwebtoken');
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require('path');
const http = require('http');
const Server = require('socket.io');

const app = express();
const port = 3000;

const server = http.createServer(app);


const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const mysecret = "thisiskey12345";



mongoose.connect("mongodb://localhost:27017/postappclone", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

/// Handle MongoDB connection error
db.on("error", function (error) {
  console.error("MongoDB connection error:", error);
});

// Handle MongoDB connection success
db.once("open", function () {
  console.log("Connected to MongoDB");
});
// user schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
});
const User = mongoose.model("User", userSchema);

// Define the Post schema
const postSchema = new mongoose.Schema({
  description: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  imagePath: String,
});

const Post = mongoose.model('Post', postSchema);

// Like Schema
const likeSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Like = mongoose.model('Like', likeSchema);


// Comment Schema
const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: String,
});

const Comment = mongoose.model('Comment', commentSchema);

// Reply Schema
const replySchema = new mongoose.Schema({
  commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: String,
});

const Reply = mongoose.model('Reply', replySchema);

//  user Regist ration 
app.post("/api/register", async (req, res) => {
  const { username, email } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    const user = new User({ username, email });
    await user.save();
    res.json({ message: "User registered successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// user login 
app.post("/api/login", async (req, res) => {
  const { username, email } = req.body;

  try {
    const user = await User.findOne({ username, email });
    if (!user) {
      return res.status(400).json({ message: "User not registered" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, mysecret, { expiresIn: '1h' });
    res.json({ token }); // Send JWT token to client
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// token verification and decoding 
function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  // console.log("header" + bearerHeader)
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    console.log("token" + bearerToken);
    jwt.verify(bearerToken, mysecret, (err, decodedToken) => {
      if (err) {
        return res.sendStatus(403);
      } else {
        // console.log('Decoded Token:', decodedToken);
        req.userId = decodedToken.userId;
        next();
      }
    });
  } else {
    res.sendStatus(403);
  }
}



// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// POST endpoint to handle file upload
app.post('/api/upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { description } = req.body;
    // const imagePath = req.file.path.replace(/\\/g, '/'); // Ensure forward slashes
    const imagePath = `uploads/${req.file.filename}`;
    const newPost = new Post({
      description: description,
      userId: req.userId,
      imagePath: imagePath // Store the file path in MongoDB
    });

    await newPost.save();
    res.json(newPost);
  } catch (error) {
    res.status(500).send('File upload failed');
  }
});


// getpost
app.get('/api/postlist', async (req, res) => {
  try {
    // const posts = await Post.find()
    // console.log(posts)
    const posts = await Post.find()
      .populate('userId', 'username') // Populate user data
      .lean();

    const postIds = posts.map(post => post._id);
    console.log("postids" + postIds)

    const likes = await Like.find({ postId: { $in: postIds } }).lean();
    console.log("likes" + likes);

    // const likesWithoutLean = await Like.find({ postId: { $in: postIds } });
    // console.log('Likes without .lean():', JSON.stringify(likesWithoutLean, null, 2));

    const comments = await Comment.find({ postId: { $in: postIds } }).lean();

    const commentIds = comments.map(comment => comment._id);
    const replies = await Reply.find({ commentId: { $in: commentIds } }).lean();

    const postsWithDetails = posts.map(post => {
      const postLikes = likes.filter(like => like.postId.equals(post._id));
      const postComments = comments.filter(comment => comment.postId.equals(post._id)).map(comment => {
        const commentReplies = replies.filter(reply => reply.commentId.equals(comment._id));
        return {
          ...comment,
          replies: commentReplies
        };
      });

      return {
        ...post,
        likes: postLikes,
        comments: postComments
      };
    });

    res.json(postsWithDetails);
    console.log(postsWithDetails)
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// getmypost
app.get("/api/myposts",verifyToken, (req, res) => {
  //   console.log('UserID:', req.userId); // Add this line
  Post.find({userId:req.userId})
    .then(contacts => res.json(contacts))
    .catch(err => res.status(500).send(err));
});


// delete a post 
app.delete("/api/deletestudent/:id", verifyToken, (req, res) => {
  // console.log(req.params.id)
  // console.log(req.userId)
  Post.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    .then(contact => res.json(contact))
    .catch(error => res.send(error))
})

// upadte post 
// Add multer middleware to the update endpoint
app.put("/api/updatepost/:id", verifyToken, upload.single('file'), async (req, res) => {
  console.log(req.params.id);
  console.log(req.userId);
  console.log(req.body);

  const { description } = req.body;
  let updateData = { description };

  // If a file is uploaded, add the file path to the update data
  if (req.file) {
    const imagePath = `uploads/${req.file.filename}`;
    updateData.imagePath = imagePath;
  }

  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateData,
      { new: true }
    );

    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});



// Serve the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// api for likes 
app.post("/api/like/:postId", verifyToken, async (req, res) => {
  try {
    const existingLike = await Like.findOne({ postId: req.params.postId, userId: req.userId });
    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
    } else {
      const like = new Like({ postId: req.params.postId, userId: req.userId });
      await like.save();
    }
    const likes = await Like.find({ postId: req.params.postId });
    io.emit('like', { postId: req.params.postId, likes });
    res.json({ postId: req.params.postId, likes });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});




// api for comments 
app.post("/api/comment/:postId", verifyToken, async (req, res) => {
  try {
    const comment = new Comment({ postId: req.params.postId, userId: req.userId, text: req.body.text });
    await comment.save();
    const comments = await Comment.find({ postId: req.params.postId });
    io.emit('comment', { postId: req.params.postId, comments });
    res.json({ postId: req.params.postId, comments });
    // console.log("comments" + comments)
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});


// api for comment reply 
app.post("/api/commentreply/:commentId", verifyToken, async (req, res) => {
  console.log("hlo")

  try {
    const reply = new Reply({ commentId: req.params.commentId, userId: req.userId, text: req.body.text });
    await reply.save();
    const replies = await Reply.find({ commentId: req.params.commentId });
    io.emit('reply', { commentId: req.params.commentId, replies });
    res.json({ commentId: req.params.commentId, replies });
    // console.log("comments" + replies)


  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});






server.listen(port, () => {
  console.log(`App running on port ${port}`);
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});                                        
// use aggregation  instead of quesries and remembered that all functionalities should be working as present code.