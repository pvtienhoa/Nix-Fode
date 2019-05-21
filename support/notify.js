const chalk = require('chalk');
const showError = (message) => {
    if (message) console.log(chalk.red.bold.inverse(message));
}

const showNotify = (message) => {
    if (message) console.log(chalk.green.bold.inverse(message));
}

module.exports = {
    showError: showError,
    showNotify: showNotify
};