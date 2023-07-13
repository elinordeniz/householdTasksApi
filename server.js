require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const PORT = process.env.PORT || 4600;
const { logger, logEvents } = require("./middleware/logger.js");
const errorHandler = require("./middleware/errorHandler.js");
const corsOptions = require("./config/corsOptions.js");
const connectDB = require("./config/dbConnection.js");
const mongoose = require("mongoose");
connectDB();
//middlewares
app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

//app.use('/', express.static('public')); aşağıdakiyle aynı
app.use("/", express.static(path.join(__dirname, "public")));

app.use("/", require("./routes/root"));
app.use("/auth", require("./routes/authRoutes.js"));
app.use("/users", require("./routes/userRoutes.js"));
app.use("/tasks", require("./routes/tasksRoutes.js"));

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({
      message: "404! Not Found.",
    });
  } else {
    res.type("txt").send("404! Not Found");
  }
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("connected to mongodb");

  app.listen(PORT, () => {
    console.log(`Server is listening on POrt ${PORT} `);
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t ${err.syscall}\t ${err.hostname}`,
    mongoError.log
  );
});
