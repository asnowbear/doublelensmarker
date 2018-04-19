/**
 * 构建一个标注框对象
 * @param x1 左上角X
 * @param y1 左上角Y
 * @param x2 右下角X
 * @param y2 右下角Y
 * @param width 标注框宽
 * @param color 画笔颜色
 * @param type 标注框类型（person、maybe person、head）
 * @param pos 增加标注框时的帧
 * @param pose POSE属性
 * @constructor
 */
function Shape(x1, y1, x2, y2, width, color, type, pos,pose) {
    this.type = type;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.width = 1;
    this.color = color;
    this.isSelected = false;
    this.pos = pos;
    this.pose = [];
    this.traces = [];// 追踪数据
    this.covers = [];//
    this.qs = [];//质检信息
    this.id = uuid();
    this.num = -1;
    this.display = true ;// 是否显示/隐藏
    this.hide = false ;
    this.fontSize = 9 ;
}

/**
 * 图形绘制
 * @param context canvas上下文对象
 * @param n
 * @param poseText POSE值
 */
Shape.prototype.draw = function(context) {

    //if(!displayAll) {
    //    return ;
    //}

    // 是否显示图形
    if(!this.display){
        return ;
    }

    // 如果隐藏就不绘制
    if(this.hide){
        return ;
    }

    // 从绘制时的帧开始绘制
    if(pos < this.pos){
        return ;
    }

    // 获取覆盖状态值
    var cover = findCurrentCover(this);

    // 离开选项，则不绘制图像
    if(cover.leave == 1){
        return ;
    }

    // 更新坐标，得到轨迹坐标
    this.updateCoordinateForTracking();

    // 获取绘制的左上角坐标值
    var x = this.x2 < this.x1 ? this.x2 : this.x1;
    var y = this.y2 < this.y1 ? this.y2 : this.y1;
    var w = Math.abs(this.x2 - this.x1);
    var h = Math.abs(this.y2 - this.y1);

    var n = this.num ;
    var text = getAnnoText(this.type);

    // 绘制标记图形
    context.save();
    context.translate(0.5,0.5);

    // 覆盖选项，则绘制虚线
    if(cover.cover == 1||cover.cover == 2){
        context.setLineDash([5,2]);
    }

    context.lineWidth = this.width;
    context.strokeStyle = this.color;
    context.strokeRect(x, y, w, h);
    context.restore();

    // 如果不显示标注文本
    if(displayAllAnnoText){
        if (this.type != "") {
            // 文本框宽度
            var roudeWidth = 107;

            // 汽车，行人标注框的宽
            if(this.type == "car" || this.type == "psn"){
                roudeWidth = 70 ;
            }

            // 绘制标注背影框
            context.save();
            context.fillStyle = "#ffffff";
            context.globalAlpha = 0.2;
            drawRoundRect(context, x + 2, y + 2, roudeWidth, 20, 4);
            context.restore();

            // 绘制标注内容
            context.save();
            context.fillStyle = "red";
            context.font = "7pt Verdana";
            var metrics = context.measureText( text + "_" + n);
            context.fillText(text + "_" + n, x + Math.round((roudeWidth - metrics.width) / 2) + 2, y + 17);
            context.restore();
        }
    }

    // 选中后高亮
    if (this.isSelected) {
        context.save();
        context.fillStyle = "white";
        context.fillRect(x - 3, y - 3, 5, 5);
        context.fillRect(x + w / 2 - 3, y - 3, 5, 5);
        context.fillRect(x + w - 3, y - 3, 5, 5);
        context.fillRect(x - 3, y + h / 2 - 3, 5, 5);
        context.fillRect(x - 3, y + h - 3, 5, 5);
        context.fillRect(x + w - 3, y + h / 2 - 3, 5, 5);
        context.fillRect(x + w - 3, y + h - 3, 5, 5);
        context.fillRect(x + w / 2 - 3, y + h - 3, 5, 5);
        context.restore();
    }
};

function drawCoordinateText(own,context){
    context.save();

    context.fillStyle = "red";
    context.font = "5pt Verdana";
    var text = precision(own.x1) + "-" + precision(own.y1) ;
    context.fillText(text,own.x1 - 90,own.y1 - 5);

    text = precision(own.x2) + "-" + precision(own.y2) ;
    context.fillText(text,own.x2 - 90,own.y2 + 10);

    context.restore() ;
}

/**
 * 根据pos计算当前图形的位置（左上角点和右下角点）
 * 算法（x为例）：
 * 找到在x值最小处的trace对象，计算trace的pos和当前pos的差dx，然后trace的x+dx*偏移量
 * @param x
 * @param trace1
 * @param trace2
 * @param offset
 * @returns {number}
 */
