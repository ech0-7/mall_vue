function request(config) {
  const instance = new axios.create({
    baseURL: 'http://127.0.0.1:6888',
    timeout: 5000,
    method: 'post',
  });

  // 请求拦截器
  instance.interceptors.request.use(config => {
    //拦截后需要将拦截下来的请求数据返回发送
    return config;
  }, err => {

  })

  // 相应拦截器
  instance.interceptors.response.use(res => {
    // 拦截后需要将拦截下来处理成的结果返回
    // 直接返回data


    if (res.data.code == 0) {
      console.log(res.data);
      return res.data;
    }else{
      app.$message.error(res.data.msg)

    }

    // return res;
  }, err => {
    app.$message.error('发生错误')
    console.log(err)
    return;
  })

  // instance.interceptors.request

  // 3.发送真正的网络请求
  return instance(config);

}