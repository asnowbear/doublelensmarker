var pos = 0;
var shapes = [];

var leftShapes = [],leftShapesCache,
    // rightShapes = [],rightShapesCache,
    centerShapes = [],centerShapesCache ;

var shapesAndTypeMap={};// shapes数组和shape的type的映射
var imagesAndTypeMap={};// images数组和shape的type的映射
var type = "";
var shape;
var paint = false;
var index;
var tim;
var isPlaying = false;
//是否正在播放
var isDrawPerson = true;
var isShowBtn = false;
var btnEnabled = true;
var isEdited = false;
var isEnabledEdit = false;
var currentPos = -1;
var imgar = [];
var imgLeft = [];
// var imgRight = [];
var ScrollBar;
var drawType = "new";
var downX,downY;
var tracePlay = false ;
var playForward = true ;// 播放方向（向前，向后）
var image_width = 502 ;
var image_height = 448 ;
var poseModify = -1 ;
var validateBoxValue=25;//控制shape框的高度
var editedCanvas="can";// 中间可编辑的canvas id
var canvasFrom="";
var lineColor = "#0000ff",highlightLineColor = "#ff0000";//绘图时线颜色,以及高亮颜色
var speed = 100;//播放速度,每帧用的毫秒数
var platformStatus = 2 ;// 1为质检合格
var referenceLine = null ;// 绘制的参考线

var DEBUG = false ;

/**
 * 规则：
 * a)	一旦视频标记为质检合格，此视频的所有帧标注进行冻结
 * b)	质检结果不合格的视频可再进入修改，不合格视频的所有帧都可修改和删除，包括已经质检合格的帧。
 */
var frozenStatus = 0;// 质检状态，整体合格与整体不合格

var currentEditedType="center";// 当前编辑区域的类型
var displayAll = true,
  displayAllAnnoText = true ;// 是否全部显示shape图形,是否全部显示文字
var idIncrement = true ;// 图形的ID是否是自增模式

var checkStatus = false ;// 当前是否是质检状态，质检是标注的一个简洁版功能
var operationCase = 32; //32为高级质检人员（允许编辑标注框内容）
var PRECISION = 9 ;// 所有数据保存的精度
var isinitcavaeswindow = false;

/**
 * 记录中镜头和边镜头的宽高信息
 * 1、用于镜头切换时屏幕宽高设置
 * 2、减少计算，避免问题出现概率
 * 3、为了防止浏览器环境变化，导致中镜头宽高发送变化，在
 * 数据提交时，需要做验证
 * 4、
 *
 * @type {{obj}}
 *
 * data structure
 * {
 *   sideWidth: 0,
 *   sideHeight: 0,
 *   centerWidth: 0,
 *   centerHeight: 0,
 * }
 *
 * data initialized by dolayout function in layout file,
 * used in lev switching
 *
 */
var layoutWH = {};

/**
 *提交保存
 */
function uploadClick() {
    if (btnEnabled) {
        // 已审核数据不能修改
        if(frozen()){
            return ;
        }
  
        collectionAllData();
        insertTraceInfoToAllData();
      
        // 确保初始化中镜头的宽和高未被人为更改
        if(!canCollect){
            return ;
        }

        // 质检不做值的收集
        if(!checkStatus){
        }else{// 质检在保存之前需要做保存前的检查
            if(!check()){
                return ;
            }
        }

        save();
        upload();
  
        
    }else{
        alert("当前正在绘制图形，请绘制完毕，再保存！");
    }
}

function init(platformStatus){
    var count = 0;
    var naturalWidth = 0,naturalHeight = 0 ;
    for ( i = 0; i < data.images.length; i++) {
        imgar[i] = new Image();
        imgar[i].src = data.images[i].fileName;
        imgar[i].onload = function() {

            // 记录图形的原始大小
            naturalWidth= this.width;
            naturalHeight = this.height ;

            // 记录图片的原始大小
            data.naturalWidth = naturalWidth;
            data.naturalHeight = naturalHeight;

            if(!isinitcavaeswindow) {
                // 初始化窗口大小
                isinitcavaeswindow = true;
                lasyinit(platformStatus);
            }

            if(count >= data.images.length - 1){
                $("#scroll_load").hide();
                $("#scrollBar").css({"background-color":"#d0c099"});
            }

            this.width = image_width;
            this.height = image_height;

            count ++;

            // 设置下载的进度条
            ScrollBar.loadingProgress(count/data.images.length);
        }

        imgLeft[i] = new Image();
        imgLeft[i].src = data.imagesL[i].fileName;
        imgLeft[i].onload = function() {
        }
    }
}

