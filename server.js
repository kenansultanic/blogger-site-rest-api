require('dotenv').config();
const PORT = process.env.PORT || 3000;
const app = require('./app');

app.listen(PORT, () => {
    console.info(`Server running on port ${PORT}`);
});