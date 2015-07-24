var config = {
  name: 'w2r',
  description: 'w2r 是一个使用Node.js开发的专注于阅读和书写体验的网站。',
 
  session_secret: 'w2r',
  
  redis_options:{
	host: process.env.REDIS_HOST,
	pass: process.env.REDIS_PASSWORD,
    port: process.env.REDIS_PORT
  },
  
  mysql_options:{
    connectionLimit : process.env.MYSQL_CONNECTIONLIMIT,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT
  },

  newrelic_options:{
     license_key: '99331460b90f0ecbc2f2ba20a27eaa160e3847ae'
  },

  qiniu_options:{
      access_key: 'JltYNmaFFYFdqOxYzoipVhNx_a31gn9fXf0EUac_',
      secret_key: 'nFn44eJDowwktY3i5i0qtQ5UIVAeIYwfAkrAPyDq',
      bucketname: 'panhb',
      domain : 'http://panhb.qiniudn.com'
  },

  // github 登陆的配置
  github_oauth: {
    clientID: '8d3f384b322349398e6d',
    clientSecret: '684bf395d7651c7496ce9417aaee17404555c8fe',
    callbackURL: 'http://w2read.daoapp.io/auth/github/callback'
  },
  //域名
  hostname: 'w2read.daoapp.io',
  hosturl: 'w2read.daoapp.io',
  // 程序运行的端口
  port: process.env.VCAP_APP_PORT || 3000,
  // 超级密码   	请勿破解，谢谢
  superPassword: 'b206e95a4384298962649e58dc7b39d4',
  user_pageSize: 10,
  control_pageSize: 10,
   //图灵机器人
  tl_apikey:'1241e6e629539909ac3e160d86aeb2cb',

  // RSS配置
  rss: {
    title: 'w2r',
    link: 'http://w2read.daoapp.io',
    language: 'zh-cn',
    description: 'w2r 是一个使用Node.js开发的专注于阅读和书写体验的网站。',
    //最多获取的RSS Item数量
    max_rss_items: 50
  },
  
  //邮箱配置
  mail_options: {
    host : 'smtp.163.com',
    port: 25, // port for secure SMTP
//    secureConnection: true, // use SSL
    auth: {
        user: 'panhongbo891010@163.com',
        pass: 'aztfaxkiakhyojzx'
    }
  }
};
module.exports = config;
