let app = new Vue({
  el: '#app',
  data: {
    serviceUrl: '',
    addressList: [],
    dialogFormVisible: false,
    dialogType: 2, // 1-代表添加 2-代表更改
    dialogBtnLoading: false,
    formLabelWidth: '80px',
    labelPosition: 'top',
    form: {
      addrName: '',
      addrProvince: '',
      addrCity: '',
      addrDistrict: '',
      addrArea: '',
      addrNumber: '',
    },
    provinceList: [],
    province: '',
    cityList: [],
    city: '',
    districtList: [],
    district: '',
    updateIndex: -1, // 记录被修改的数据的index
    shoppingCartCount: 0,
    nickName: '',
  },
  mounted() {
    this.init()
    this.getAddressList();
  },
  methods: {
    // 获取初始信息
    init() {
      axios.post(this.serviceUrl + '/user/getBaseInfo').then(
          response => {
            let result = response.data;
            let respMap = result.respMap;
            this.shoppingCartCount = respMap.shoppingCartCount;
            this.nickName = respMap.nickName;
            console.log("购物车中含有：" + this.shoppingCartCount);
          });
    },

    // 获取该用户的收货地址
    getAddressList() {
      axios.post(this.serviceUrl + '/address/getAddressList').then(
          response => {
            console.log(response.data)
            console.log(response.data.code)
            console.log(response.data.msg)
            if (response.data.code == '0') {
              this.addressList = response.data.data;
            } else {
            }
          });
    },
    // 将一个地址设置成为默认地址
    setDefaultAddress(index) {
      console.log("点击")
      // 将所有的地址类型设置为普通类型
      for (let address of this.addressList) {
        address.type = 0;
      }
      this.addressList[index].type = 1;
      const params = new URLSearchParams();
      params.append('id', this.addressList[index].id);
      axios.post(this.serviceUrl + '/address/setDefaultAddress', params).then(
          response => {
            console.log(response.data)
            if (response.data.code == '0') {
            } else {
            }
          });
    },
    // 删除一个收货地址
    deleteAddress(index) {
      this.$confirm('确定删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 确定
        const params = new URLSearchParams();
        params.append('id', this.addressList[index].id);
        this.addressList.splice(index, 1);
        axios.post(this.serviceUrl + '/address/deleteAddress', params).then(
            response => {
              // 不做判断
            });
      }).catch(() => {
        // 取消
        return;
      });
    },
    /**
     * 添加收货地址
     */
    insertEditDialog(){
      this.dialogFormVisible = true;
      this.form = {};
      this.province = "";
      this.city = "";
      this.district = "";
      this.dialogType = 1;

      // 获得省级数据
      this.getProvinceList();

      this.dialogFormVisible = true;
      console.log("city=" + this.city);
    },
    // 打开编辑弹窗
    openEditDialog(index) {
      this.dialogType = 2;
      this.updateIndex = index;
      // 深拷贝，但只能应用于一层
      Object.assign(this.form, this.addressList[index])

      this.defaultProvince = this.form.addrName;

      // 获得省级数据
      this.getProvinceList();

      this.dialogFormVisible = true;
      console.log("city=" + this.city);
    },
    // 插入收货地址
    insertAddress() {
      if (!this.verifyAddress()) {
        return;
      }
      const params = new URLSearchParams();
      params.append("addrName", this.form.addrName);
      params.append("addrProvince", this.province);
      params.append("addrCity", this.city);
      params.append("addrDistrict", this.district);
      params.append("addrArea", this.form.addrArea);
      params.append("addrNumber", this.form.addrNumber);

      axios.post(this.serviceUrl + '/address/addAddr', params).then(
          response => {
            let result = response.data;
            console.log(result)
            if (result.code == 0) {
              this.$message.success('添加成功');
              this.dialogFormVisible = false;
              this.addressList.push(this.form);
              console.log(this.addressList)

            } else {
              this.$message.error('添加失败');
            }
          }
      );
    },
    // 修改收货地址
    editAddress() {
      // 验证信息
      if (!this.verifyAddress()) {
        return;
      }
      const params = new URLSearchParams();
      params.append("id", this.form.id);
      params.append("addrName", this.form.addrName);
      params.append("addrProvince", this.form.addrProvince);
      params.append("addrCity", this.form.addrCity);
      params.append("addrDistrict", this.form.addrDistrict);
      params.append("addrArea", this.form.addrArea);
      params.append("addrNumber", this.form.addrNumber);

      axios.post(this.serviceUrl + '/address/updateAddress', params).then(
          response => {
            let result = response.data;
            console.log(result)
            if (result.code == 0) {
              this.addressList.splice(this.updateIndex, 1, result.data)
              this.dialogFormVisible = false;
              this.$message.success('修改成功');
            } else {
              this.$message.error('修改失败');
            }
          }
      );
    },
    // 验证添加的地址信息是否合法
    verifyAddress() {
      if (!this.form.addrNumber || this.form.addrNumber.length < 11) {
        this.$message.error('手机号码格式有误');
        return false;
      }
      if (this.form.addrName == '') {
        this.$message.error('收货人姓名不能为空');
        return false;
      }
      if (this.form.addrArea == '') {
        this.$message.error('详细地址不能为空');
        return false;
      }
      if (this.province == '' || this.city == '' || this.district == '') {
        this.$message.error('请选择完整地区');
        return false;
      }
      return true;
    },

    // 获取省级数据
    getProvinceList() {
      const params = new URLSearchParams();
      axios.post(this.serviceUrl + '/coreRegion/getProvinceList', params).then(
          response => {
            this.provinceList = response.data.data;
            if (this.form.addrProvince != '') {
              for (let p of this.provinceList) {
                if (this.form.addrProvince == p.regionName) {
                  this.province = p.id;
                  this.getCityList(p.id);
                }
              }
            }
          }
      );
    },
    // 获取市级数据
    getCityList(event) { //change 触发事件
      for (let p of this.provinceList) {
        if (this.province == p.id) {
          this.form.addrProvince = p.regionName;
        }
      }
      console.log("获取市级信息")
      console.log(event)
      const params = new URLSearchParams();
      params.append("fatherId", event)
      axios.post(this.serviceUrl + '/coreRegion/getChildByFatherId', params).then(
          response => {
            console.log(response.data.data)
            // 清空city选择框的值
            this.city = ''
            this.district = '';
            this.cityList = response.data.data;
            this.districtList = [];
            if (this.form.addrCity != '') {
              for (let c of this.cityList) {
                if (this.form.addrCity == c.regionName) {
                  this.city = c.id;
                  this.getDistrictList(c.id);
                }
              }
            }
          }
      );
    },
    // 市级数据发生改变
    getDistrictList(event) { //change 触发事件
      for (let c of this.cityList) {
        if (this.city == c.id) {
          this.form.addrCity = c.regionName;
        }
      }
      console.log(event)
      const params = new URLSearchParams();
      params.append("fatherId", event)
      axios.post(this.serviceUrl + '/coreRegion/getChildByFatherId', params).then(
          response => {
            console.log(response.data.data)
            // 清空city选择框的值
            this.district = ''
            this.districtList = response.data.data;

            if (this.form.addrDistrict != '') {
              for (let d of this.districtList) {
                if (this.form.addrDistrict == d.regionName) {
                  this.district = d.id;
                }
              }
            }
          }
      );
    },
    districtChange(){
      for (let d of this.districtList) {
        if (this.district == d.id) {
          this.form.addrDistrict = d.regionName;
        }
      }
    }
  },
  // 计算属性
  computed: {}
})

