


function isIn(x, y, shape) {
    var x1 = shape.x2 < shape.x1 ? shape.x2 : shape.x1;
    var y1 = shape.y2 < shape.y1 ? shape.y2 : shape.y1;
    var x2 = shape.x2 > shape.x1 ? shape.x2 : shape.x1;
    var y2 = shape.y2 > shape.y1 ? shape.y2 : shape.y1;
    var f = false;
    if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
        f = true;
    }
    return f;
}

function isInBorderPoint(x, y, shape) {
    var drawType = "new";
    var x1 = shape.x2 < shape.x1 ? shape.x2 : shape.x1;
    var y1 = shape.y2 < shape.y1 ? shape.y2 : shape.y1;
    var x2 = shape.x2 > shape.x1 ? shape.x2 : shape.x1;
    var y2 = shape.y2 > shape.y1 ? shape.y2 : shape.y1;
    var w = Math.abs(x2 - x1);
    var h = Math.abs(y2 - y1);
    if (x >= x1 + 4 && x <= x2 - 4 && y >= y1 + 4 && y <= y2 - 4) {
        drawType = "move"
    } else if (x >= x1 - 4 && x <= x1 + 4 && y >= y1 - 4 && y <= y1 + 4) {
        drawType = "angle1"
    } else if (x >= x2 - 4 && x <= x2 + 4 && y >= y1 - 4 && y <= y1 + 4) {
        drawType = "angle2"
    } else if (x >= x2 - 4 && x <= x2 + 4 && y >= y2 - 4 && y <= y2 + 4) {
        drawType = "angle3"
    } else if (x >= x1 - 4 && x <= x1 + 4 && y >= y2 - 4 && y <= y2 + 4) {
        drawType = "angle4"
    } else if (x >= x1 + w / 2 - 4 && x <= x1 + w / 2 + 4 && y >= y1 - 4 && y <= y1 + 4) {
        drawType = "top"
    } else if (x >= x2 - 4 && x <= x2 + 4 && y >= y1 + h / 2 - 4 && y <= y1 + h / 2 + 4) {
        drawType = "right"
    } else if (x >= x1 + w / 2 - 4 && x <= x1 + w / 2 + 4 && y >= y2 - 4 && y <= y2 + 4) {
        drawType = "bottom"
    } else if (x >= x1 - 4 && x <= x1 + 4 && y >= y1 + h / 2 - 4 && y <= y1 + h / 2 + 4) {
        drawType = "left"
    }

    return drawType;
}

function getPersonNumFromShapes(type,shapes){
    if(type == "" || type == undefined){
        return 0;
    }

    if(!isArray(shapes) || shapes.length == 0 ){
        return 0;
    }

    var num = 0,idx = shapes.length - 1,shape = null;
    for(;idx >= 0 ;idx--){
        shape = shapes[idx];
        if(shape.type == type){
            num ++ ;
        }
    }

    return num ;
}

function isArray(object){
    return object && typeof object==='object' &&
        Array == object.constructor;
}

function getShape(type,index,shapes){
    var num = 0;
    for(var idx = 0;idx < shapes.length ; idx ++){
        var s = shapes[idx];
        if(s.type == type){
            if(num == index){
                return s ;
            }

            num ++
        }
    }

    return null ;
}


function getShapeById(shapeid){
    var shapes = getEditedShapes();

    for(var i = 0;i < shapes.length ;i ++){
        if(shapes[i].id == shapeid){
            return shapes[i] ;
        }
    }

    return null ;
}

/**
 * 计算点击的点是否落在shape中
 * @param x
 * @param y
 */
function clickShape(x, y) {
    drawType = "new";
    var shapes = getEditedShapes();
    for (var i = 0; i < shapes.length; i++) {
        shapes[i].isSelected = false;
    }
    currentPos = -1;
    for (var i = shapes.length - 1; i >= 0; i--) {
        if(!shapes[i].display){
            continue ;
        }

        // 去掉当前隐藏的图形
        if(shapes[i].pos > pos){
            continue ;
        }

        // 去掉离开的情况
        if(isShapeInCoverAndLeave(shapes[i])){
            continue ;
        }

        if (isIn(x, y, shapes[i])) {
            currentPos = i;
            shape = shapes[i];
            break;
        }
    }
}

function highlightShape(shapeId){
    var shapes = getEditedShapes(),shape;
    var i = shapes.length - 1 ;
    for(;i >= 0 ;i --){
        shape = shapes[i];
        if(shape.id === shapeId){
            shape.color = highlightLineColor ;
        }else{
            shape.color = lineColor ;
        }
    }

    alwaysRedrawShapes();
}

function precision(num){
    if(isNaN(num)){
        return 0;
    }
    num = Number(num);
    if(isInteger(num)){
        return num ;
    }

    if(num.toString().indexOf(".") < 0 ){
        console.info("testsd");
    }

    if(num.toString().split(".")[1].length <= PRECISION){
        return num ;
    }

    num = num.toFixed(PRECISION) ;
    if(isInteger(num)){
        return parseInt(num) ;
    }

    return parseFloat(num) ;
}

function isInteger(obj) {
    return obj % 1 === 0 ;
}

/**
 * 根据宽高比率调整shapes中的图形
 * @param shapes
 * @param rateW
 * @param rateH
 */
function adjustSideShapes(shapes){
    var centerCanvasWidth = $("#editDiv").children()[2].width,
        centerCanvasHeight = $("#editDiv").children()[2].height,
        sideCanvasWidth = $("#imageLeftDiv").children()[2].width,
        sideCanvasHeight = $("#imageLeftDiv").children()[2].height;

    var sideRateW = sideCanvasWidth / centerCanvasWidth,
        sideRateH = sideCanvasHeight / centerCanvasHeight;

    var shape = null,
        i = shapes.length - 1,traces = null,
        trace = null;

    // 转换shape和trace的坐标
    for(;i >= 0 ;i --){
        shape = shapes[i];
        shape.x1 = shape.x1 * sideRateW ;
        shape.x2 = shape.x2 * sideRateW ;
        shape.y1 = shape.y1 * sideRateH ;
        shape.y2 = shape.y2 * sideRateH ;

        traces = shape.traces;
        for(var j = 0;j < traces.length ; j ++){
            trace = traces[j];
            trace.x1 = trace.x1 * sideRateW ;
            trace.x2 = trace.x2 * sideRateW ;
            trace.y1 = trace.y1 * sideRateH ;
            trace.y2 = trace.y2 * sideRateH ;
        }
    }
}

/**
 * 克隆数组
 * @param shapes
 * @returns {Array}
 */
function cloneShapes(shapes){
    var clonedShapes = [] ;
    for(var ii = 0,len = shapes.length ; ii < len ; ii ++){
        clonedShapes.push(shapes[ii].clone());
    }

    return clonedShapes;
}

function deepClone(obj) {
    var objClone = {};
    loopObject(obj, function(value, key) {
        if (Array.isArray(value)) {
            objClone[key] = value.slice(0);
        } else if (typeof value === 'object' && value !== null) {
            objClone[key] = deepClone(value);
        } else {
            objClone[key] = value;
        }
    });
    return objClone;
};

function loopObject(loopable,callback){
    var keys = Object.keys(loopable);
    var len = keys.length;
    for (i = 0; i < len; i++) {
        callback.call(self, loopable[keys[i]], keys[i]);
    }
}



