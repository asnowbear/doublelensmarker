
//---------------------------------------------------------------
//
// 用于处理编辑区域canvas的绘制等事件的处理
//
//---------------------------------------------------------------

var rightClickShape = null ;
var lastpos = 1;
function setupCanvasEvent(id){

    // 普通质检不能绘制
    if(checkStatus && operationCase != 32){
        return ;
    }

    var dom = $("#"+id);

    // 图片mousedown
    dom.mousedown(function(e) {
        // 冻结
        if(frozen()){
            return ;
        }

        if(!$("#deletebtndiv").is(":hidden")){
            $("#deletebtndiv").hide();
            isShowBtn = false ;
        }

        mouseDown(e);
    });

    // 监控mouse move 事件并处理
    dom.mousemove(function(e) {
        // 冻结
        if(frozen()){
            return ;
        }

        mouseMove(e);
    });

    // 监控 mouse up 事件
    dom.mouseup(function(e) {
        // 冻结
        if(frozen()){
            return ;
        }

        mouseUp(e);
    });

    // 图片流右击函数处理
    dom.rightclick(function(e, left, top) {
        // 冻结
        if(frozen()){
            return ;
        }

        rightClick(e);
    });

}

/**
 * 解除dom的事件监听
 * @param id
 */
function removeCanvasEvent(id){
    $("#"+id).unbind();
}

/**
 * 全部移除监听
 */
function removeCanvasEvents(){
    removeCanvasEvent("can");
    removeCanvasEvent("canL");
    removeCanvasEvent("canR");
}

function adjustShapesForSwitch(){

    // 1.计算要调到侧边镜头的数据
    var sideShapes = [] ;
    switch(canvasFrom){
        case "center":
            sideShapes = cloneShapes(centerShapes);
            centerShapesCache = sideShapes ;
            break;
        case "left":
            sideShapes = cloneShapes(leftShapes);
            leftShapesCache = sideShapes;
            break ;
        case "right":
            sideShapes = cloneShapes(rightShapes);
            rightShapesCache = sideShapes;
            break ;
    }

    DEBUG && console.info("镜头切换，将中间镜头数据->缓存数据");

    adjustSideShapes(sideShapes);
}

/**
 * 切换CANVAS的事件监听
 * @param from
 */
function switchCanvasEvents(centerFrom){
    var id = "" ;

    switch(centerFrom){
        case "left":
            id="canL";
            break ;
        case "right":
            id="canR";
            break ;
        case "center":
            id="can";
            break;
    }

    // 切换时隐藏编辑按钮
    if(!$("#deletebtndiv").is(':hidden')){
        $("#deletebtndiv").hide();
    }

    updateCheckStatictis();// 更新质检的统计状态
    removeCanvasEvents();
    setupCanvasEvent(id);

    adjustShapesForSwitch();
    redraw();// 刷新画布，重绘图形
    resetDrawStatus();
}

/**
 * 切换编辑区域，则绘图重新开始
 */
function resetDrawStatus(){
    isEnabledEdit = true ;
    paint = false ;
    isShowBtn = false ;
    currentPos = -1;
}

function initCanvasEvent(value,maxValue,step,currentX) {

    // 监控键盘事件
    initKeysEventListener();

    $.fn.extend({
        "rightclick" : function(fn) {
            //tracePlay = false ;
            $(this).bind('contextmenu', function(e) {
                return false;
            });
            $(this).mouseup(function(e) {
                if (isEnabledEdit && 3 == e.which && !isShowBtn) {
                    paint = false;
                    fn(e, this.offsetLeft, this.offsetTop);
                }
            });
        }
    });

    setupCanvasEvent("can");

    switchCanvasEvents("center");
}

/**
 * 监控键盘操作
 */
