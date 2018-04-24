/**
 * 前一帧钮点击处理
 */
function prev() {
    pause();
    save();
    if (btnEnabled && check() && data.images.length > 0 && pos > 1) {

        var playPos = pos - 1;
        if(ScrollBar.SetPos(playPos)){
            tracePlay = true ;
            playForward = false ;
            lastpos = pos;
            pos-- ;
            show();

            // 更改播放图标为暂停图标
            document.getElementById("play").style.backgroundImage = "url(http://crowd-cdn.datatang.com/images/play.png)";
        }
    }
}

/**
 * 前十帧钮点击处理
 */
function prevTen() {
    pause();
    save();
    if (btnEnabled && check() && data.images.length > 0) {

        var playPos = pos - 10;
        if(playPos <= 1){
            playPos = 1;
        }

        if(ScrollBar.SetPos(playPos)){
            tracePlay = true ;
            playForward = false ;
            lastpos = pos;
            pos = playPos;
            show();

            // 更改播放图标为暂停图标
            document.getElementById("play").style.backgroundImage = "url(http://crowd-cdn.datatang.com/images/play.png)";
        }
    }
}

/**
 * 后一帧钮点击处理
 */
function next() {
    pause();
    save();
    if (btnEnabled && check() && data.images.length > 0 && pos < data.images.length) {
        var playPos = pos + 1;
        if(ScrollBar.SetPos(playPos)){
            tracePlay = true ;
            playForward = true ;
            lastpos = pos;
            pos ++ ;
            show();

            // 更改播放图标为暂停图标
            document.getElementById("play").style.backgroundImage = "url(http://crowd-cdn.datatang.com/images/play.png)";
        }
    }
}

/**
 * 后十帧钮点击处理
 */
function nextTen() {
    pause();
    save();
    if (btnEnabled && check() && data.images.length > 0) {

        var playPos = pos + 10;
        if(playPos >= data.images.length){
            playPos = data.images.length;
        }

        if(ScrollBar.SetPos(playPos)){
            tracePlay = true ;
            playForward = true ;
            lastpos = pos;
            pos = playPos;
            show();

            // 更改播放图标为暂停图标
            document.getElementById("play").style.backgroundImage = "url(http://crowd-cdn.datatang.com/images/play.png)";
        }
    }
}

/**
 * 重播按钮点击处理
 */
function replay() {
    save();
    if (btnEnabled && check() && data.images.length > 0) {
        lastpos = pos;
        pos = 1;
        if (!isPlaying) {
            isPlaying = true ;
            document.getElementById("play").style.backgroundImage = "url(http://crowd-cdn.datatang.com/images/pause.png)";
            tim = setInterval("next1()", speed);
        }

        playForward = true ;
        tracePlay = true ;
        resetShapes();// 点击播放后，将所有图形回归到其实位置

        show();

        ScrollBar.SetPos(pos);
    }
}

/**
 * 暂停按钮点击处理
 */
function pause() {
    if (btnEnabled) {
        if (isPlaying) {
            isPlaying = false;
            clearInterval(tim);

            document.getElementById("play").style.backgroundImage = "url(http://crowd-cdn.datatang.com/images/play.png)";
            tracePlay = false ;
        }
    }
}

/**
 * 点击开始播放按钮处理
 */
function action() {
    save();
    if (btnEnabled && check()) {
        if (isPlaying) {
            isPlaying = false;
            document.getElementById("play").style.backgroundImage = "url(http://crowd-cdn.datatang.com/images/play.png)";
            clearInterval(tim);

            tracePlay = false;

        } else {
            isPlaying = true;
            document.getElementById("play").style.backgroundImage = "url(http://crowd-cdn.datatang.com/images/pause.png)";
            tim = setInterval("next1()", speed);

            playForward = true ;
            tracePlay = true ;
        }
    }
}

// **********************************************************************************************************************************************************

/**
 * 渲染图片流
 */
function show() {
    if (pos > 0) {
        type = "";
        paint = false;
        cur = -1;

        $("#image").attr("src",imgar[pos - 1].src);
        $("#imageL").attr("src",imgLeft[pos-1].src);
        // $("#imageR").attr("src",imgRight[pos - 1].src);
    } else {
        if (data.images.length > 0) {
            $("#image").attr("src",imgar[0].src);
            $("#imageL").attr("src",imgLeft[0].src);
            // $("#imageR").attr("src",imgRight[0].src);
        }

        isEnabledEdit = false;
        shapes = [];
    }

    if(!$("#deletebtndiv").is(":hidden")){
        $("#deletebtndiv").hide();
        isShowBtn = false ;
    }

    // setAllShapesDisplay(true);
    redraw();// 刷新画布，重绘图形
}

