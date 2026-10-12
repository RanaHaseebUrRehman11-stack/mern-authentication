require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

// Database Connection

connectDB();

// Server Port

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
