
/**
 * 从data中提取数据到centerShapes、leftShapes、rightShapes
 * 对象中
 */
function initTraceAndCoverInfoFromData(){

    DEBUG && console.info("开始转换数据，原图->中间镜头标注(左中右)");

    initTraceAndCoverInfoFromDataInner(data.images,centerShapes,"center");
    initTraceAndCoverInfoFromDataInner(data.imagesL,leftShapes,"left");

    DEBUG && console.info("结束转换数据");

    initSideShapesCache();
}

function initSideShapesCache(){

    DEBUG && console.info("开始转换缓存数据，中间镜头->边镜头(左右)");

    leftShapesCache = cloneShapes(leftShapes);
    // rightShapesCache = cloneShapes(rightShapes);

    adjustSideShapes(leftShapesCache);
    // adjustSideShapes(rightShapesCache);

    DEBUG && console.info("结束转换数据，边镜头绘制缓存数据");
}

/**
 * 初始化trace轨迹和cover信息
 */
function initTraceAndCoverInfoFromDataInner(images,shapes,ctype){
    for(var i= 0;i < images.length;i++){
        // if(images[i].label === undefined) {
        //     images[i].label = {}
        // }

        (!images[i].label) && (images[i].label = {})

        var label = images[i].label;
        var indexPos = i + 1 ;

        (!label.PED) && (label.PED = []);
        (!label.Car) && (label.Car = []);
        (!label.Cyclist) && (label.Cyclist = []);
        (!label.Motorcycle_rider) && (label.Motorcycle_rider = []);
        (!label.PS) && (label.PS = []);
        (!label.VAN) && (label.VAN = []);
        (!label.dontcare) && (label.dontcare = []);

        initTraceAndCoverInfoFromDataByType("psn",label.PED,indexPos,shapes,ctype);
        initTraceAndCoverInfoFromDataByType("car",label.Car,indexPos,shapes,ctype);
        initTraceAndCoverInfoFromDataByType("pedal",label.Cyclist,indexPos,shapes,ctype);
        initTraceAndCoverInfoFromDataByType("mtc",label.Motorcycle_rider,indexPos,shapes,ctype);
        initTraceAndCoverInfoFromDataByType("psd",label.PS,indexPos,shapes,ctype);
        initTraceAndCoverInfoFromDataByType("carb",label.VAN,indexPos,shapes,ctype);
        initTraceAndCoverInfoFromDataByType("donc",label.dontcare,indexPos,shapes,ctype);
    }
}

function inShpes(num,type,shapes){
    for(var i = 0;i < shapes.length ; i ++){
        if(shapes[i].num === num && shapes[i].type === type){
            return shapes[i] ;
        }
    }

    return null;
}

function initTraceAndCoverInfoFromDataByType(type,persons,indexPos,shapes,ctype){
    // person处理
    if(persons.length != 0) {
        for (var pi = 0; pi < persons.length; pi++) {
            var per = null;
            var sp = null;

            per = persons[pi];
            // 从原图转成标准图的坐标
            per = coverSoucretoStand(per,ctype);

            sp = inShpes(per.num,type,shapes) ;

            if(!sp) {
                sp = new Shape(per.x, per.y, per.x + per.w, per.y + per.h, 2, lineColor, type, indexPos);
                sp.num = per.num ;
                shapes.push(sp);
            }

            if (per.trace == "1") {
                var trace
                if(per.mdfs != null && per.mdfs == 1){
                    trace = {
                        x1: per.x,
                        y1: per.y,
                        x2: per.x + per.w,
                        y2: per.y + per.h,
                        shapeid: sp.id,
                        pos: indexPos,
                        mdfs:1
                    }
                }else {
                    trace = {
                        x1: per.x,
                        y1: per.y,
                        x2: per.x + per.w,
                        y2: per.y + per.h,
                        shapeid: sp.id,
                        pos: indexPos
                    }
                }

                if(canPush(sp.traces,trace)){
                    sp.traces.push(trace);
                }
            }

            // person的cover信息
            var cover = {
                cover: per.cover,
                leave: per.leave,
                truncated:per.truncated,
                pos: indexPos
            }

            if (sp.covers.length == 0) {
                sp.covers.push(cover);
            } else {
                var lastC = sp.covers[sp.covers.length - 1];
                if (lastC.leave != cover.leave || lastC.cover != cover.cover||lastC.truncated != cover.truncated) {
                    sp.covers.push(cover);
                }
            }

            //初始化单框质检信息
            if(per.iq != undefined){
                var qs={
                    iq: per.iq,
                    et: per.et,
                    pos: indexPos
                };

                sp.qs.push(qs);
            }
        }
    }
}

function canPush(traces,trace){
    for(var i = 0;i < traces.length ; i ++){
        if(traces[i].pos === trace.pos){
            return false ;
        }
    }

    return true ;
}

/**
 * 从原图坐标转换成标准坐标
 * @param per
 */
function coverSoucretoStand(per,type){
    var centerCanvasWidth = layoutWH.centerWidth,
        centerCanvasHeight = layoutWH.centerHeight;

    if(per.x1.toString().indexOf("e-") > -1){
        per.x1 = 0 ;
    }

    if(per.y1.toString().indexOf("e-") > -1){
        per.y1 = 0 ;
    }

    if(per.x2.toString().indexOf("e-") > -1){
        per.x2 = 0 ;
    }

    if(per.y2.toString().indexOf("e-") > -1){
        per.y2 = 0 ;
    }

    // 统一转换成中间镜头标注数据
    var rateW = centerCanvasWidth / data.naturalWidth,
        rateH = centerCanvasHeight / data.naturalHeight;

    DEBUG && console.info("rate:["+centerCanvasWidth+"/"+data.naturalWidth+"]="+rateW+",["+centerCanvasHeight+"/"+data.naturalHeight+"]="+rateH);

    per.x1 = per.x1 * rateW;
    per.x2 = per.x2 * rateW;
    per.y1 = per.y1 * rateH;
    per.y2 = per.y2 * rateH;

    per.x = per.x2 < per.x1 ? per.x2 : per.x1;
    per.y = per.y2 < per.y1 ? per.y2 : per.y1;
    per.w = Math.abs(per.x2 - per.x1);
    per.h = Math.abs(per.y2 - per.y1);

    return per;
}


