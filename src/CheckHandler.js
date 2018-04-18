//---------------------------------------------------------------
//
// 质检模板处理
//
//---------------------------------------------------------------



/**
 * 初始化质检模块
 * 1、质检相关UI事件监听
 * 2、质检状态控制
 */
function initCheckHandler(){
    // 非质检，则跳出初始化工作
    if(!checkStatus){
        return ;
    }

    // 底部状态框切换
    $("#checkStatictis").show();

    // 顶部状态框切换
    $("#checkBanner").show();
    $("#tagBanner").hide();
    if(operationCase == 32){
        $("#divtotalFrameNum1").show();
        $("#divtagedFrameNum11").show();
        $("#divtagedFrameNum111").show();
        $("#incrementIpt")[0].disabled = false;
    }else{
        $("#divtotalFrameNum1").hide();
        $("#divtagedFrameNum11").hide();
        $("#divtagedFrameNum111").hide();
        $("#incrementIpt")[0].disabled = true;
    }
    updateShowStatistic();
    initQualityHandler();
    // 第一次显示质检相关统计结果，主要是从data数据中获取
    showCheckStatistic();

    // 合格按钮点击监听
    $("#qualityBtn").click(function(e){
        qualityBtnClick();
    });

    // 不合格按钮点击监听
    $("#noqualityBtn").click(function(e){
        noqualityBtnClick();
    });
}

/**
 * 更新质检的统计状态
 */
function updateCheckStatictis(){
    if(!checkStatus){
        return ;
    }

    // 显示质检统计结果
    showCheckStatistic();

    // 渲染质检不合格帧列表
    renderUnqualityList(getEditedDataImages());
}

/**
 * 显示质检统计结果
 */
function showCheckStatistic() {

    var suffix = "";
    if(currentEditedType == "left"){
        suffix = "L";
    }else if(currentEditedType == "right"){
        suffix = "R";
    }

    $("#totalFrameNumC").html(data.images.length);// 总帧数

    var checkNum = data.statictis["checkNum" + suffix] ;
    $("#checkNum").html(checkNum);
    var mm = data.images.length;
    (mm == 0) && (mm = 1);
    $("#checkRate").html(Math.round(checkNum / mm * 10000) / 100 + "%");

    var leaktagNum = data.statictis["leaktagNum"+suffix];
    $("#leaktagNum").html(leaktagNum);

    var boxNum = data.statictis["boxNum" + suffix];
    $("#boxNum").html(boxNum);

    var errortagNum = data.statictis["errortagNum" + suffix];
    $("#errorNum").html(errortagNum);
}

/**
 * 合格按钮点击处理事件
 */
function qualityBtnClick() {
    if (pos > 0) {
        isEdited = true;
        isPlaying = false;
        document.getElementById("play").style.backgroundImage = "url(http://crowd-cdn.datatang.com/images//play.png)";
        clearInterval(tim);
        setAllshapeQuality();
        var image = getEditedDataImages();
        image[pos - 1].status = "checked";
        image[pos - 1].effective = true;

        document.getElementById("qualityBtn").style.color = "white";
        document.getElementById("qualityBtn").style.background = "url(http://crowd-cdn.datatang.com/images//u61.png)";
        document.getElementById("noqualityBtn").style.color = "black";
        document.getElementById("noqualityBtn").style.background = "url(http://crowd-cdn.datatang.com/images//u59.png)";

        document.getElementById("leaktag").value="0";
        document.getElementById("errortag").value="0";
        document.getElementById("errorcontenttxt").value="";

        save();
    }
}


/**
 * 不合格按钮点击处理事件
 */
function noqualityBtnClick() {
    if (pos > 0) {
        if(isShapesValidate()){
            alert("请确定当前帧的所有标注框质检完成！");
            // alert("请确定当前帧的所有标注框质检完成且没有漏标框数！");
            return;
        }else if(!isShapesValidate1()){
            alert("当前帧的所有标注框质检合格且不存在漏标框数，不允许置为不合格！");
        }else{
            isEdited = true;
            isPlaying = false;
            document.getElementById("play").style.backgroundImage = "url(http://crowd-cdn.datatang.com/images//play.png)";
            clearInterval(tim);

            var image = getEditedDataImages();
            image[pos - 1].status = "checked";
            image[pos - 1].effective = false;

            document.getElementById("qualityBtn").style.color = "black";
            document.getElementById("qualityBtn").style.backgroundImage = "url(http://crowd-cdn.datatang.com/images//u59.png)";
            document.getElementById("noqualityBtn").style.color = "white";
            document.getElementById("noqualityBtn").style.backgroundImage = "url(http://crowd-cdn.datatang.com/images//u61.png)";

            //统计错误框数
            document.getElementById("errortag").value=getErrottagCount();

            save();
        }

    }
}

