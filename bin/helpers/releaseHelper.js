/**
 * @Creater cmZhou
 * @Desc 发布
 */
const fs = require('fs');
const path = require('path');
const OSS = require('ali-oss');

const {
    printf,
    ColorsEnum,
    readline,
    execStdout,
    exec
} = require('../utils');

const upload = async ({ ossConfig }) => {
    const ossDir = ossConfig.dir;
    const ossOptions = ossConfig.getOssOptions && await ossConfig.getOssOptions();

    const dirPath = path.join(process.cwd(), 'assets/bundle');
    const files = fs.readdirSync(dirPath);

    printf('=====开始上传=====', ColorsEnum.CYAN);

    await Promise.all(files.map(async file => {
        if (file.endsWith('.js')) {
            const client = new OSS({
                region: ossConfig.region,
                bucket: ossConfig.bucket,
                accessKeyId: ossConfig.accessKeyId,
                accessKeySecret: ossConfig.accessKeySecret,
                ...ossOptions
            });

            printf(`正在上传${file}...`);
            const rsp = await client.put(`${ossDir}/${file}`, `${dirPath}/${file}`);

            if (!(rsp.url && rsp.res.status === 200)) {
                printf(`上传${file}失败!`, ColorsEnum.RED);
                throw new Error(`上传${file}失败!`);
            }
        }
    }));

    printf('=====完成上传=====', ColorsEnum.CYAN);
};

