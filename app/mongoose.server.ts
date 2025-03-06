import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

//connecting to the database 
mongoose.connect(process.env.MONGODB_URI as string);

//creating a new instance of the database connection
const db = mongoose.connection;

//checking if the database is connected successfully
db.once("open", () => {
    console.log("db connected successfully");
});

//handling connection errors
db.on("error", (error) => {
    console.error("Unable to connect to the database:", error);
});

export default mongoose;