/**
 * 浏览器以及其版本的判断
 * @returns {*}
 */
function checkBbrowser(){
    var userAgent = navigator.userAgent ;
    if(userAgent.indexOf("Chrome") > -1){
        return parseInt(userAgent.match(/Chrome\/([\d.]+)/)[1]);
    }

    return 0 ;
}

/**
 * 初始化
 * 1、
 * 2、事件监听
 * 3、播放条初始化
 * 4、
 */
function lasyinit(platformStatus){
    var verson = checkBbrowser();
    if(verson === 0 || verson < 49){
        alert("请使用谷歌浏览器(Chrome),并确保版本号在49以上");
        return ;
    }
    else if(verson < 49){
        alert("您当前的谷歌浏览器版本过低，请升级至49以上版本！");
        return ;
    }

    // 获得平台质检的状态值
    frozenStatus = platformStatus == 1  ? true : false  ;

    // 初始化遮挡离开模块事件监听
    initCoverLeaveHandler();

    // 初始化绘制辅助线
    referenceLine = new ReferenceLine();

    // 建立映射关系
    setupTypeMap();

    // 初始化图形绘制事件
    initCanvasEvent();

    // 初始化切换编辑区域事件
    initSwitchCanvasEvent();

    // 初始化类型选择组件（排除质检与高级质检的情况）
    if(!checkStatus || operationCase == 32){
        initTypeSelect();
    }

    //如果开始是自增则直接选中自增按钮
    if(idIncrement){
        $("#incrementIpt")[0].checked=true;
    }

    // 初始化质检模块
    initCheckHandler();

    // 初始化工具条
    initToolbar();

    // 初始化Scrollbar
    setupScrollbar();

    $("#title").html(data.title);

    // 不合格帧列表渲染
    renderUnqualifiedAnno();

    // 开始布局
    layout();

    // 初始化trace轨迹和cover信息,并存放到leftShapes、rightShapes、centerShapes对象中
    initTraceAndCoverInfoFromData();

    // 显示图片流
    show();

    // 质检界面上关闭按钮事件监听，清空数据
    $("#cancelBtn").click(function(e){
        cancel();
    });

    // 记录本次保存的宽和高
    data.clientH = layoutWH.centerHeight;
    data.clientW = layoutWH.centerWidth ;
}

/**
 * 初始化映射关系
 */
function setupTypeMap(){
    // shapes
    shapesAndTypeMap["left"] = leftShapes;
    // shapesAndTypeMap["right"] = rightShapes;
    shapesAndTypeMap["center"] = centerShapes;

    // images
    imagesAndTypeMap["left"] = data.imagesL;
    // imagesAndTypeMap["right"] = data.imagesR;
    imagesAndTypeMap["center"] = data.images;
}

/**
 * 初始化画布切换事件，用于画布切换
 */
function initSwitchCanvasEvent(){

    // 双击事件处理
    $('#imageLeftDiv').click(function(e){
        switchToCenter(e,"left");
    });

    // 双击事件处理
    $('#imageRightDiv').click(function(e){
        switchToCenter(e,"right");
    });
}

/**
 * 检查是否允许切换
 * @returns {boolean}
 */
function canSwitch(){

    // 正在选择绘制的图形类型
    if(onShapeTypeSelected == false){
        return false ;
    }

    // 质检模块的切换检查
    return check();
}

/**
 * 更换编辑区域
 */
function switchToCenter(e,from){
    // 切换验证
    if(!canSwitch()){
        return ;
    }

    // 切换之前保存数据
    save();

    var ct = e.currentTarget;
    var img = ct.children[1];
    var id = img.id.toString();

    var priff = "";
    if(id.indexOf("L") > -1){
        priff = "L";
        currentEditedType = "left";
    }else if(id.indexOf("R")> -1){
        priff = "R";
        currentEditedType = "right";
    }else{
        currentEditedType = "center";
    }

    var editDivDom = $("#editDiv")[0];
    img = editDivDom.children[1];
    id = img.id.toString();

    var priffM = "";
    if(id.indexOf("L") > -1){
        priffM = "L";
        canvasFrom = "left";
    }else if(id.indexOf("R")> -1){
        priffM = "R";
        canvasFrom = "right";
    }else{
        canvasFrom = "center";
    }

    // 1.先交换html内容
    if(from == "left"){
        var temp = $("#imageLeftDiv").html();
        $("#imageLeftDiv").html($("#editDiv").html());
        $("#editDiv").html(temp);
    }else if(from == "right"){
        var temp = $("#imageRightDiv").html();
        $("#imageRightDiv").html($("#editDiv").html());
        $("#editDiv").html(temp);
    }

    var imagepriffM =$("#image"+priffM+"") ;
    var imagepriff = $("#image"+priff+"") ;

    // 2.更改边镜头的宽和高
    var sideWidth = layoutWH.sideWidth,
        sideHeight = layoutWH.sideHeight;
    imagepriffM.css({"width":sideWidth + "px","height":sideHeight + "px"});
    var candom = document.getElementById("can"+priffM+"");
    candom.width = sideWidth;
    candom.height = sideHeight;

    // 3.更改中镜头的宽和高
    var centerWidth = layoutWH.centerWidth,
        centerHeight = layoutWH.centerHeight;
    imagepriff.css({"width":centerWidth + "px","height":centerHeight + "px"});
    candom = document.getElementById("can"+priff+"");
    candom.width = centerWidth;
    candom.height = centerHeight;

    editedCanvas = "can"+priff;

    // 更换编辑区域canvas的监听
    switchCanvasEvents(currentEditedType);
}