function initKeysEventListener(){
   $(window).keydown(function(event) {

        // 监听A键，前一帧
        if (event.which == 65) {
            prev();
            event.preventDefault();
            return false;
        }
        //监听S键，后一帧
        else if (event.which == 83) {
            next();
            event.preventDefault();
            return false;
        }
        // 监听delete键，删除
        else if (event.which == 46) {

            if(checkStatus && operationCase != 32) return ;

            // 图形还没有绘制完毕
            if(!onShapeTypeSelected){
                return
            }

            if (currentPos != -1) {
                ddee(currentPos);
                isShowBtn = false;
            }
            return false;
        }
        // // 监听enter键，开始播放
        // else if(event.which == 13){
        //     action();
        //     event.preventDefault();
        //     return false;
        // }
        // 监听D键，跳转到上十帧
        else if(event.which == 68){
            prevTen();
            event.preventDefault();
            return false;
        }// 监听F键，跳转到下十帧
        else if(event.which == 70){
            nextTen();
            event.preventDefault();
            return false;
        }
        //监听<-方向键，移动选中的标注框
        else if(event.which == 37){
            keymoveshape(shape,event.which);
            event.preventDefault();
            return false;
        }
        //监听->方向键，移动选中的标注框
        else if(event.which == 39){
            keymoveshape(shape,event.which);
            event.preventDefault();
            return false;
        }
        //监听向上的方向键，当有标注框选中时移动该标注框
        else if(event.which == 38){
            keymoveshape(shape,event.which);
            event.preventDefault();
            return false;
        }
        //监听向下的方向键，当有标注框选中时移动该标注框
        else if(event.which == 40){
            keymoveshape(shape,event.which);
            event.preventDefault();
            return false;
        }
        //监听E键，显示所有的标注框
        else if(event.which == 69){
            setCurrentShapesDisplay(true);
            redraw();
            event.preventDefault();
            return false;
        }
        //监听W键，隐藏所以的标注框
        else if(event.which == 87){
            setCurrentShapesDisplay(false);
            redraw();
            event.preventDefault();
            return false;
        }
        //监听V键，显示或者隐藏文字
        else if(event.which == 86){
            ondisplayAllAnnoTextBtnClick();
            event.preventDefault();
            return false;
        }
        //监听空格键
        else if(event.which == 32){
            // replay();
            action();
            event.preventDefault();
            return false;
        }
        else {
            return true;
        }
   });
}

/**
 * 鼠标左键点击处理
 */
function rightClick(e) {
    tracePlay = false ;
    var x = e.offsetX;
    var y = e.offsetY;
    var cur = -1;
    var shapes = getEditedShapes();

    var imageId = editedCanvas.replace("can","image");
    var imageDom = $("#"+imageId);
    for (var i = shapes.length - 1; i >= 0; i--) {
        // 去掉当前隐藏的图形
        if(shapes[i].pos > pos){
            continue ;
        }

        var xmin = 0;
        var ymin = 0;
        var xmax = 0;
        var ymax = 0;

        if(shapes[i].x1 < shapes[i].x2){
            xmin = shapes[i].x1 ;
            xmax = shapes[i].x2;
        }else{
            xmin = shapes[i].x2 ;
            xmax = shapes[i].x1;
        }

        if(shapes[i].y1 < shapes[i].y2){
            ymin = shapes[i].y1 ;
            ymax = shapes[i].y2 ;
        }else{
            ymin = shapes[i].y2 ;
            ymax = shapes[i].y1 ;
        }

        if (x >= xmin && x <= xmax && y >= ymin && y <= ymax) {
            cur = i;
            break;
        }
    }

    if (cur != -1) {
        currentPos = cur;

        if(!validateShapeInCovers(shapes[cur],pos)){
            return ;
        }

        // 未出现的POS，则不被选中
        if(pos < shapes[cur].pos){
            return ;
        }

        // 如果隐藏则不被选中
        if(shapes[cur].display === false){
            return ;
        }

        shapes[cur].selected = true;
        redraw();

        var x = shapes[cur].x2 < shapes[cur].x1 ? shapes[cur].x2 : shapes[cur].x1;
        var y = shapes[cur].y2 < shapes[cur].y1 ? shapes[cur].y2 : shapes[cur].y1;
        var w = Math.abs(shapes[cur].x2 - shapes[cur].x1);
        //var h = Math.abs(shapes[cur].y2 - shapes[cur].y1);

        var left = (x + w + imageDom[0].offsetLeft+10 - 2) + "px";
        var top = (y + $('#imageshow')[0].offsetTop) + "px";

        $("#deletebtndiv").css({"display":"block","left":left,"top":top});

        isShowBtn = true;
        rightClickShape = shapes[cur];
    }
}

//判断当前帧的leave状态
function validateShapeInCovers(shape,pos){
    var covers=shape.covers || [];
    var flag = true;
    for(var i = covers.length - 1;i >=0;i--){
        if(pos >= covers[i].pos){
            if(covers[i].leave === 1){
                flag = false;
            }else if(covers[i].leave === 0){
                flag = true;
            }
            break;
        }
    }
    return flag;
}

