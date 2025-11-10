import app from "./server.js"
import mongoose from "mongoose"
import { MONGO_URL } from "./config.js"



mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('Database Connected Successfully!');
    app.listen(3000, () => {
      console.log("Server is listening on port 3000");
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    
  });