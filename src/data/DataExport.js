
var canCollect = true ;

function setDataImageInfoNone(images){
    var i = images.length - 1,label = null;
    for(;i >=0 ; i --){
        label = images[i].label;
        label.PED = [];
        label.PS=[];
        label.Car = [];
        label.VAN=[];
        label.Cyclist = [];
        label.Motorcycle_rider = [];
        label.dontcare=[];
    }
}

function beforeCollectionAllData(){
    setDataImageInfoNone(data.images);
    setDataImageInfoNone(data.imagesL);
    setDataImageInfoNone(data.imagesR);

    canCollect = true ;
}

function collectionAllData(){
    var images1 = data.images,
        images2 = data.imagesL,
        images3 = data.imagesR;
    beforeCollectionAllData();

    DEBUG && console.info("提交：将所有中镜头数据->原图数据");

    var centerCanvasWidth = $("#editDiv").children()[2].width,
        centerCanvasHeight = $("#editDiv").children()[2].height

    if(layoutWH.centerWidth !== centerCanvasWidth ||
       layoutWH.centerHeight  !== centerCanvasHeight){

        alert("无法执行保存，中镜头宽和高有变化！初始为["+layoutWH.centerWidth+","+layoutWH.centerHeight+"],现为["+centerCanvasWidth+","+centerCanvasHeight+"]");

        canCollect = false ;
        return false;
    }

    if(DEBUG){
        var rateWidth = data.naturalWidth / centerCanvasWidth,
            rateHeight = data.naturalHeight / centerCanvasHeight;
        
        console.info("rate:["+data.naturalWidth+"/"+centerCanvasWidth+"]="+rateWidth+",["+data.naturalHeight+"/"+centerCanvasHeight+"]="+rateHeight);
    }

    if(operationCase == 32){
        collectionDataForQuality(data.images,images1,centerShapes,"center");
        collectionDataForQuality(data.imagesL,images2,leftShapes,"left");
        collectionDataForQuality(data.imagesR,images3,rightShapes,"right")
    }else{
        collectionData(data.images,centerShapes,"center");
        collectionData(data.imagesL,leftShapes,"left");
        collectionData(data.imagesR,rightShapes,"right")
    }

    DEBUG && console.info("结束转换，完成本次标注！");
}

/**
 * 生成保存数据
 */