/**
 * 获取编辑区域的shapes数组
 */
function getEditedShapes(key){
    if(key == undefined){
        return shapesAndTypeMap[currentEditedType];
    }else {
        return shapesAndTypeMap[key];
    }
}

/**
 * 获取编辑区域的data.images数组
 */
function getEditedDataImages(key){
    if(key == undefined){
        return imagesAndTypeMap[currentEditedType];
    }else {
        return imagesAndTypeMap[key];
    }
}

/**
 * 初始化Scrollbar
 */
function setupScrollbar(){
    pos = 1;
    // 设置最大值
    ScrollBar.maxValue = data.images.length;
    // 初始化
    ScrollBar.Initialize(pos,data.images.length);
    // 初始化刻度从1开始
    ScrollBar.SetPos(pos);
}

function anno_click(n) {
    save();
    if (btnEnabled && check()) {
        tracePlay = true ;
        pause();
        pos = n;
        show();
        ScrollBar.SetPos(pos);
    }
}

/**
 * 图形绘制完毕事件处理
 */
function onShapeDrawedAndSelectedEnd(selectedVal,type){

    // 更新images里面的状态值
    var images = getEditedDataImages();
    if (!images[pos - 1].effective) {
        images[pos - 1].status = "modify";
        if (document.getElementById("annodiv" + pos)) {
            document.getElementById("annodiv" + pos).className = "anno modify";
        }
    } else {
        images[pos - 1].status = "marked";
    }

    btnEnabled = true;
    isShowBtn = false;

    var shapes = getEditedShapes();

    if (currentPos != -1) {
        shapes[currentPos].type = type;
        shapes[currentPos].num = selectedVal;
    } else {
        shapes[shapes.length - 1].type = type;
        shapes[shapes.length - 1].num = selectedVal;
    }
    redraw();
    save();
}

/**
 * 缓存、统计、不合格渲染
 */
function save() {

    // 如果是质检，就调用质检的save方法
    if(checkStatus){
        checkSave();
        return ;
    }

    data.tagedNum = Number($("#tagedFrameNum").html());// 标注框数

    var totalBoxNum = $("#totalFrameNum").html() || 0,
        markedBoxNum = $("#tagedFrameNum").html() || 0,
        modifyBoxNum = $("#tagedFrameNum1").html() || 0;

    data.Workload = {
        "totalBoxNum": totalBoxNum,
        "markedBoxNum": markedBoxNum,
        "modifyBoxNum" : modifyBoxNum,
        "checkNum": 0,
        "leaktagNum": 0,
        "leakRate": 0,
        "errortagNum": 0,
        "boxNum": 0,
        "errorRate": 0
    };

    // 不合格帧列表渲染
    renderUnqualifiedAnno();
}

/**
 * 不合格帧列表渲染
 */
function renderUnqualifiedAnno(){
    var images = getEditedDataImages();
    if(images == undefined){
        return ;
    }

    $("#video_anno_body").html("");
    var videoAnnoBodyDom = $("#video_anno_body") ;
    var html = "" ;
    for (var i = 0; i < images.length; i++) {
        if (!images[i].effective) {
            var style = "no_qualified";
            if (images[i].status == "modify") {
                style = "modify";
            }

            html = "<div class='anno " + style + "' id='annodiv" + (i + 1) + "' onclick='anno_click(" + (i + 1) + ")'>" + (i + 1) + "</div>" ;

            if(videoAnnoBodyDom.html() != undefined)
               videoAnnoBodyDom.html(videoAnnoBodyDom.html() + html);
            else
               videoAnnoBodyDom.html(html);
        }
    }
}


