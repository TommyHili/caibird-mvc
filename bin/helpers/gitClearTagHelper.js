/**
 * @Creater cmZhou
 * @Desc 清理git tag
 */
const {
    readline,
    execStdout
} = require('../utils');

module.exports = async () => {
    const filterStr = await readline('请输入要清除的tag的关键字：');
    const tags = execStdout('git tag', false).split('\n').filter(item => item.includes(filterStr));
    execStdout(`git push origin ${tags.map(item => item && item.trim() && `:refs/tags/${item}` || '').join(' ')}`);
    execStdout(`git tag -d ${tags.join(' ')}`);
};