Shape.prototype.updateCoordinate = function(x,trace1,trace2,offset){
    var anchorPos = 0,forward = 0;
    if(trace1[x] < trace2[x] ){
        forward = trace1[x] ;
        anchorPos = trace1.pos ;
    }else{
        forward = trace2[x] ;
        anchorPos = trace2.pos ;
    }
    var step = Math.abs(pos - anchorPos) ;
    return forward + (offset * step) ;
}

/**
 * 根据POS轨迹数据偏移图形坐标
 */
Shape.prototype.updateCoordinateForTracking = function(){

    // 无轨迹播放
    if(this.traces.length <= 1){
        return ;
    }

    // 是否启动轨迹播放
    if(!tracePlay){
        return ;
    }

    var findPos = false ;
    // 找到轨迹区间
    var trace2 = null ;
    var trace1 = null ;
    for(var idx = 0;idx < this.traces.length ; idx ++){
        trace2 = this.traces[idx];
        if(pos < trace2.pos){
            if(idx - 1 >= 0){
                trace1 = this.traces[idx - 1] ;
            }

            break ;
        }

        if(pos == trace2.pos){
            findPos = true ;
            break ;
        }
    }

    if(findPos){
        this.x1 = trace2.x1 ;
        this.y1 = trace2.y1 ;
        this.x2 = trace2.x2 ;
        this.y2 = trace2.y2 ;
        return ;
    }

    if(trace1 == null || trace2 == null){
        return ;
    }

    // 根据两个轨迹对象，计算坐标的偏移量
    var offset_y1 = Math.abs(trace2.y1 - trace1.y1) / Math.abs(trace2.pos - trace1.pos);
    var offset_x1 = Math.abs(trace2.x1 - trace1.x1) / Math.abs(trace2.pos - trace1.pos);
    var offset_x2 = Math.abs(trace2.x2 - trace1.x2) / Math.abs(trace2.pos - trace1.pos);
    var offset_y2 = Math.abs(trace2.y2 - trace1.y2) / Math.abs(trace2.pos - trace1.pos);

    // 根据pos计算当前图形的位置（左上角点和右下角点）
    this.x1 = this.updateCoordinate("x1",trace1,trace2,offset_x1);
    this.y1 = this.updateCoordinate("y1",trace1,trace2,offset_y1);
    this.x2 = this.updateCoordinate("x2",trace1,trace2,offset_x2);
    this.y2 = this.updateCoordinate("y2",trace1,trace2,offset_y2);
}

/**
 * 克隆shape对象
 * @returns {*} 返回克隆对象
 */
Shape.prototype.clone = function(){
    var shape = new Shape(this.x1, this.y1, this.x2, this.y2,
                          this.width, this.color, this.type, this.pos);

    shape.isSelected = this.isSelected ;
    shape.num = this.num ;
    shape.display = this.display ;
    shape.fontSize = this.fontSize ;
    shape.hide = this.hide ;
    shape.type = this.type ;

    var ii = 0 ;
    var len = this.covers.length ;
    for(;ii < len ; ii ++){
        var cover = {
            cover : this.covers[ii].cover || 0,
            leave : this.covers[ii].leave || 0,
            pos : this.covers[ii].pos ,
            truncated : this.covers[ii].truncated || 0
        }

        shape.covers.push(cover) ;
    }

    ii = 0;
    len = this.traces.length ;
    for(;ii < len ; ii ++){
        var trace = {
            pos : this.traces[ii].pos ,
            shapeid : this.traces[ii].shapeid,
            x1 : this.traces[ii].x1,
            x2 : this.traces[ii].x2,
            y1 : this.traces[ii].y1,
            y2 : this.traces[ii].y2,
        }

        shape.traces.push(trace) ;
    }

    return shape ;
}

/**
 * 绘制矩形框
 * @param context
 */
function drawRoundRect(context, x, y, w, h, r) {
    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + w - r, y);
    context.arc(x + w - r, y + r, r, 3 * Math.PI / 2, 2 * Math.PI, false);
    context.lineTo(x + w, y + h - r);
    context.arc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
    context.lineTo(x + r, y + h);
    context.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
    context.lineTo(x, y + r);
    context.arc(x + r, y + r, r, Math.PI, 3 * Math.PI / 2, false);
    context.closePath();
    context.fill();
}


function getAnnoText(type){
    var text = "" ;
    switch (type){
        case "psn" :
            text = "行人";
            break ;
        case "psd" :
            text = "坐着的人";
            break ;
        case "car":
            text = "汽车";
            break ;
        case "carb":
            text = "厢型车子";
            break ;
        case "pedal":
            text = "骑脚踏板的人";
            break;
        case "mtc":
            text = "骑摩托的人";
            break ;
        case "donc":
            text = "Don't care";
            break ;
        default:
            break ;
    }

    return text ;
}


ShapeType = {

    CAR : "car",

    CARB : "carb",

    PERSON : "psn",

    PERSONDOWN:"psd",

    PEDAL : "pedal",

    MTC : "mtc",

    DONC :"donc"
}