function updateShowCheckStatistic(){

    if(!checkStatus) return ;

    $("#cancelBtn").hide();

    if (pos > 0) {

        var images = getEditedDataImages();
        var image = images[pos - 1] ;
        if (image.status == "checked" || image.status == "modify") {
            if (!image.effective) {
                document.getElementById("qualityBtn").style.color = "black";
                document.getElementById("qualityBtn").style.backgroundImage = "url(http://crowd-cdn.datatang.com/images//u59.png)";
                document.getElementById("noqualityBtn").style.color = "white";
                document.getElementById("noqualityBtn").style.backgroundImage = "url(http://crowd-cdn.datatang.com/images//u61.png)";

                $("#leaktag").val(image.leak_tag);
                $("#errortag").val(image.error_tag);
                $("#errorcontenttxt").val(image.error_content);
                // $("#checkInfodiv").show();
            } else {
                document.getElementById("qualityBtn").style.color = "white";
                document.getElementById("qualityBtn").style.backgroundImage = "url(http://crowd-cdn.datatang.com/images//u61.png)";
                document.getElementById("noqualityBtn").style.color = "black";
                document.getElementById("noqualityBtn").style.backgroundImage = "url(http://crowd-cdn.datatang.com/images//u59.png)";
            }
        } else {
            document.getElementById("qualityBtn").style.color = "black";
            document.getElementById("qualityBtn").style.backgroundImage = "url(http://crowd-cdn.datatang.com/images//u59.png)";
            document.getElementById("noqualityBtn").style.color = "black";
            document.getElementById("noqualityBtn").style.backgroundImage = "url(http://crowd-cdn.datatang.com/images//u59.png)";
        }

        //document.getElementById("errortag").max = image.label.PED.length + image.label.Car.length + image.label.Cyclist.length +image.label.Motorcycle_rider.length +image.label.PS.length+image.label.VAN.length+image.label.dontcare.length  ;
        //document.getElementById("errortag").max =recordnowshapeCount(image);
        // if(operationCase == 32){
            document.getElementById("errortag").max =recordnowshapeCount1(pos - 1);
        // }else{
        //     document.getElementById("errortag").max =recordnowshapeCount(image);
        // }

        document.getElementById("leaktag").max = 9999 ;

    }
}

/**
 * 取消按钮点击事件处理
 */
function cancel(){
    $("#leaktag").val(0);
    $("#errortag").val(0);
    $("#errorcontenttxt").val("");
}

/**
 * 提交前质检数据的合法性验证
 */
function check() {

    var leaktag = document.getElementById("leaktag").value,
        errortag = document.getElementById("errortag").value ;

    if(leaktag == ""){
        document.getElementById("leaktag").value = "0";
        leaktag = 0;
    }

    if(errortag == ""){
        document.getElementById("errortag").value = "0";
        errortag = 0;
    }

    // 漏标判断
    if(leaktag != 0){
        if (!/^[0-9]*[1-9][0-9]*$/.test(leaktag)) {
            alert("漏标数必须为整数！");
            return false;
        }else{
            if(leaktag > 9999){
                alert("超出漏标的最大值9999！");
                return false ;
            }
        }
    }


    // 如果质检界面显示，则就验证输入的正确性
    if($("#checkInfodiv").css("display") == 'none'){
        return true ;
    }

    // 错标数检查
    if(errortag != 0){
        if (!/^[0-9]*[1-9][0-9]*$/.test(errortag)) {
            alert("错标数必须为整数！");
            return false;
        }else {
            if(checkStatus) {
                var shapes = getEditedShapes(),max = 0;
                for(var i = 0;i < shapes.length ; i++){
                    var shape = shapes[i];
                    if(pos < shape.pos){
                        continue ;
                    }

                    var cs = shape.covers ;
                    for(var jj = 0;jj < cs.length ; jj++){
                        var l = cs[jj].leave;
                        if(l == 1){
                            if(pos > cs[jj].pos){
                                continue ;
                            }
                        }
                    }

                    max ++ ;
                }

                document.getElementById("errortag").max = max;

                var errorCount = Number(document.getElementById("errortag").max);
                var val = Number(document.getElementById("errortag").value);
                if (errorCount < val) {
                    alert("错标数超过最大标注框数，请重新输入！");
                    return false;
                }
            }
        }
    }

    var dimages = getEditedDataImages();

    if (pos > 0 && !dimages[pos - 1].effective && (leaktag == "0" && errortag == "0")) {
        alert("请输入漏标或错标数！");
        return false;
    } else {
        return true;
    }
}