$(function () {

  $(".content-right-data-content").mouseover(function () {
    $(this).find(".content-right-data-content-right").css({"display": "block"})
  })
  $(".content-right-data-content").mouseleave(function () {
    $(this).find(".content-right-data-content-right").css({"display": "none"})
  })

  $(".content-right-data-content").on("click", ".delete", function () {
    var id = $(this).siblings("input").val();
    $.ajax({
      async: false,
      type: 'post',
      data: {"id": id},
      url: '/address/todelete',
      success: function (data) {
        if (data == "成功") {
          window.location.reload();
        }
      }

    })
  })
  $(".payorder").click(function () {
    $(this).children("span").addClass("red-span")
    $(this).siblings().children("span").removeClass("red-span")
    $(".content-right-data-content").css({"display": "none"})
    $(".content-right-data-content-pay").css({"display": "block"})
    $(".content-right-data-content-nopay").css({"display": "none"})
  })
  $(".nopayorder").click(function () {
    $(this).children("span").addClass("red-span")
    $(this).siblings().children("span").removeClass("red-span")
    $(".content-right-data-content").css({"display": "none"})
    $(".content-right-data-content-pay").css({"display": "none"})
    $(".content-right-data-content-nopay").css({"display": "block"})
  })
  $(".allorder").click(function () {
    $(this).children("span").addClass("red-span")
    $(this).siblings().children("span").removeClass("red-span")
    $(".content-right-data-content").css({"display": "block"})
    $(".content-right-data-content-pay").css({"display": "none"})
    $(".content-right-data-content-nopay").css({"display": "none"})
  })
  $(".content-left-order").click(function () {
    window.location.href = "/user/toPersonalOrder";
  })
  $(".content-left-message").click(function () {
    window.location.href = "/user/info";
  })
  $(".header-main-center-height-cart").click(function () {
    window.location.href = "/shoppingCart";
  })
  $(".header-main-left").click(function () {
    window.location.href = "/user/toIndex";
  })
})
