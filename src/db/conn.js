const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/wordbudregistration", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log(`Connected to MongoDB`);
}).catch((e) => {
    console.log(`No connection. Error: ${e.message}`);
});