//判断标注框的有效性（标注框的高度和宽度都大于50px时为有效值
function validateShape(shape){
    var w = Math.abs(shape.x1 - shape.x2);
    var h = Math.abs(shape.y1 - shape.y2);
    var height = $("#editDiv").children()[2].height;
    var width = $("#editDiv")[0].children[2].width;
    var naturalBoxWidth = w * data.naturalWidth / width;
    var naturalBoxHeight = h * data.naturalHeight / height;
    if(naturalBoxHeight > validateBoxValue){
        return true;
    }else{
        return false;
    }
}

function angleMoveXY(shape,xy,value){
    var sxy = shape[xy] ;
    shape[xy] = value ;

    var h = Math.abs(shape.y1 - shape.y2) ;
    var height = $("#editDiv").children()[2].height;
    var naturalBoxHeight = h * data.naturalHeight / height;

    // 判断当前框是否太小
    if( naturalBoxHeight <= validateBoxValue ){
        shape[xy] = sxy ;
    }
}

function mouseMove(e) {
    if (isEnabledEdit && paint) {//是不是按下了鼠标
        var canvasDom = $("#editDiv")[0].children[2] ;

        // 动态获取宽高
        var image_width = canvasDom.width;
        var image_height = canvasDom.height;

        if (currentPos == -1 || !isDrawPerson) {
            shape.x2 = e.offsetX;
            shape.y2 = e.offsetY;
            //redraw();
        } else {
            // 选中后的整体移动
            if (drawType == "move") {
                var w = Math.abs(shape.x2 - shape.x1);
                var h = Math.abs(shape.y2 - shape.y1);

                if (e.offsetX + downX >= 0 && e.offsetX + downX + w < image_width) {
                    if(shape.x1 < shape.x2){
                        shape.x1 = e.offsetX + downX;// x1的新点
                        shape.x2 = shape.x1 + w;// x2新点
                    }else{
                        shape.x2 = e.offsetX + downX;// x1的新点
                        shape.x1 = shape.x2 + w;// x2新点
                    }
                }
                if (e.offsetY + downY >= 0 && e.offsetY + downY + h < image_height) {
                    if(shape.y1 < shape.y2){
                        shape.y1 = e.offsetY + downY;
                        shape.y2 = shape.y1 + h;
                    }else{
                        shape.y2 = e.offsetY + downY;
                        shape.y1 = shape.y2 + h;
                    }
                }
            }
            // 四角四边移动
            else if (drawType == "angle1") {
                if(shape.x1 < shape.x2){
                    angleMoveXY(shape,"x1", e.offsetX);
                }else{
                    angleMoveXY(shape,"x2", e.offsetX);
                }

                if(shape.y1 < shape.y2){
                    angleMoveXY(shape,"y1", e.offsetY);
                }else{
                    angleMoveXY(shape,"y2", e.offsetY);
                }

            } else if (drawType == "angle2") {
                if(shape.x1 < shape.x2){
                    angleMoveXY(shape,"x2", e.offsetX);
                }else{
                    angleMoveXY(shape,"x1", e.offsetX);
                }

                if(shape.y1 < shape.y2){
                    angleMoveXY(shape,"y1", e.offsetY);
                }else{
                    angleMoveXY(shape,"y2", e.offsetY);
                }
            } else if (drawType == "angle3") {
                if(shape.x1 < shape.x2){
                    angleMoveXY(shape,"x2", e.offsetX);
                }else{
                    angleMoveXY(shape,"x1", e.offsetX);
                }

                if(shape.y1 < shape.y2){
                    angleMoveXY(shape,"y2", e.offsetY);
                }else{
                    angleMoveXY(shape,"y1", e.offsetY);
                }
            } else if (drawType == "angle4") {
                if(shape.x1 < shape.x2){
                    angleMoveXY(shape,"x1", e.offsetX);
                }else{
                    angleMoveXY(shape,"x2", e.offsetX);
                }

                if(shape.y1 < shape.y2){
                    angleMoveXY(shape,"y2", e.offsetY);
                }else{
                    angleMoveXY(shape,"y1", e.offsetY);
                }
            } else if (drawType == "top") {
                if(shape.y1 < shape.y2){
                    angleMoveXY(shape,"y1", e.offsetY);
                }else{
                    angleMoveXY(shape,"y2", e.offsetY);
                }
            } else if (drawType == "left") {
                if(shape.x1 < shape.x2){
                    angleMoveXY(shape,"x1", e.offsetX);
                }else{
                    angleMoveXY(shape,"x2", e.offsetX);
                }
            } else if (drawType == "right") {
                if(shape.x1 < shape.x2){
                    angleMoveXY(shape,"x2", e.offsetX);
                }else{
                    angleMoveXY(shape,"x1", e.offsetX);
                }
            } else if (drawType == "bottom") {
                if(shape.y1 < shape.y2){
                    angleMoveXY(shape,"y2", e.offsetY);
                }else{
                    angleMoveXY(shape,"y1", e.offsetY);
                }
            }
            //如果是质检之后修改则判断是否进行修改并改变status的状态
           modifyShapeStatus(imagesAndTypeMap,currentEditedType,pos);
            // 移动后记录轨迹
            //如果是新增的标注框，并且进行了修改则不记录为修改
            var trace;
            if(shape.pos==pos){
                trace = {
                    x1: shape.x1,
                    y1: shape.y1,
                    x2: shape.x2,
                    y2: shape.y2,
                    shapeid: shape.id,
                    pos: pos
                }
            }else {
                trace = {
                    x1: shape.x1,
                    y1: shape.y1,
                    x2: shape.x2,
                    y2: shape.y2,
                    shapeid: shape.id,
                    pos: pos,
                    //是佛修改0是未修改，1是已修改
                    mdfs: 1
                }
            }

            if(shape.traces.length == 0){
                shape.traces.push(trace);
            }else{
                var find = -1 ;
                var index = -1 ;
                for(var idx = 0;idx < shape.traces.length ; idx ++){
                    var at0 = shape.traces[idx];
                    if(!at0){
                        console.info("发现错误....");
                        continue;
                    }

                    // 如果回到该帧拖动改图形就覆盖本次轨迹
                    if(at0.pos == pos && at0.shapeid == shape.id){
                        shape.traces[idx] = trace ;
                        find = idx ;
                        break ;
                    }

                    // 找到插入的位置
                    if(at0.pos <= pos){
                        index = idx ;
                    }
                }

                // 新的轨迹
                if(find == -1){
                    shape.traces.splice(index + 1,0,trace);// 在index + 1的位置新增一个轨迹
                }
            }
            shapes[currentPos] = shape;
            //redraw();
        }
    }

    referenceLine.updateXY(e.offsetX, e.offsetY);
    lastpos = pos;
    redraw();
}

