
import { app } from "./app.js";
import connectDB from "./db/index.js"



const port = process.env.PORT || 8000;

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        })
    })
    .catch((err) => {
        console.log("MongoDB Connection Error", err);
    })