function collectionData(images,shapes,lrcentertype){
    var len = images.length ;
  
    var rateWidth = data.naturalWidth / layoutWH.centerWidth,
        rateHeight = data.naturalHeight / layoutWH.centerHeight;

    // 遍历每一帧
    for(var pos = 0; pos < len ; pos ++){
        var img = images[pos] ;

        var indexPos = pos + 1 ;
        img.pos = indexPos ;

        // 均摊shape到每一帧上
        //var perPerson = null ;
        for(var i = 0 ;i < shapes.length ; i ++){
            var shape = shapes[i] ;
            if(indexPos < shape.pos){
                continue ;
            }

            // 计算坐标值
            var x1 = y1 = x2 = y2 = 0 ;

            var traces = shape.traces ;
            //是否是修改狀態
            var mdfss;
            if(traces.length > 1){
                // 找到轨迹区间
                var trace2 = null ;
                var trace1 = null ;
                for(var idx = 0;idx < traces.length ; idx ++){
                    trace2 = traces[idx];
                    if(indexPos < trace2.pos){
                        if(idx - 1 >= 0){
                            trace1 = traces[idx - 1] ;
                        }

                        break ;
                    }
                }

                if(trace1 === null){
                    trace1 = trace2 ;
                }

                // 计算移动的值
                var offset_y1 = Math.abs(trace2.y1 - trace1.y1) / Math.abs(trace2.pos - trace1.pos);
                var offset_x1 = Math.abs(trace2.x1 - trace1.x1) / Math.abs(trace2.pos - trace1.pos);
                var offset_x2 = Math.abs(trace2.x2 - trace1.x2) / Math.abs(trace2.pos - trace1.pos);
                var offset_y2 = Math.abs(trace2.y2 - trace1.y2) / Math.abs(trace2.pos - trace1.pos);

                offset_x1 = isNaN(offset_x1) ? 0 :  offset_x1;
                offset_y1 = isNaN(offset_y1) ? 0 :  offset_y1;
                offset_x2 = isNaN(offset_x2) ? 0 :  offset_x2;
                offset_y2 = isNaN(offset_y2) ? 0 :  offset_y2;

                // 都是从trace1开始
                x1 = trace1.x1 < trace2.x1 ?  trace1.x1 + offset_x1 * ( indexPos - trace1.pos ) :  trace1.x1 - offset_x1 * ( indexPos - trace1.pos ) ;
                y1 = trace1.y1 < trace2.y1 ?  trace1.y1 + offset_y1 * ( indexPos - trace1.pos ) :  trace1.y1 - offset_y1 * ( indexPos - trace1.pos ) ;
                x2 = trace1.x2 < trace2.x2 ?  trace1.x2 + offset_x2 * ( indexPos - trace1.pos ) :  trace1.x2 - offset_x2 * ( indexPos - trace1.pos ) ;
                y2 = trace1.y2 < trace2.y2 ?  trace1.y2 + offset_y2 * ( indexPos - trace1.pos ) :  trace1.y2 - offset_y2 * ( indexPos - trace1.pos ) ;
            }else{
                x1 = shape.x1 ;
                y1 = shape.y1 ;
                x2 = shape.x2 ;
                y2 = shape.y2 ;
            }

            // 转换坐标（全屏下）
            x1 = precision(convertToStandardCoordinate(x1,"x",lrcentertype,rateWidth,rateHeight));
            x2 = precision(convertToStandardCoordinate(x2,"x",lrcentertype,rateWidth,rateHeight));
            y1 = precision(convertToStandardCoordinate(y1,"y",lrcentertype,rateWidth,rateHeight));
            y2 = precision(convertToStandardCoordinate(y2,"y",lrcentertype,rateWidth,rateHeight));

            var xmin = Math.min(x1,x2),
                ymin = Math.min(y1,y2),
                xmax = Math.max(x1,x2),
                ymax = Math.max(y1,y2);

            var cover = getCoverFromShape(shape,indexPos) ;
            var mdfs = showTracesStatus(traces,indexPos);
            var quality = getQualityFromShape(shape,indexPos);
            var obj = new Array(13);
            if(mdfs === null) {
                if(quality === null){
                  
                    obj = {
                        "x1": xmin.toString(),
                        "y1": ymin.toString(),
                        "x2": xmax.toString(),
                        "y2": ymax.toString(),
                        "Occluded": cover.cover,
                        "cover": cover.cover,
                        "leave": cover.leave,
                        "truncated": cover.truncated,
                        "trace": 0,
                        "num": shape.num
                    };
                }else{
                    obj = {
                        "x1": xmin.toString(),
                        "y1": ymin.toString(),
                        "x2": xmax.toString(),
                        "y2": ymax.toString(),
                        "Occluded": cover.cover,
                        "cover": cover.cover,
                        "leave": cover.leave,
                        "truncated": cover.truncated,
                        "iq": quality.iq,
                        "et": quality.et,
                        "trace": 0,
                        "num": shape.num
                    };
                }
            }else{
                if(quality === null){
                    obj = {
                        "x1": xmin.toString(),
                        "y1": ymin.toString(),
                        "x2": xmax.toString(),
                        "y2": ymax.toString(),
                        "Occluded": cover.cover,
                        "cover": cover.cover,
                        "leave": cover.leave,
                        "truncated": cover.truncated,
                        mdfs:1,
                        "trace": 0,
                        "num": shape.num
                    };
  
                   // obj = new Array(11);
                   // obj[0] = xmin.toString();
                   // obj[1] = ymin.toString();
                   // obj[2] = xmax.toString();
                   // obj[3] = ymax.toString();
                   // obj[4] = cover.cover;
                   // obj[5] = cover.cover;
                   // obj[6] = cover.leave;
                   // obj[7] = cover.truncated;
                   // obj[8] = 0;
                   // obj[9] = shape.num;
                   // obj[10] = quality.iq;
                }else{
                    obj = {
                        "x1": xmin.toString(),
                        "y1": ymin.toString(),
                        "x2": xmax.toString(),
                        "y2": ymax.toString(),
                        "Occluded": cover.cover,
                        "cover": cover.cover,
                        "leave": cover.leave,
                        "truncated": cover.truncated,
                        "iq": quality.iq,
                        "et": quality.et,
                        mdfs:1,
                        "trace": 0,
                        "num": shape.num
                    };
                }

            }

            var type = shape.type ;
            switch(type){
                case "car":
                    img.label.Car.push(obj);
                    break ;
                case "psn":
                    img.label.PED.push(obj);
                    break ;
                case "pedal":
                    img.label.Cyclist.push(obj);
                    break ;
                case "mtc":
                    img.label.Motorcycle_rider.push(obj);
                    break ;
                case "psd":
                    img.label.PS.push(obj);
                    break ;
                case "carb":
                    img.label.VAN.push(obj);
                    break ;
                case "donc":
                    img.label.dontcare.push(obj);
                    break ;
            }
        }

        deleteObjectIfNull(img.label);
    }
}