function mouseDown(e) {
    if (isEnabledEdit && !paint && !isShowBtn && e.which == 1) {
        var shapes=getEditedShapes();
        tracePlay = false ;

        pause();
        type = "";
        var x = e.offsetX ;
        var y = e.offsetY ;
        paint = true;

        // 开始绘制
        if (currentPos == -1) {
            isDrawPerson = true;
            shape = new Shape(x, y, x, y, 2, lineColor, type, pos);
            shapes.push(shape);
        }
        // 其他操作 点击选中等
        else {
            if (!shapes[currentPos].isSelected && (currentPos < shapes.length - 1 && shapes[currentPos].type == "person" && shapes[currentPos + 1].type != "head" && shapes[currentPos + 1].type != "maybe head")) {
                isDrawPerson = false;
                currentPos = currentPos + 1;
                shape = new Shape(x, y, x, y, 2, lineColor, type, pos);
                shapes.splice(currentPos, 0, shape);
            } else if (!shapes[currentPos].isSelected && currentPos == shapes.length - 1 ) {
                isDrawPerson = false;
                currentPos = currentPos + 1;
                shape = new Shape(x, y, x, y, 2, lineColor, type, pos);
                shapes.splice(currentPos, 0, shape);
            } else {
                // 计算点击的点离原点的距离
                downX = shape.x1 < shape.x2 ? shape.x1 - x : shape.x2 - x;
                downY = shape.y1 < shape.y2 ? shape.y1 - y : shape.y2 - y;

                shape = shapes[currentPos];

                if(isShapeInCoverAndLeave(shape)){
                    return ;
                }

                drawType = isInBorderPoint(x, y, shape);
                if (drawType == "new") {
                    clickShape(x, y);
                    if (currentPos != -1)
                        shapes[currentPos].isSelected = true;// 当前图形高亮
                    redraw();
                    paint = false;
                    document.getElementById("can").style.cursor = "default";
                } else {
                    if (drawType == "move")
                        document.getElementById("can").style.cursor = "move";
                    else if (drawType == "left" || drawType == "right")
                        document.getElementById("can").style.cursor = "w-resize";
                    else if (drawType == "top" || drawType == "bottom")
                        document.getElementById("can").style.cursor = "s-resize";
                    else if (drawType == "angle1" || drawType == "angle3")
                        document.getElementById("can").style.cursor = "se-resize";
                    else if (drawType == "angle2" || drawType == "angle4")
                        document.getElementById("can").style.cursor = "ne-resize";
                }
            }
        }

        if(!$("#deletebtndiv").is(":hidden") && currentPos !=-1){
            isShowBtn = false ;
            $("#deletebtndiv").hide();
            shapes[currentPos].isSelected = true;// 当前图形高亮
            redraw();
        }
    }
}