function next1() {
    save();
    if (pos == data.images.length) {
        if (isPlaying) {
            isPlaying = false;
            document.getElementById("play").style.backgroundImage = "url(http://crowd-cdn.datatang.com/images/play.png)";
            clearInterval(tim);
        }
        return;
    }
    if (btnEnabled && check() && data.images.length > 0 && pos < data.images.length) {
        pos++;
        show();
    }
    ScrollBar.SetPos(pos);
}

/**
 * 点击播放后，将所有图形回归到开始位置
 */
function resetShapes(){
    for(var idx = 0; idx < shapes.length ; idx ++){
        var s = shapes[idx] ;
        var t = s.traces[0];// 重置后回到最开始的位置

        s.x1 = t.x1;
        s.y1 = t.y1;
        s.x2 = t.x2;
        s.y2 = t.y2;
    }
}

/**
 * 中镜头绘制完毕后，
 * 则绘制其他两屏的图形
 */
function redrawSide(){
    if(currentEditedType === "center"){
        redrawScale("canL",leftShapesCache);
        // redrawScale("canR",rightShapesCache);
    }else if(currentEditedType === "left"){
        redrawScale("can",centerShapesCache);
        // redrawScale("canR",rightShapesCache);
    }

    // else if(currentEditedType === "right"){
    //     redrawScale("can",centerShapesCache);
    //     redrawScale("canL",leftShapesCache);
    // }
}

/**
 * 绘制单屏图形
 * @param id 屏幕方向 can canL canR
 * @param shapes 对应到该屏幕下的shapes数组
 */
function redrawScale(id,shapes){
    if(shapes == undefined || shapes.length == 0){
        return ;
    }

    var can = document.getElementById(id);
    var cans = can.getContext('2d');
    can.width = can.width;

    // 重新绘制队列中的图形
    for (var i = 0; i < shapes.length; i++) {
        shapes[i].draw(cans);
    }
}

/**
 * 只重绘图形
 */
function alwaysRedrawShapes(){
    // 1.绘制当前位于中间镜头的shape
    var can = document.getElementById(editedCanvas);
    var cans = can.getContext('2d');
    can.width = can.width;

    // 2.找到当前中间镜头shape
    var edtShapes = [];
    switch(currentEditedType){
        case "center":
            edtShapes = centerShapes ;
            break ;
        case "left":
            edtShapes = leftShapes ;
            break ;
        // case "right":
        //     edtShapes = rightShapes;
        //     break ;
    }

    // 3.绘制
    if(edtShapes != undefined) {
        for (var i = 0; i < edtShapes.length; i++) {
            edtShapes[i].draw(cans);
        }
    }

    // 4.绘制两边镜头的数据
    redrawSide();
}

/**
 * 使用requestAnimationFrame方式重绘图形
 */
function redraw(){
    //window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    requestAnimationFrame(requestAnimationFrameRedraw);
}

/**
 * 刷新画布，重绘图形，渲染离开遮挡，刷新统计
 */