/**
 * 高级质检生成保存数据
 */
function collectionDataForQuality(images,images1,shapes,lrcentertype){
    var len = images.length ;
  
    var rateWidth = data.naturalWidth / layoutWH.centerWidth,
        rateHeight = data.naturalHeight / layoutWH.centerHeight;

    // 遍历每一帧
    for(var pos = 0; pos < len ; pos ++){
        var img = images[pos] ;

        var indexPos = pos + 1 ;
        img.pos = indexPos ;

        // 均摊shape到每一帧上
        //var perPerson = null ;
        for(var i = 0 ;i < shapes.length ; i ++){
            var shape = shapes[i] ;
            if(indexPos < shape.pos){
                continue ;
            }

            // 计算坐标值
            var x1 = y1 = x2 = y2 = 0 ;

            var traces = shape.traces ;
            //是否是修改狀態
            var mdfss;
            if(traces.length > 1){
                // 找到轨迹区间
                var trace2 = null ;
                var trace1 = null ;
                for(var idx = 0;idx < traces.length ; idx ++){
                    trace2 = traces[idx];
                    if(indexPos < trace2.pos){
                        if(idx - 1 >= 0){
                            trace1 = traces[idx - 1] ;
                        }

                        break ;
                    }
                }

                if(trace1 === null){
                    trace1 = trace2 ;
                }

                // 计算移动的值
                var offset_y1 = Math.abs(trace2.y1 - trace1.y1) / Math.abs(trace2.pos - trace1.pos);
                var offset_x1 = Math.abs(trace2.x1 - trace1.x1) / Math.abs(trace2.pos - trace1.pos);
                var offset_x2 = Math.abs(trace2.x2 - trace1.x2) / Math.abs(trace2.pos - trace1.pos);
                var offset_y2 = Math.abs(trace2.y2 - trace1.y2) / Math.abs(trace2.pos - trace1.pos);

                offset_x1 = isNaN(offset_x1) ? 0 :  offset_x1;
                offset_y1 = isNaN(offset_y1) ? 0 :  offset_y1;
                offset_x2 = isNaN(offset_x2) ? 0 :  offset_x2;
                offset_y2 = isNaN(offset_y2) ? 0 :  offset_y2;

                // 都是从trace1开始
                x1 = trace1.x1 < trace2.x1 ?  trace1.x1 + offset_x1 * ( indexPos - trace1.pos ) :  trace1.x1 - offset_x1 * ( indexPos - trace1.pos ) ;
                y1 = trace1.y1 < trace2.y1 ?  trace1.y1 + offset_y1 * ( indexPos - trace1.pos ) :  trace1.y1 - offset_y1 * ( indexPos - trace1.pos ) ;
                x2 = trace1.x2 < trace2.x2 ?  trace1.x2 + offset_x2 * ( indexPos - trace1.pos ) :  trace1.x2 - offset_x2 * ( indexPos - trace1.pos ) ;
                y2 = trace1.y2 < trace2.y2 ?  trace1.y2 + offset_y2 * ( indexPos - trace1.pos ) :  trace1.y2 - offset_y2 * ( indexPos - trace1.pos ) ;
            }else{
                x1 = shape.x1 ;
                y1 = shape.y1 ;
                x2 = shape.x2 ;
                y2 = shape.y2 ;
            }

            // 转换坐标（全屏下）
            x1 = precision(convertToStandardCoordinate(x1,"x",lrcentertype,rateWidth,rateHeight));
            x2 = precision(convertToStandardCoordinate(x2,"x",lrcentertype,rateWidth,rateHeight));
            y1 = precision(convertToStandardCoordinate(y1,"y",lrcentertype,rateWidth,rateHeight));
            y2 = precision(convertToStandardCoordinate(y2,"y",lrcentertype,rateWidth,rateHeight));

            var xmin = Math.min(x1,x2),
                ymin = Math.min(y1,y2),
                xmax = Math.max(x1,x2),
                ymax = Math.max(y1,y2);

            var cover = getCoverFromShape(shape,indexPos) ;
            var mdfs = showTracesStatus(traces,indexPos);
            var quality = getQualityFromShape(shape,indexPos);
            var obj;
            if(mdfs === null) {
                if(quality === null){
                    obj = {
                        "x1": xmin.toString(),
                        "y1": ymin.toString(),
                        "x2": xmax.toString(),
                        "y2": ymax.toString(),
                        "Occluded": cover.cover,
                        "cover": cover.cover,
                        "leave": cover.leave,
                        "truncated": cover.truncated,
                        "trace": 0,
                        "num": shape.num
                    };
                }else{
                    obj = {
                        "x1": xmin.toString(),
                        "y1": ymin.toString(),
                        "x2": xmax.toString(),
                        "y2": ymax.toString(),
                        "Occluded": cover.cover,
                        "cover": cover.cover,
                        "leave": cover.leave,
                        "truncated": cover.truncated,
                        "iq": quality.iq,
                        "et": quality.et,
                        "trace": 0,
                        "num": shape.num
                    };
                }
            }else{
                if(quality===null){
                    obj = {
                        "x1": xmin.toString(),
                        "y1": ymin.toString(),
                        "x2": xmax.toString(),
                        "y2": ymax.toString(),
                        "Occluded": cover.cover,
                        "cover": cover.cover,
                        "leave": cover.leave,
                        "truncated": cover.truncated,
                        mdfs:1,
                        "trace": 0,
                        "num": shape.num
                    };
                }else{
                    obj = {
                        "x1": xmin.toString(),
                        "y1": ymin.toString(),
                        "x2": xmax.toString(),
                        "y2": ymax.toString(),
                        "Occluded": cover.cover,
                        "cover": cover.cover,
                        "leave": cover.leave,
                        "truncated": cover.truncated,
                        "iq": quality.iq,
                        "et": quality.et,
                        mdfs:1,
                        "trace": 0,
                        "num": shape.num
                    };
                }
            }

            var type = shape.type ;
            switch(type){
                case "car":
                    img.label.Car.push(obj);
                    break ;
                case "psn":
                    img.label.PED.push(obj);
                    break ;
                case "pedal":
                    img.label.Cyclist.push(obj);
                    break ;
                case "mtc":
                    img.label.Motorcycle_rider.push(obj);
                    break ;
                case "psd":
                    img.label.PS.push(obj);
                    break ;
                case "carb":
                    img.label.VAN.push(obj);
                    break ;
                case "donc":
                    img.label.dontcare.push(obj);
                    break ;
            }
        }

        deleteObjectIfNull(img.label);

        if(img.status === "checked" || img.status === "modify"){
            if(!img.effective){
                img.leak_tag = images1[pos].leak_tag;//　漏标
                img.error_tag = images1[pos].error_tag;// 错标
                img.error_content = images1[pos].error_content;// 错误内容
            }else{
                img.leak_tag = 0;//　漏标
                img.error_tag = 0;// 错标
                img.error_content = "";// 错误内容
            }
        }else{
            img.leak_tag = 0;//　漏标
            img.error_tag = 0;// 错标
            img.error_content = "";// 错误内容
        }
    }
}