module.exports = async opt => {
    const { baseCommitId } = opt;

    const production = 'production';

    const projectName = process.argv[2];
    const env = process.argv[3] || production;

    const envMap = {
        production,
        exp: 'expProduction',
        test: 'test',
        dev: 'dev'
    };

    const isDev = env === envMap.dev;
    const isTest = env === envMap.test;
    const isExp = env === envMap.exp;
    const isPro = !isDev && !isTest && !isExp;

    const confirmRelease = await readline(`确认发布项目【${projectName}】到${isDev ? '【开发】环境' : isTest ? '【测试】环境' : isExp ? '【体验】环境' : '【正式】环境'}？确认请输入"Y":`);

    if (confirmRelease !== 'Y') {
        printf('退出发布!', ColorsEnum.RED);
        process.exit(0);
        return;
    }

    const nowBranch = execStdout('git symbolic-ref --short -q HEAD', false);

    const releaseBranch = `release-build-${projectName}`;
    const baseBranch = isDev ? 'dev' : isTest ? 'test' : isExp ? 'exp' : 'master';

    let otherBranch = '';
    let isTagMode = false;

    if (isDev || isTest || isExp) {
        const mode = await readline('发布模式，输入1或2(1代表基于【基础分支】发布，2代表发布【指定tag】)：');

        isTagMode = mode === '2';

        printf(`已选择【${isTagMode ? '指定tag模式' : '基础分支模式'}】`, ColorsEnum.RED);

        if (isTagMode) {
            otherBranch = await readline('请输入要发布的指定tag:');
            if (!otherBranch) {
                printf('tag名不能为空!', ColorsEnum.RED);
                process.exit(1);
                return;
            }
        } else {
            otherBranch = await readline('除基础分支外，若要附带其它分支请输入分支名，多个分支用空格分割:');
        }
    }

    try {
        if (isTagMode) {
            printf(`即将发布 ${otherBranch} TAG，发布成功后自动切换回当前工作分支，有未提交的修改会自动stash`, ColorsEnum.CYAN);
        } else {
            printf(`即将发布 origin/${baseBranch}${otherBranch ? ` ${otherBranch}` : ''} 分支，发布成功后自动切换回当前工作分支，有未提交的修改会自动stash`, ColorsEnum.CYAN);
        }
        printf('执行过程中请不要在该工程上做其它操作！', ColorsEnum.RED);
        printf('执行结束后（无论成功还是失败）请留意是否切回原来的工作分支，若没有请手动切回，不要在发布分支上做任何操作！', ColorsEnum.RED);

        const getTime = () => {
            const nowDate = new Date();
            const year = nowDate.getFullYear().toString();
            const month = nowDate.getMonth() + 1;

            return `${year}${month < 10 ? `0${month}` : month}`;
        };

        const time = getTime();

        const num = await readline('请输入当前迭代编号(1 or 2):');

        if (num !== '1' && num !== '2') {
            printf('迭代编号输入错误', ColorsEnum.RED);
            execStdout(`git checkout ${nowBranch}`);
            process.exit(1);

            return;
        }

        execStdout('git fetch --tags');

        const tagAttribute = await readline('请输入tag特征值，通常用于服务构建时做特殊处理，不需要可【回车】跳过:');

        const tagEnv = `${isDev ? 'dev' : isTest ? 'test' : isExp ? 'exp' : 'production'}${tagAttribute ? `#${tagAttribute}` : ''}`;
        const tagBase = `${projectName}-${time}V${num}-${tagEnv}`;
        const buildTag = `build-${projectName}-${tagEnv}`;

        const nowTags = execStdout(`git tag -l "${tagBase}*"`, false);

        if (nowTags) {
            printf('<---当前环境和特征下本迭代的tag--->', ColorsEnum.CYAN);
            execStdout(`git tag -l "${tagBase}*"`);
            printf('<---当前环境和特征下本迭代的tag--->', ColorsEnum.CYAN);
        }

        const version = await readline('请输入tag版本号(如:1.x，2.x):');

        if (!version) {
            printf('tag版本号不能为空！', ColorsEnum.RED);
            execStdout(`git checkout ${nowBranch}`);
            process.exit(1);

            return;
        }

        const fullVersion = `${getTime()}-${num}-${version}`;

        const tag = `${tagBase}-v${version}`;

        printf(`tagName=${tag}`, ColorsEnum.CYAN);

        execStdout('git stash');
        if (!isTagMode) {
            execStdout(`git checkout ${baseBranch}`);
            execStdout('git fetch');
            execStdout('git pull --rebase');
            execStdout('git push');
        } else {
            const res = exec(`git checkout ${otherBranch}`);
            if (res.code !== 0) {
                printf(res.stderr, ColorsEnum.RED);
                process.exit(1);
                return;
            }
        }
        execStdout(`git branch -D ${releaseBranch}`);
        execStdout(`git checkout -b ${releaseBranch}`);
        execStdout(`git tag -d ${buildTag}`);

        const result1 = exec(`${isTagMode ? '' : `git merge ${baseBranch} ${otherBranch} -m 合并生成${tag} &&`}
          git cherry-pick ${baseCommitId} &&
          npm i &&
          npm run build ${projectName} ${env}`);

        if (!(result1.code === 0 || result1.code === 128 || result1.code === 127)) {
            printf(`发布失败！！！ exit code: ${result1.code}`, ColorsEnum.RED);
            process.exit(1);
            return;
        }

        if (!isDev && !isTest) {
            await upload({ ossConfig: opt.ossConfig });
        }

        const logPath = path.join(process.cwd(), '.log/build.json');
        const buildLog = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
        // 将构建的tag写入到log文件中，方便前端获取该值
        fs.writeFileSync(logPath, JSON.stringify({
            ...buildLog,
            tag
        }, null, 2), 'utf-8');

        const result2 = exec(`git add . &&
          git commit -m ${tag} &&
          git tag -a ${buildTag} -m ${buildTag} &&
          git tag -a ${tag} -m ${tag} &&
          ${isPro && !tagAttribute ? `git tag -a release-${projectName}-v${fullVersion} -m release-${projectName}-v${fullVersion} && git push origin release-${projectName}-v${fullVersion} &&` : ''}
          git push origin ${buildTag} ${tag} -f && echo will complete...`);

        if (result2.code === 0 || result2.code === 128 || result2.code === 127) {
            printf('');
            printf(`tagName: ${tag}`, ColorsEnum.GREEN);
            printf(`version: ${buildLog.version}`, ColorsEnum.GREEN);
            printf('');
            printf('version是服务端和前端关联的版本号，每次构建都会生成一个内置的版本号version', ColorsEnum.CYAN);
            printf('node服务端发布后，会优先在服务器配置文件读取version，若没有在配置文件中设置version，则会使用构建时内置的默认值', ColorsEnum.CYAN);
            printf('仅发布前端请到服务器上修改配置文件中的version，每次发布完请确认version是否正确。', ColorsEnum.YELLOW);
            printf(`version等信息可到${tag}标签的"./.log/build.json"查看`, ColorsEnum.CYAN);
            printf('');
        } else {
            printf(`发布失败！！！ exit code: ${result2.code}`, ColorsEnum.RED);
        }
    } catch (e) {
        console.error(e);
    } finally {
        execStdout(`git checkout ${nowBranch}`);
        process.exit(0);
    }
};
