const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://admin:admin123@cluster0.yiblqcl.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log(`Connected to MongoDB`);
}).catch((e) => {
    console.log(`No connection. Error: ${e.message}`);
});