/**
 * 保存操作处理
 */
function checkSave() {

    var checkNum = 0;// 质检总帧数
    var leaktagNum = 0;
    var boxNum = 0;// 质检总框数
    var n4 = 0;
    var errorNum = 0;

    var images = getEditedDataImages();
    // if(!images[pos - 1].effective&&images[pos - 1].status=="modify"){
    //     images[pos - 1].status="checked";
    // }

    if(images == undefined || images.length == 0){
        return ;
    }

    // 质检统计结果赋值给data
    if (pos > 0) {
        if(!images[pos - 1].effective && images[pos - 1].status == "modify"){
            images[pos - 1].status="checked";
        }
        images[pos - 1].leak_tag = document.getElementById("leaktag").value;//　漏标
        images[pos - 1].error_tag = document.getElementById("errortag").value;// 错标
        images[pos - 1].error_content = document.getElementById("errorcontenttxt").value;// 错误内容
    }

    // 从data数据中获取统计结果
    var i = images.length - 1,image = null ,itemLen = 0;
    for(;i >= 0;i --){
        image = images[i];
        if(image.status == "checked" || image.status == "modify"){
            checkNum ++ ;
            if(!image.effective){
                leaktagNum = leaktagNum + (parseInt(images[i].leak_tag) != 0 ? parseInt(images[i].leak_tag) : 0);
                n4 = n4 + (parseInt(images[i].error_tag) != 0 ? parseInt(images[i].error_tag) : 0);
                errorNum = errorNum + parseInt(images[i].error_tag);
            }
            // if(operationCase == 32){
                itemLen = recordnowshapeCount1 (i);
            // }else{
            //     itemLen =recordnowshapeCount(image);
            // }
            boxNum = boxNum + itemLen;
        }
    }

    var suffix = "" ;
    if(currentEditedType == "left"){
        suffix = "L";
    }else if(currentEditedType == "right"){
        suffix = "R";
    }

    // 更新data数据总中的统计结果
    data.statictis["checkNum" + suffix] = checkNum;
    data.statictis["leaktagNum" + suffix] = leaktagNum;
    data.statictis["errortagNum" + suffix] = errorNum;
    data.statictis["boxNum" + suffix] = boxNum + leaktagNum;

    // 质检总帧数
    $("#checkNum").html(checkNum);

    // 总帧数
    var mm = images.length;
    $("#totalFrameNumC").html(mm);
    if (mm == 0) mm = 1;

    // 质检率
    var checkRate = Math.round(checkNum / mm * 10000) / 100 + "%" ;
    $("#checkRate").html(checkRate);

    // 质检总框数
    $("#boxNum").html(boxNum + leaktagNum);

    // 漏标框数
    $("#leaktagNum").html(leaktagNum);

    // 错标框数
    $("#errorNum").html(errorNum);

    // 渲染质检不合格帧列表
    renderUnqualityList(images);
}


/**
 * 渲染质检不合格帧列表
 */
function renderUnqualityList(images){

    if(images == undefined || images.length == 0){
        return ;
    }

    $("#video_anno_body").html("");
    // 显示不合格帧列表
    for (var i = 0; i < images.length; i++) {
        if (!images[i].effective) {
            var style = "no_qualified";
            if (images[i].status == "modify") {
                style = "modify";
            }
            $("#video_anno_body").html($("#video_anno_body").html() + "<div class='anno " + style + "' id='annodiv" + (i + 1) + "' onclick='anno_click(" + (i + 1) + ")'>" + (i + 1) + "</div>");
        }
    }
}

