// Importing Modules
require("dotenv").config();
const config = require("./config/config");
const helmet = require("helmet");
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

// Import routes
const authRoutes = require("./routes/authRoutes");
const subscribeRoutes = require("./routes/subscribeRoutes");
const verifyRoutes = require("./routes/verifyRoutes");
const unsubscribeRoutes = require("./routes/unsubscribeRoutes");

const corsOptions = config.corsOptions;
const limiter = config.limiter;

app.use(express.json());
app.use(cors());
app.use(limiter);
app.listen(PORT, (error) => {
	if (!error) console.log(`Server is Successfully Running,and App is listening on port http://localhost:${PORT}`);
	else console.log("Error occurred, server can't start", error);
});
app.use(helmet());

app.use("/api/auth", cors(corsOptions), authRoutes);
app.use("/api/subscribe", cors(corsOptions), subscribeRoutes);
app.use("/api/verify", cors(corsOptions), verifyRoutes);
app.use("/api/unsubscribe", cors(corsOptions), unsubscribeRoutes);