function requestAnimationFrameRedraw() {
    // 绘制图形
    alwaysRedrawShapes();

    // 绘制十字光标参考线
    referenceLine.drawOrUpdate();

    // 渲染覆盖、删除列表
    renderCoverList(getEditedShapes());

    //渲染单框质检列表
    renderQualityList(getEditedShapes());

    $("#checkInfodiv").hide();
    $("#checkInfoqut").hide();

    // 质检状态
    if(checkStatus){

        // 质检表单填写
        updateShowCheckStatistic();
        if(operationCase == 32){
            if(frozen()){
                // enabledCoverAndLeaveIpt(true);
                enabledCoverAndLeaveIpt1(true);
            }else{
                // enabledCoverAndLeaveIpt(false);
                enabledCoverAndLeaveIpt1(false);
            }
            updateShowStatistic();
            checkSave();
        }else{
            // 如果是质检状态则，需要禁用遮盖、离开勾选框
            // enabledCoverAndLeaveIpt(true);
            enabledCoverAndLeaveIpt1(true);
        }

    }
    // 标注状态
    else{

        if(frozen()){
            // enabledCoverAndLeaveIpt(true);
            enabledCoverAndLeaveIpt1(true);
        }else{
            // enabledCoverAndLeaveIpt(false);
            enabledCoverAndLeaveIpt1(false);
        }

        updateShowStatistic();

        // 标注状态下，错误类型、错误文本、漏标文本禁止输入
        disabledErrorUI();
    }

    var images = getEditedDataImages();
    if (images != undefined) {
        var imgDom = images[pos - 1];
        if (imgDom === undefined) {
            return;
        }
        
        if(lastpos != pos){
            setLeakEmpty();
        }

        // 显示不合格的标志
        if (pos >= 1 && !imgDom.effective) {
            $("#leaktag").val(imgDom.leak_tag);
            $("#errortag").val(imgDom.error_tag);
            $("#errorcontenttxt").val(imgDom.error_content);
            document.getElementById("noqualityBtn").style.color = "white";
            document.getElementById("noqualityBtn").style.backgroundImage = "url(http://crowd-cdn.datatang.com/images//u61.png)";
            document.getElementById("qualityBtn").style.color = "black";
            document.getElementById("qualityBtn").style.backgroundImage = "url(http://crowd-cdn.datatang.com/images//u59.png)";
            $("#checkStatictis").show();
            if(!checkStatus){
                setMarkAfterCheck();
            }
        }

        // 显示合格的标志
        if (imgDom.effective && imgDom.status == "checked") {
            document.getElementById("qualityBtn").style.color = "white";
            document.getElementById("qualityBtn").style.backgroundImage = "url(http://crowd-cdn.datatang.com/images//u61.png)";
            document.getElementById("noqualityBtn").style.color = "black";
            document.getElementById("noqualityBtn").style.backgroundImage = "url(http://crowd-cdn.datatang.com/images//u59.png)";
            $("#checkStatictis").show();
            // $("#leaktag").val(0);
            // $("#errortag").val(0);
            // $("#errorcontenttxt").val("");
            if(!checkStatus){
                setMarkAfterCheck();
            }
        }
    }
    // 不合格帧列表渲染
    renderUnqualifiedAnno();
}

function setMarkAfterCheck(){
    var suffix = "" ;
    if(currentEditedType == "left"){
        suffix = "L";
    }else if(currentEditedType == "right"){
        suffix = "R";
    }
    var checkNum1 = data.statictis["checkNum" + suffix],
        leaktagNum1 = data.statictis["leaktagNum" + suffix],
        boxNum1 = data.statictis["boxNum" + suffix],
        errorNum1 = data.statictis["errortagNum" + suffix];

    $("#checkNum").html(checkNum1);
    $("#leaktagNum").html(leaktagNum1);
    $("#boxNum").html(boxNum1);
    $("#errorNum").html(errorNum1);
}
/**
 * 清空漏标框数、说明和错表框数
 */
function setLeakEmpty(){
    $("#leaktag").val(0);
    $("#errortag").val(0);
    $("#errorcontenttxt").val("");
}

// ********************************************************************************************************************************************


function updateShowStatistic(){
    var tagedFrameNum = getTagedShapeCount(),
        totalFrameNum = getAllShapesCount(),
        modifyFrameNum = getModifyStatusShapeCount();

    if(operationCase == 32 || operationCase == 4){
        $("#tagedFrameNum11").html(tagedFrameNum);
        $("#totalFrameNum1").html(totalFrameNum);
        $("#tagedFrameNum111").html(modifyFrameNum);
    }else{
        $("#tagedFrameNum").html(tagedFrameNum);
        $("#totalFrameNum").html(totalFrameNum);
        $("#tagedFrameNum1").html(modifyFrameNum);
    }

    if(!data._tagedStatictis){
        data._tagedStatictis = {} ;
    }

    switch(currentEditedType){
        case "center":
            data._tagedStatictis["tagedFrameNumC"] = tagedFrameNum ;
            data._tagedStatictis["totalFrameNumC"] = totalFrameNum ;
            data._tagedStatictis["modifyFrameNumC"] = modifyFrameNum ;
            break ;
        case "left":
            data._tagedStatictis["tagedFrameNumL"] = tagedFrameNum ;
            data._tagedStatictis["totalFrameNumL"] = totalFrameNum ;
            data._tagedStatictis["modifyFrameNumL"] = modifyFrameNum ;
            break ;
        case "right":
            data._tagedStatictis["tagedFrameNumR"] = tagedFrameNum ;
            data._tagedStatictis["totalFrameNumR"] = totalFrameNum ;
            data._tagedStatictis["modifyFrameNumR"] = modifyFrameNum ;
            break ;
    }
}

