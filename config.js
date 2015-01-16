var config = {
  name: 'w2r',
  description: 'w2r 是一个使用Node.js开发的专注于阅读和书写体验的网站。',
  // mongodb 配置
  session_secret: 'w2r',
  
  redis_options:{
	host: 'localhost',
    port: 6379
  },
  
  mysql_options:{
    connectionLimit : 10,
    host: 'localhost',
    user: 'root',
    password: '1314520',
    database:'w2r',
    port: 3306
  },

  // github 登陆的配置
  github_oauth: {
    clientID: '8d3f384b322349398e6d',
    clientSecret: '684bf395d7651c7496ce9417aaee17404555c8fe',
    callbackURL: 'http://localhost:3000/auth/github/callback'
  },
  //域名
  hostname: 'localhost',
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
    link: 'http://localhost:3000',
    language: 'zh-cn',
    description: 'w2r 是一个使用Node.js开发的专注于阅读和书写体验的网站。',
    //最多获取的RSS Item数量
    max_rss_items: 50
  },
  
  //邮箱配置
  mail_options: {
    host : 'smtp.gmail.com',
    port: 25, // port for secure SMTP
//    secureConnection: true, // use SSL
    auth: {
        user: 'panhongbo891010@gmail.com',
        pass: '391400311'
    }
  }
};
module.exports = config;