function mouseUp(e) {
    document.getElementById("can").style.cursor = "default";

    // 绘制完毕后，类型还没有选中的情况处理
    if(!onShapeTypeSelected){
        return
    }

    if (e.which == 1) {
        var shapes = getEditedShapes();
        var x = e.offsetX;
        var y = e.offsetY;
        if (isEnabledEdit && paint && currentPos == -1 && isDrawPerson && (Math.abs(shape.x2 - shape.x1) < 10 || Math.abs(shape.y2 - shape.y1) < 10)) {
            shapes.pop();
            paint = false;
            clickShape(x, y);
            if (currentPos != -1)
                shapes[currentPos].isSelected = true;
        } else if (isEnabledEdit && paint && currentPos != -1 && !isDrawPerson && (Math.abs(shape.x2 - shape.x1) < 10 || Math.abs(shape.y2 - shape.y1) < 10)) {
            shapes.splice(currentPos, 1);
            paint = false;
            t = currentPos - 1;
            clickShape(x, y);
            if (currentPos != -1) {
                if (currentPos != t) {
                    shapes[currentPos].isSelected = true;
                    shapes[t].isSelected = false;
                    isDrawPerson = true;
                } else {
                    isDrawPerson = true;
                    shapes[currentPos].isSelected = true;
                }
            } else {
                isDrawPerson = false;
                shapes[t].isSelected = false;
                currentPos = t;
            }
        } else if (isEnabledEdit && paint && currentPos != -1 && !isDrawPerson) {
            isShowBtn = true;
            btnEnabled = false;
            paint = false;
            var validate = validateShape(shape);
            if(!validate){
                var shapeindex=shapes.indexOf(shape);
                shapes.splice(shapeindex,1);
                alert("标注框的高必须大于25!");
                paint = false ;
                isShowBtn = false ;
                isEnabledEdit = true ;
                currentPos = -1 ;
            }else {
                // 记录首次轨迹
                var trace = {
                    x1: shape.x1,
                    y1: shape.y1,
                    x2: shape.x2,
                    y2: shape.y2,
                    shapeid: shape.id,
                    pos: shape.pos
                }
                shape.traces.push(trace);

                // 弹出类型选择框
                showTypeSelect(shape, "add");
            }
        } else if (isEnabledEdit && currentPos == -1 && paint) {
            var validate = validateShape(shape);
            var shapeindex = shapes.indexOf(shape);
            if (validate && shapeindex > -1) {
                isEdited = true;
                if (!isShowBtn) {
                    // 弹出类型选择框
                    showTypeSelect(shape, "add");

                    // 记录首次轨迹
                    var trace = {
                        x1: shape.x1,
                        y1: shape.y1,
                        x2: shape.x2,
                        y2: shape.y2,
                        shapeid: shape.id,
                        pos: shape.pos
                    }
                    shape.traces.push(trace);
                    if (currentPos == -1) {
                        currentPos = shapes.length - 1;
                    }
                    shapes[currentPos].selected = true;
                    isShowBtn = true;
                    btnEnabled = false;
                }
                paint = false;
            }else{
                alert("标注框的高必须大于25");
                shapes.splice(shapeindex,1);
                //btnEnabled = false;
                //paint = false;

                paint = false ;
                isShowBtn = false ;
                isEnabledEdit = true ;
            }
        } else {
            paint = false;
            var f = false;
            var m = -1;
            var go = false ;// 去掉type为空的情况（由于意外情况，没有来得急确定标记的类型，如果此时激发了mouseup事件，就回出现问题）
            for (var i = 0; i <= shapes.length - 1; i++) {
                if (shapes[i].isSelected) {
                    f = true;
                    m = i;
                    break;
                }
            }
            if (!f) {
                var c = -1;
                var delIndex=-1;
                // 循环查找type为空的shape
                for (var i = 0; i <= shapes.length - 1; i++) {
                    if (shapes[i].type == "") {
                        go = true;
                        delIndex=i;
                        break;
                    }
                }

                // 删除delIndex位置上 type 为空的shape(未绘制成功)
                if(delIndex != -1){
                    shapes.splice(delIndex, 1);
                }

                if(!go){
                    for (var i = 0; i <= shapes.length - 1; i++) {
                        if ((i < shapes.length - 1 && shapes[i].type == "person" && (shapes[i + 1].type != "head" && shapes[i + 1].type != "maybe head")) || (i == shapes.length - 1 && shapes[i].type == "person")) {
                            c = i;
                            break;
                        }
                    }

                    if (c != -1) {
                        currentPos = c;
                    } else {
                        currentPos = -1;
                    }
                }
            } else {
                currentPos = m;
            }
        }

        tracePlay = false ;
        redraw();
    }
}