function deleteObjectIfNull(label){
    for(var key in label){
        if(isArray(label[key])){
            if(label[key].length === 0){
                delete label[key] ;
            }
        }
    }
}

function isArray(object){
    return object && typeof object==='object' && Array == object.constructor;
}

/**
 * 中镜头（左中右）标注图形向原图转换转换
 * 在程序初始化的时候，执行的是从原图向中镜头（左中右）转换
 * @param c 坐标值
 * @param direction {x|y}
 * @param lrcentertype
 * @returns {*}
 */
function convertToStandardCoordinate(c,direction,lrcentertype,rateWidth,rateHeight){
    var coordinate = c ;

    if(direction === "x"){
        coordinate = (c * rateWidth);
    }else {
        coordinate = (c * rateHeight);
    }

    return coordinate;
}

function insertTraceInfoToAllData(){
    if(!canCollect){
        return ;
    }

    insertTraceInfoToData(centerShapes,data.images);
    insertTraceInfoToData(leftShapes,data.imagesL);
    insertTraceInfoToData(rightShapes,data.imagesR);
}

/**
 * 插入跟踪轨迹到data数据中
 */
function insertTraceInfoToData(shapes,images){
    for(var idx = 0;idx < shapes.length;idx ++){
        var shape = shapes[idx];
        var type = shape.type ;
        var traces = shape.traces;

        // 遍历shape的轨迹
        for(var i = 0;i < traces.length;i++){
            var trace = traces[i];
            var pos = trace.pos;
            var dataObj = images[pos-1];
            var label = dataObj.label;
            var typeIndex = getTypeIndex(shapes,type,pos,idx);

            switch(type){
                case "car" :
                    var cars = label.Car;
                    var targerCar = cars[typeIndex];
                    targerCar.trace = 1;
                    break ;
                case "psn":
                    var persons = label.PED;
                    var targerPerson= persons[typeIndex];
                    targerPerson.trace = 1;
                    break ;
                case "pedal":
                    var pedals = label.Cyclist;
                    var targerPedal = pedals[typeIndex];
                    targerPedal.trace = 1;
                    break ;
                case "mtc":
                    var mtcs = label.Motorcycle_rider;
                    var targerMtc = mtcs[typeIndex];
                    targerMtc.trace = 1;
                    break ;
                case "psd":
                    var perd = label.PS;
                    var targePsd = perd[typeIndex];
                    targePsd.trace = 1;
                    break ;
                case "carb":
                    var carbox = label.VAN;
                    var targeCarb = carbox[typeIndex];
                    targeCarb.trace = 1;
                    break ;
                case "donc":
                    var dontcare = label.dontcare;
                    var targeDontcare = dontcare[typeIndex];
                    targeDontcare.trace = 1;
                    break ;
            }
        }
    }
}

function getTypeIndex(shapes,type,tracePos,idx){
    var index = -1 ;

    for(var i = 0;i <= idx;i ++){
        if(type == shapes[i].type){
            if(shapes[i].pos <= tracePos){
                index ++ ;
            }
        }
    }

    return index ;
}

function showTracesStatus(traces,indexpos) {
    var mdfs;
    for (var i = 0; i < traces.length; i++) {
        var trace = traces[i];
        if (trace.pos == indexpos) {
            if (trace.mdfs != null && trace.mdfs == 1) {
                mdfs = 1;
                break;
            }
        }
    }
    return mdfs;
}