function disabledErrorUI(){

    // 隐藏关闭按钮
    $("#cancelBtn").hide();

    // 错标、漏标。错误内容禁止输入
    $("#leaktag")[0].readOnly = true ;
    $("#errortag")[0].readOnly = true ;
    $("#errorcontenttxt")[0].readOnly = true ;

    $(".qualitytable input").attr("disabled","true");

}

function recordnowshapeCount(image){
    var sumcount=0;
    var carlen = (image.label.Car == undefined)?0:image.label.Car.length;
    if(carlen){
        for (var i=0;i<image.label.Car.length;i++){
            var obj=image.label.Car[i];
            if(obj.leave!=1){
                sumcount++;
            }
        }
    }
    carlen = (image.label.PED == undefined)?0:image.label.PED.length;
    if(carlen>0){
        for (var i=0;i<image.label.PED.length;i++){
            var obj=image.label.PED[i];
            if(obj.leave!=1){
                sumcount++;
            }
        }
    }
    carlen = (image.label.Cyclist == undefined)?0:image.label.Cyclist.length;
    if(carlen>0){
        for (var i=0;i<image.label.Cyclist.length;i++){
            var obj=image.label.Cyclist[i];
            if(obj.leave!=1){
                sumcount++;
            }
        }
    }
    if(image.label.Motorcycle_rider){
        if(image.label.Motorcycle_rider.length>0){
            for (var i=0;i<image.label.Motorcycle_rider.length;i++){
                var obj=image.label.Motorcycle_rider[i];
                if(obj.leave!=1){
                    sumcount++;
                }
            }
        }
    }
    carlen = (image.label.PS == undefined)?0:image.label.PS.length;
    if(carlen>0){
        for (var i=0;i<image.label.PS.length;i++){
            var obj=image.label.PS[i];
            if(obj.leave!=1){
                sumcount++;
            }
        }
    }
    carlen = (image.label.VAN == undefined)?0:image.label.VAN.length;
    if(carlen>0){
        for (var i=0;i<image.label.VAN.length;i++){
            var obj=image.label.VAN[i];
            if(obj.leave!=1){
                sumcount++;
            }
        }
    }
    carlen = (image.label.dontcare == undefined)?0:image.label.dontcare.length;
    if(carlen>0){
        for (var i=0;i<image.label.dontcare.length;i++){
            var obj=image.label.dontcare[i];
            if(obj.leave!=1){
                sumcount++;
            }
        }
    }
    return sumcount;
}
/**
 * 第pos帧的总框数
 * @param pos
 * @return {number}
 */
function recordnowshapeCount1(pos){
    var pos1 = pos + 1;
    var sumcount=0;
    var images = getEditedShapes();
    var count = 0;
    var imageslen = (images == undefined)? 0:images.length;
    var tracespos;
    if(imageslen>0){
        for(var i = 0;i < imageslen; i++){
            var covers = images[i].covers ;
            if(images[i].traces == undefined || images[i].traces.length == 0  || images[i].traces == []){
                count++;
            }else {
                tracespos =  images[i].traces[0].pos;
                if(covers == undefined || covers.length == 0 || covers == []){
                    if(pos1 >= tracespos){
                        count++;
                    }
                }else{
                    count = count + findInCover(covers,pos1,tracespos);
                }
            }
            sumcount =+ count;
        }
    }
    return sumcount;
}

function findInCover(covers,pos1,tracespos){
    var findIdx =-1;
    var Index=0;
    var coverslen = covers.length - 1 ;
    var count = 0;
    for(var j = 0;j <= coverslen;j++){
        var c=covers[j];
        if(pos1<c.pos){
            findIdx = j;
            Index = j;
            break;
        }
        if(pos1 == c.pos){
            findIdx = -2;
            Index = j;
            break;
        }
    }
    if(findIdx == -2){
        //当前位置为遮盖轨迹点
        if(covers[Index].leave == 0){
            if(pos1 >= tracespos){
                count = 1;
            }
        }
    }else if(findIdx == -1){
        //当前位置位于遮盖轨迹最后一个位置之后
        if(covers[coverslen].leave == 0){
            if(pos1 >= tracespos){
                count = 1;
            }
        }
    }else{
        //当前位置位于遮盖轨迹点之前
        if(Index-1>=0){
            if(covers[Index - 1].leave == 0){
                if(pos1 >= tracespos){
                    count = 1;
                }
            }
        }
    }
    return count;
}

