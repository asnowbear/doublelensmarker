/**
 * Created by zhangyong on 2016/11/23.
 */


var clientWidth = 0,
    clientHeight = 0,
    bufferWidth = 30,
    bufferHeight = 50;

function layout(){
    clientWidth = document.documentElement.clientWidth ;
    clientHeight =  document.documentElement.clientHeight ;

    doLayout();
}

/**
 * 全屏按钮点击处理
 */
function doLayout(){

    // 正在选择绘制的图形类型
    if(onShapeTypeSelected == false){
        return false ;
    }

    var imageBodyWidth = clientWidth - bufferWidth,
        imageBodyHeight = clientHeight - bufferHeight ;
    var imageWorkableHeight = imageBodyHeight - $("#title").height() - $("#menu").height() - $("#tagBanner").height() - $("#proccessBar").height();

    $(".image_body").width(imageBodyWidth);
    $("#menu").width(imageBodyWidth - 200);
    $("#imageshow").width(imageBodyWidth);

    $("#imageshow").height(imageWorkableHeight + 3);

    $(".image_body").css({"position":"absolute","left":"5px","top":"50px","z-index":"1","background":"#f8f8f8"});

    if($(".col-md-3").length != 0){
        $(".col-md-3").css({"z-index":"0"});
    }

    $('.image_body').prependTo('body');

    // left 调整
    // 1、图片调整
    // 2、canvas调整

    var sideRateW = 0.28,
        sideRateH = 0.5;

    var sideWidth = parseInt(sideRateW * imageBodyWidth) ;
    var sideHeight = parseInt(sideRateH * imageWorkableHeight) ;
    // 根据当前的宽度对比系数，然后动态计算高度和top值针对左侧两个小框的值
    var coefficient = (sideWidth - 5) / data.naturalWidth;

    $("#leftDiv").width(sideWidth);
    $("#leftDiv").height(imageWorkableHeight);

    $("#imageLeftDiv").width(sideWidth);
    $("#imageLeftDiv").height(sideHeight);

    $("#imageRightDiv").width(sideWidth);
    $("#imageRightDiv").height(sideHeight);

    // 1.left UI
    var imageLeft = $("#imageLeftDiv")[0].children[1];
    var canvasLeft = $("#imageLeftDiv")[0].children[2];

    
    // 计算边镜头的宽高
    var commonSideWidth = sideWidth - 5,
        commonSideHeight =  parseInt(data.naturalHeight * coefficient) ;
    
    $('#'+imageLeft.id+'').width(commonSideWidth) ;
    $('#'+imageLeft.id+'').height(commonSideHeight) ;
    canvasLeft.width = commonSideWidth;
    canvasLeft.height = commonSideHeight ;

    // 2.right UI
    // var imageRight = $("#imageRightDiv")[0].children[1],
    //     canvasRight = $("#imageRightDiv")[0].children[2];
    //
    // $('#'+imageRight.id+'').width(commonSideWidth) ;
    // $('#'+imageRight.id+'').height(commonSideHeight) ;
    // canvasRight.width = commonSideWidth ;
    // canvasRight.height = commonSideHeight ;
    //
    // // 离开、遮挡UI
    // var coverScrollDivRateW = 0.11;
    // if(imageBodyWidth <= 2210){
    //     $("#coverScrollDiv").width(imageBodyWidth * coverScrollDivRateW - 10);
    // }else {
    //     $("#coverScrollDiv").width(imageBodyWidth * coverScrollDivRateW);
    // }
    //
    // $("#coverScrollDiv").height(imageWorkableHeight);

    // 3.center UI
    var centerRateW = 0.6;
    var centerWidth = parseInt(centerRateW * imageBodyWidth) ;

    // 根据当前的宽度对比系数，然后动态计算高度和top值针对中间的值
    var coefficientcenter = (centerWidth - 5) / data.naturalWidth;
    $("#editDiv").width(centerWidth);
    $("#editDiv").height(imageWorkableHeight);

    var imageCenter = $("#editDiv")[0].children[1],
        canvasCenter = $("#editDiv")[0].children[2];

    // 计算中间镜头的宽和高
    var commonCenterWidht = centerWidth - 5,
        commonCenterHeight = parseInt(data.naturalHeight * coefficientcenter);
    
    $('#'+imageCenter.id+'').width(commonCenterWidht) ;
    $('#'+imageCenter.id+'').height(commonCenterHeight) ;
    canvasCenter.width = commonCenterWidht ;
    canvasCenter.height = commonCenterHeight ;

    // 记录镜头的宽和高，
    layoutWH = {
      sideWidth: commonSideWidth,
      sideHeight: commonSideHeight,
      centerWidth: commonCenterWidht,
      centerHeight: commonCenterHeight
    }

    // 重新适应高度
    if(imageWorkableHeight < commonCenterHeight){
        imageWorkableHeight = commonCenterHeight ;

        $("#imageshow").height(imageWorkableHeight + 3);
        $("#leftDiv").height(imageWorkableHeight);
        $("#coverScrollDiv").height(imageWorkableHeight);
        $("#editDiv").height(imageWorkableHeight);
    }

    DEBUG && console.info("获得初始化时的宽和高:["+commonCenterWidht+","+commonCenterHeight+"]");

    // 播放toolbar
    $("#proccessBar").width(imageBodyWidth);
    $("#scrollBar").width(imageBodyWidth - 500);

    // 质检的
    $("#checkInfodiv").width(imageBodyWidth);
    $("#video_anno").width(imageBodyWidth);

    if($("#qualityForm").length > 0){
        $('.image_body').append($("#qualityForm"));
    }

    if($("#examinerForm").length > 0){
        $('.image_body').append($("#examinerForm"));
    }

    if($(".btn-group-justified").length > 0){
        $('.image_body').append($(".btn-group-justified"));

        $('.image_body').append("<div height='50px;'></div>");
    }

    // 全屏、小屏模式调整处理
    ScrollBar.updateUiMode("full");

    if($("#imageshow").height() <= 428){
        $("#proccessBar").css({"margin-top":"50px"});
    }
}