function dblClick(e){
    var x = e.offsetX;
    var y = e.offsetY;

    var shapes = getEditedShapes();
    for(var idx = 0;idx < shapes.length ; idx ++){
        var s = shapes[idx];
        var inS = isIn(x, y, s);
        if(inS){
            showTypeSelect(s);
            poseModify = idx ;
        }
    }
}

/**
 * 右击删除按钮点击操作
 */
function deleteBtnClick() {
    ddee(currentPos);
    $("#deletebtndiv").hide();
    isShowBtn = false;
}

/**
 * 右击修改按钮点击操作
 * @param e
 */
function onModifyBtnClick(e){
    if(rightClickShape != null){
        $("#deletebtndiv").hide();
        showTypeSelect(rightClickShape,"modify");
    }
}

function ddee(cur) {
    var shapes = getEditedShapes();
    if (isEnabledEdit && cur >= 0 && cur <= shapes.length - 1) {

        shapes.splice(cur, 1);
        for (var i = 0; i < shapes.length; i++) {
            shapes[i].isSelected = false;
        }

        currentPos = -1;
        if(currentEditedType == "center"){
            if (!data.images[pos - 1].effective) {
                data.images[pos - 1].status = "modify";
                if (document.getElementById("annodiv" + pos)) {
                    document.getElementById("annodiv" + pos).className = "anno modify";
                }
            } else {
                data.images[pos - 1].status = "marked";
            }
        }else if(currentEditedType == "left"){
            if (!data.imagesL[pos - 1].effective) {
                data.imagesL[pos - 1].status = "modify";
                if (document.getElementById("annodiv" + pos)) {
                    document.getElementById("annodiv" + pos).className = "anno modify";
                }
            } else {
                data.imagesL[pos - 1].status = "marked";
            }
        }else if(currentEditedType == "right"){
            if (!data.imagesR[pos - 1].effective) {
                data.imagesR[pos - 1].status = "modify";
                if (document.getElementById("annodiv" + pos)) {
                    document.getElementById("annodiv" + pos).className = "anno modify";
                }
            } else {
                data.imagesR[pos - 1].status = "marked";
            }
        }

        // if (!data.images[pos - 1].effective) {
        //     data.images[pos - 1].status = "modify";
        //     if (document.getElementById("annodiv" + pos)) {
        //         document.getElementById("annodiv" + pos).className = "anno modify";
        //     }
        // } else {
        //     data.images[pos - 1].status = "marked";
        // }

        redraw();
        drawType = "new";
        save();
    }
}

/**
 * 判断冻结条件
 *
 * @returns {boolean}
 */
function frozen(){
    // 整体合格则启动冻结
    if(!frozenStatus){
        return false ;
    }

    if(pos < 1){
        return true ;
    }

    return true ;
}

/**
 * 根据按下的方向键移动标注框，每次移动1
 * @param shape
 * @param keycode
 */
