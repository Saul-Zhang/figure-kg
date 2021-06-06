import * as echarts from '../../ec-canvas/echarts';

const app = getApp();


let chart;
Page({
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    return {
      title: 'ECharts 可以在微信小程序中使用啦！',
      path: '/pages/graph/index',
      success: function () {},
      fail: function () {}
    }
  },
  // 页面初始化数据
  data: {
    // ec: {
    //   onInit: initChart
    // }
    ec: {},
    echartsData: {},
    figures: [],
    indexFlag: '',
    figureIndex: [0],
    //添加关系用的
    relationList: [{}],
    //保存一个人物的信息
    figureInfo: {
      name: '',
      remark:'',
      desc: '',
      relationList: [{}],
      },
      nameRules: {
        // pattern: '^\s*$',
        // pattern: '^[A-Za-z0-9]+$',
        required: true,
        whitespace: true,
        message: '姓名不能为空',
        trigger: 'change'
    },
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 重置图表存储容器 不然会报错
    chart = {};
    this.getData(); //获取数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.echartsComponnet = this.selectComponent('#mychart-grap');
    // form 组件初始化
    wx.lin.initValidateForm(this)
  },
  // <!--获取到数据后，初始化报表-->
  getData: function () {
    var figures = [{
      'name': '请选择',
      id: '0',
      'bookId': '-1'
    }]
    var echartsData = {};
    //  .... 获取数据
    var _this = this;
    wx.request({
      url: 'http://localhost:8080/api/wx/book/1/figures',
      success(res) {
        // 所有人物节点
        echartsData.data = res.data
        // 下拉列表中的人物
        figures.push(...res.data)
        console.log("figures")
        console.log(figures)
        _this.setData({
          figures: figures
        })
      }
    })
    // 获取人物关系
    wx.request({
      url: 'http://localhost:8080/api/wx/book/1/re-figures',
      success(res) {
        echartsData.links = res.data
        console.log(res.data)
      }
    })
    console.log("figures")
    console.log(figures)
    this.setData({
        echartsData: echartsData,
        figures: figures
      },
      () => {
        this.initEcharts(); //初始化图表
      })
  },
  //  <!--//初始化图表-->
  initEcharts: function () {
    console.log("initEcharts")
    this.echartsComponnet.init((canvas, width, height, dpr) => {
      // 初始化图表
      chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // 不加这个图表会不清晰
      });
      this.setOption();
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });
  },

  setOption: function () {
    console.log("setOption")
    var _this = this
    chart.clear(); // 清除
    chart.setOption(this.getOption()); //获取新数据
    chart.on('click', function (params) {
      // 控制台打印数据的名称
      console.log(params);
      if ('node' == params.dataType) {
        // params.data.id是人物的id
        _this.popup(params.data.id)
      }
    })
  },


  getOption: function () {
    console.log("getOption")
    let {
      echartsData
    } = this.data;
    return {
      // title: {
      //   text: '《暗夜与黎明》主要人物关系图'
      // },
      // tooltip: {},
      // 工具箱 
      toolbox: {
        // 显示工具箱
        show: true,
        feature: {
          mark: {
            show: true
          },
          // 还原
          restore: {
            show: true
          },
          // 保存为图片
          saveAsImage: {
            show: true
          }
        }
      },
      //数据更新动画的时长
      animationDurationUpdate: 1500,
      //数据更新动画的缓动效果
      animationEasingUpdate: 'quinticInOut',
      series: [{
        type: 'graph',
        //采用力引导布局
        layout: 'force',
        //该类目节点标记的大小
        symbolSize: 40,
        //是否开启鼠标缩放和平移漫游
        roam: true,

        label: {
          normal: {
            // 是否显示标签内容
            show: true
          }
        },
        // edgeSymbol: ['circle', 'arrow'],
        // edgeSymbolSize: [4, 10],
        edgeLabel: {
          normal: {
            textStyle: {
              // 关系的字体大小
              fontSize: 10
            },
            show: true,
            formatter: function (x) {
              return x.data.name;
            }
          }
        },
        force: {
          //节点之间的斥力因子
          repulsion: 500,
          edgeLength: [100, 200]
        },

        data: echartsData.data,
        links: echartsData.links,
        lineStyle: {
          normal: {
            opacity: 0.9,
            width: 2,
            curveness: 0
          }
        }
      }]
    };
  },
  addVertex: function () {
    var random = Math.floor(Math.random() * 10)
    console.log(random)
    data.push({
      name: random
    })
    // this.setData({
    //   echartsData: data
    // })
    // this.getData(); //获取数据
    this.initEcharts(); //初始化图表
  },
  addEdge: function () {
    links.push({
      source: '蕾格娜',
      target: '威格姆',
      name: "夫妻"
    })
    this.initEcharts(); //初始化图表
  },
  // addFigure: function (e) {
  //   console.log("e>>>", e);
  //   const id = e.currentTarget.dataset.bookId;
  //   console.log("id>>>", id);
  //   // 路由跳转 打开新页面
  //   wx.navigateTo({
  //     url: '../figure-add/figure-add?id=' + id,
  //   })
  // },

  popup: function (e) {
    // const position = e.currentTarget.dataset.peosition
    console.log(e)
    //先将人物信息清空
    this.setData({
      figureInfo: {
        relationList: [{}]
      },
      relationList: [{}]
    })
    // 这是修改人物信息
    if ('string' == typeof e) {
      // 根据人物id获取点击的人物的信息
      var figureInfo = this.getFigureByUserId(e)
      var _this = this
      var url = 'http://localhost:8080/api/wx/book/'+1+'/figure/'+e+'/re-figures'
      wx.request({
        url: url,
        success(res) {
          figureInfo.relationList = res.data
          console.log("figureInfo111")
          console.log(figureInfo)
          var relationList = figureInfo.relationList
          var figureIndex = _this.getFigureIndexByrId(relationList)
          _this.setData({
            figureInfo: figureInfo,
            relationList: relationList,
            figureIndex: figureIndex
          })

        }
      })

      // console.log("figureInfo==")
      // console.log(figureInfo)


    }
    // 弹窗从右边弹出
    const position = 'right'
    let customStyle = ''
    let duration = this.data.duration
    this.setData({
      position,
      show: true,
      // customStyle,
      // duration
    })
  },


  getFigureByUserId(id) {
    var figureInfo = {}
    var data = this.data.echartsData.data
    for (var i = 0; i < data.length; i++) {
      if (id == data[i].id) {
        figureInfo = data[i]
        // this.setData({
        //   figureInfo:figureInfo
        // })
        break
      }
    }
    return figureInfo
  },

  // 根据人物id获取这个人物在figures中的下标
  getFigureIndexByrId(relationList) {
    console.log("getFigureIndexByrId")
    console.log(relationList)
    var figureIndex = [];
    var figures = this.data.figures
    var index = 0;
    for (var i = 0; i < relationList.length; i++) {
      for (var j = 1; j < figures.length; j++) {
        if (relationList[i].figureId == figures[j].id) {
          figureIndex[index++] = j;
          break;
        }
      }
    }
    return figureIndex;

  },
  exit() {
    this.setData({
      show: false
    })
    // wx.navigateBack()
  },
  // 选择关联人物
  bindFigureChange: function (e) {
    //获取当前索引（第几个关联）
    var nowIdx = e.currentTarget.dataset.index;
    var figureIndex = this.data.figureIndex;
    // e.detail.value表示选择的是第几个人物
    figureIndex[nowIdx] = e.detail.value
    console.log(figureIndex)
    this.setData({
      figureIndex: figureIndex
    })
  },
  // 获取人物关系input
  relationInput(e) {

    const index = e.currentTarget.dataset.index;
    console.log(index)
    var list = this.data.relationList;
    list[index].relation = e.detail.value

    console.log(e.detail.value)
    this.setData({
      relationList: list
    })
  },
  // 添加一条关系
  addRelation() {
    console.log(this.data.figureInfo)
    var list = this.data.relationList;
    console.log(list)
    list.push({})
    var index = this.data.figureIndex;
    index.push(0)
    this.setData({
      relationList: list,
      figureIndex: index
    })
  },
  deleteRelation(e) {
    const index = e.currentTarget.dataset.index;
    var relationList = this.data.relationList;
    var figureIndex = this.data.figureIndex;
    relationList.splice(index, 1)
    figureIndex.splice(index, 1)
    this.setData({
      relationList: relationList,
      figureIndex: figureIndex
    })
  },
  saveFigure(e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    const {
      detail
    } = e;
    console.log(detail)
    // console.log(this.data.figureInfo)
    // console.log(this.data.info)
  },
  formSubmit(e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
  },
  onReady() {}
});