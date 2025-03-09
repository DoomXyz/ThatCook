const { Sequelize } = require('sequelize');

// Option 3: Passing parameters separately (other dialects)
const sequelize = new Sequelize('thatcookdb', 'root', null, {
    host: 'localhost', //ghi địa chỉ server vào đây
    dialect: 'mysql',
    logging: false
});

let connectdatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection thành công');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}
module.exports = connectdatabase;