function keymoveshape(shape,keycode){
  
    if(shape === null || shape === undefined){
      return ;
    }
    
    downX = 1;
    downY = 1;
    var w = Math.abs(shape.x2 - shape.x1);
    var h = Math.abs(shape.y2 - shape.y1);

    var canvasDom = $("#editDiv")[0].children[2] ;

    var image_width = canvasDom.width;
    var image_height = canvasDom.height;

    DEBUG && console.log("normal:" + image_width + "," + image_height);
    DEBUG && console.log("before:("+shape.x1 + "," + shape.x2 + "),(" + shape.y1 + "," + shape.y2 + ")");
    
    if(keycode == 37){
        //左移
        if(shape.x2 > shape.x1){
            if(shape.x1 -downX >=0){
                shape.x1 = shape.x1 - downX;
                shape.x2 = shape.x1 + w;
            }
        }else{
            if(shape.x2 -downX >=0){
                shape.x2 = shape.x2 - downX;
                shape.x1 = shape.x2 + w;
            }
        }

    }else if(keycode == 39){
        //右移
        if(shape.x2 > shape.x1){
            if(shape.x2 + downX < image_width){
                shape.x2 = shape.x2 + downX;
                shape.x1 = shape.x2 - w;
            }
        }else{
            if(shape.x1 + downX < image_width){
                shape.x1 = shape.x1 + downX;
                shape.x2 = shape.x1 - w;
            }
        }

    }else if(keycode == 38){
        //上移
        if(shape.y2 > shape.y1){
            if(shape.y1 -downY >=0){
                shape.y1 = shape.y1 - downY;
                shape.y2 = shape.y1 + h;
            }
        }else{
            if(shape.y2 -downY >=0){
                shape.y2 = shape.y2 - downY;
                shape.y1 = shape.y2 + h;
            }
        }

    }else if(keycode == 40){
        //下移
        if(shape.y2 > shape.y1){
            if(shape.y2 + downY < image_height){
                shape.y2 = shape.y2 + downY;
                shape.y1 = shape.y2 - h;
            }
        }else{
            if(shape.x1 + downY < image_height){
                shape.y1 = shape.y1 + downY;
                shape.y2 = shape.y1 - h;
            }
        }
    }
    
    DEBUG && console.log("after:("+shape.x1 + "," + shape.x2 + "),(" + shape.y1 + "," + shape.y2 + ")");
    
    //如果为质检后修改则判断是否进行修改并改变status的状态
    modifyShapeStatus(imagesAndTypeMap,currentEditedType,pos);

    var trace;
    if(shape.pos==pos){
        trace = {
            x1: shape.x1,
            y1: shape.y1,
            x2: shape.x2,
            y2: shape.y2,
            shapeid: shape.id,
            pos: pos
        };
    }else {
        trace = {
            x1: shape.x1,
            y1: shape.y1,
            x2: shape.x2,
            y2: shape.y2,
            shapeid: shape.id,
            pos: pos,
            //是佛修改0是未修改，1是已修改
            mdfs: 1
        };
    }

    if(shape.traces.length == 0){
        shape.traces.push(trace);
    }else{
        var find = -1 ;
        var index = -1 ;
        for(var idx = 0;idx < shape.traces.length ; idx ++){
            var at0 = shape.traces[idx];
            if(!at0){
                console.info("发现错误....");
                continue;
            }

            // 如果回到该帧拖动改图形就覆盖本次轨迹
            if(at0.pos == pos && at0.shapeid == shape.id){
                shape.traces[idx] = trace ;
                find = idx ;
                break ;
            }

            // 找到插入的位置
            if(at0.pos <= pos){
                index = idx ;
            }
        }

        // 新的轨迹
        if(find == -1){
            shape.traces.splice(index + 1,0,trace);// 在index + 1的位置新增一个轨迹
        }
    }
    shapes[currentPos] = shape;

    // referenceLine.updateXY(e.offsetX, e.offsetY);
    redraw();
}

//在质检退回之后再次修改是mdfs的状态是
function modifyShapeStatus(imagesAndTypeMap,currentEditedType,pos){
    var imagesone;
    if(currentEditedType=="center")
    {
        imagesone=imagesAndTypeMap.center;
    }else if(currentEditedType=="left"){
        imagesone=imagesAndTypeMap.left;
    }else if(currentEditedType=="right"){
        imagesone=imagesAndTypeMap.right;
    }
    if(imagesone!=null){
        for(var i=0;i<imagesone.length;i++){
            if((i+1)==pos&&imagesone[i].status=="checked"){
                //return 2;
                imagesAndTypeMap[currentEditedType][i].status="modify";
                break
            }
        }
    }
    return 1;
}