function getTagedShapeCount(){
    var editShapes = getEditedShapes();
    return editShapes.length ;
}

/**
 * 获取修改的框数
 * @returns {number}
 */
function getModifyStatusShapeCount(){
    var editShapes = getEditedShapes();
    var i = editShapes.length - 1,
        shape = null,count = 0,modifyCache = {};

    for(;i >= 0 ;i --){
        shape = editShapes[i];
        //记录轨迹中的变化
        var ts = shape.traces;
        for(var ii = 0,iilen = ts.length ;ii < iilen ; ii ++){
            var cover1 = getCoverFromShape(shape,ts[ii].pos);
            if(ts[ii].mdfs==1 && cover1.leave == 0){
            // if(ts[ii].mdfs==1){
                count++;
            }
        }
        //记录右侧选择的变化
        var cover=shape.covers;
        if(cover.length>0){
            for (var cc=0;cc<cover.length;cc++){
                //如果不等于新增标注框时才统计
                if(cover[cc].pos!=shape.pos) {

                    //如果同时移动窗口和右边菜单只记录一次修改记录
                    var ismdfs=true;
                    var ts1 = shape.traces;
                    for(var ii = 0,iilen = ts1.length ;ii < iilen ; ii ++){
                        if(ts1[ii].pos==cover[cc].pos&&ts1[ii].mdfs==1){
                            ismdfs=false;
                            break;
                        }
                    }
                    if(ismdfs) {
                        //如果遮挡部分不等于，则修改数加一
                        if(cc==0) {
                            if (cover[cc].cover != 0 || cover[cc].truncated != 0) {
                                count++;
                            }
                        }else{
                            if ((cover[cc-1].cover != cover[cc].cover) || (cover[cc - 1].truncated != cover[cc].truncated)) {
                                if(cover[cc].leave!=1) {
                                    count++;
                                }
                            }
                        }
                        //如果修改部分
                        /*if(cover[cc].truncated!=0){
                         count++;
                         }*/
                        /*if (cc + 1 < cover.length) {

                            //第一次选择的是1第二次选择2 也是变更，则增加修改记录
                            if ((cover[cc].cover != cover[cc + 1].cover) || (cover[cc + 1].truncated != cover[cc].truncated)) {
                                //如果下一帧不是离开的情况
                                if(cover[cc + 1].leave!=1) {
                                    //如果同时移动窗口和右边菜单只记录一次修改记录
                                    var ismdfs1 = true;
                                    var ts2 = shape.traces;
                                    for (var ii = 0, iilen = ts2.length; ii < iilen; ii++) {
                                        if (ts2[ii].pos == cover[cc + 1].pos && ts2[ii].mdfs == 1) {
                                            ismdfs = false;
                                            break;
                                        }
                                    }
                                    if (ismdfs) {
                                        count++;
                                    }
                                }
                                //如果修改部分第一次和第二次不想等，则也是修改
                                /!*if(cover[cc+1].truncated!=cover[cc].truncated){
                                 count++;
                                 }*!/
                                cc++;
                            }
                        }*/
                    }
                }
            }
        }
    }

    return count ;
}

function getAllShapesCount(){
    var editShapes = getEditedShapes();
    var frames = data.images.length ;
    var shape,count = 0;

    for(var i = 0,len = editShapes.length ;i < len ; i ++){
        shape = editShapes[i];
        // shape总共剩余帧数
        var shapeFrames = frames - (shape.pos - 1);
        var covers = shape.covers || [],
            coverStart = null,coverEnd = null,leaveLen = 0;

        for(var c = 0,clen = covers.length ; c < clen ; c ++){
            coverStart = covers[c] ;
            if(coverStart.leave === 1){
                if(c + 1 < clen){
                    coverEnd = covers[c + 1] ;
                    leaveLen += coverEnd.pos - coverStart.pos;
                }else{
                    if(shapeFrames - coverStart.pos < 0){
                        leaveLen +=frames-coverStart.pos+1;
                    }else{
                        leaveLen += shapeFrames - coverStart.pos + shape.pos;
                    }
                }
            }
        }

        count += shapeFrames - leaveLen ;
    }
    if(count==0) {
        return 0;
    }else{
        return count;
    }
}
