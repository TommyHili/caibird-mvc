/**
 * @Owners cmZhou
 * @Title 将当前工程的依赖更新到最新版本
 */
const updatePackageHelper = require('./helpers/updatePackageHelper');

updatePackageHelper({
    packageJson: require('../package.json'),
    depLockList: [],
    devDepLockList: ['sequelize', 'webpack', 'webpack-cli', 'history', '@types/history'],
});
