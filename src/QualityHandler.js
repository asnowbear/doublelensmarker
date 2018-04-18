/**
 * Created by westlife on 2016/11/23.
 */
/**
 * 初始化单框质检
 */
function initQualityHandler(){

    // 遮盖、删除点击处理
    $("#qualityboxdiv").click(function(event){
        var target = event.target;
        if(target.tagName == "INPUT"){
            onQualityInputClick(target);
        }
    });

}

/**
 * 单框质检列表渲染
 * @param shapes
 */
function renderQualityList(shapes){
    //获取当前标注框
    // var shapes = getEditedShapes() || [];
    var shapeslen = shapes.length - 1;

    var index = 0;
    $(".qualitytable").html("");
    if(shapeslen >= 0){
        var html = "";
        for(var idx = 0;idx <= shapeslen;idx++){
            var shape = shapes[idx];

            if(pos < shape.pos){
                continue;
            }

            var type = shape.type;

            var tracepos = 1;
            if(type != ""){
                // if(shape.traces == undefined){
                //     tracepos = 1;
                // }else{
                var trace = shape.traces[0];
                tracepos = trace.pos;
                // }
            }

            //获取对应形状的质检信息
            var quality = findCurrentQuality(shape);
            //找到当前帧对应的遮盖信息
            var cover = findCurrentCover(shape);

            if(index % 2 == 0){
                html += '<tr>';
            }
            if(cover.leave == 0){
                if(pos + 1 >= tracepos){
                    switch(type){
                        case "psn":
                            html += getPersonQualityItem(quality,shape,idx);
                            break;
                        case "car":
                            html += getCarQualityItem(quality,shape,idx);
                            break;
                        case "pedal":
                            html += getPedalQualityItem(quality,shape,idx);
                            break;
                        case "mtc":
                            html += getMtcQualityItem(quality,shape,idx);
                            break;
                        case "psd":
                            html += getPsdQualityItem(quality,shape,idx);
                            break;
                        case "carb":
                            html += getCarboxQualityItem(quality,shape,idx);
                            break;
                        case "donc":
                            html += getDontQualityItem(quality,shape,idx);
                            break;
                        default:
                            break;
                    }
                    if(index % 2 == 1){
                         html += '</tr>';
                    }
                    index++;
                }
            }
        }
    $(".qualitytable").html(html);
    }

}

function getPersonQualityItem(quality,shape,index){
    var template = '<td>'+
        '<div shapeid="+shape.id+">'+
        '<span class="ctitle1">{title}：</span>'+
        '<label><input type="radio" {checked} id={isquality}>合格</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype1} {checked} value="1">框不贴合</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype2} {checked} value="2">类型错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype3} {checked} value="3">遮挡错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype4} {checked} value="4">边缘卡掉错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype5} {checked} value="5">离开错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype6} {checked} value="6">多标</label>'+
        '</div>'+
        '</td>';

    var num = shape.num;
    var isquality = "psn_isquality_" + num + "_chk_" + index;
    var errortype = "psn_errortype_" + num + "_chk_" + index;
    var errortype1 = "psn_errortype_" + num +"_chk_" + index + "_" + 1;
    var errortype2 = "psn_errortype_" + num +"_chk_" + index + "_" + 2;
    var errortype3 = "psn_errortype_" + num +"_chk_" + index + "_" + 3;
    var errortype4 = "psn_errortype_" + num +"_chk_" + index + "_" + 4;
    var errortype5 = "psn_errortype_" + num +"_chk_" + index + "_" + 5;
    var errortype6 = "psn_errortype_" + num +"_chk_" + index + "_" + 6;

    var  html = template.replace("{title}",getAnnoText("psn") + "_" + num)
        .replace("{isquality}",isquality)
        .replace("{errortype1}",errortype1)
        .replace("{errortype2}",errortype2)
        .replace("{errortype3}",errortype3)
        .replace("{errortype4}",errortype4)
        .replace("{errortype5}",errortype5)
        .replace("{errortype6}",errortype6)
        .replace(new RegExp("{errortype}","gm"),errortype);

    if(quality == null){
        html =  html.replace("{checked}","");
        for(var j=1;j<=6;j++){
            html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\"");
        }
    }else{
        if(quality.iq == 1){
            html = html.replace("{checked}","checked='checked'");
            for(var j=1;j<=6;j++){
                html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\"");
            }
        }else{
            html = html.replace("{checked}","");
            for(var j=1;j<=6;j++){
                if(quality.et.indexOf(j)>=0){
                    html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\" checked='checked'");
                }else{
                    html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\"");
                }
            }
        }
    }
    return html;
}

function getCarQualityItem(quality,shape,index){
    var template = '<td>'+
        '<div shapeid="+shape.id+">'+
        '<span class="ctitle1">{title}：</span>'+
        '<label><input type="radio" {checked} id={isquality}>合格</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype1} {checked} value="1">框不贴合</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype2} {checked} value="2">类型错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype3} {checked} value="3">遮挡错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype4} {checked} value="4">边缘卡掉错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype5} {checked} value="5">离开错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype6} {checked} value="6">多标</label>'+
        '</div>'+
        '</td>';

    var num = shape.num;
    var isquality = "car_isquality_" + num + "_chk_" + index;
    var errortype = "car_errortype_" + num + "_chk_" + index;
    var errortype1 = "car_errortype_" + num +"_chk_" + index + "_" + 1;
    var errortype2 = "car_errortype_" + num +"_chk_" + index + "_" + 2;
    var errortype3 = "car_errortype_" + num +"_chk_" + index + "_" + 3;
    var errortype4 = "car_errortype_" + num +"_chk_" + index + "_" + 4;
    var errortype5 = "car_errortype_" + num +"_chk_" + index + "_" + 5;
    var errortype6 = "car_errortype_" + num +"_chk_" + index + "_" + 6;

    var  html = template.replace("{title}",getAnnoText("car") + "_" + num)
        .replace("{isquality}",isquality)
        .replace("{errortype1}",errortype1)
        .replace("{errortype2}",errortype2)
        .replace("{errortype3}",errortype3)
        .replace("{errortype4}",errortype4)
        .replace("{errortype5}",errortype5)
        .replace("{errortype6}",errortype6)
        .replace(new RegExp("{errortype}","gm"),errortype);

    if(quality == null){
        html =  html.replace("{checked}","");
        for(var j=1;j<=6;j++){
            html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\"");
        }
    }else{
        if(quality.iq == 1){
            html = html.replace("{checked}","checked='checked'");
            for(var j=1;j<=6;j++){
                html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\"");
            }
        }else{
            html.replace("{checked}","");
            for(var j=1;j<=6;j++){
                if(quality.et.indexOf(j)>=0){
                    html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\" checked='checked'");
                }else{
                    html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\"");
                }
            }
        }
    }

    return html;
}

function getPedalQualityItem(quality,shape,index) {
    var template = '<td>'+
        '<div shapeid="+shape.id+">'+
        '<span class="ctitle1">{title}：</span>'+
        '<label><input type="radio" {checked} id={isquality}>合格</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype1} {checked} value="1">框不贴合</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype2} {checked} value="2">类型错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype3} {checked} value="3">遮挡错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype4} {checked} value="4">边缘卡掉错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype5} {checked} value="5">离开错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype6} {checked} value="6">多标</label>'+
        '</div>'+
        '</td>';

    var num = shape.num;
    var isquality = "pedal_isquality_" + num + "_chk_" + index;
    var errortype = "pedal_errortype_" + num + "_chk_" + index;
    var errortype1 = "pedal_errortype_" + num +"_chk_" + index + "_" + 1;
    var errortype2 = "pedal_errortype_" + num +"_chk_" + index + "_" + 2;
    var errortype3 = "pedal_errortype_" + num +"_chk_" + index + "_" + 3;
    var errortype4 = "pedal_errortype_" + num +"_chk_" + index + "_" + 4;
    var errortype5 = "pedal_errortype_" + num +"_chk_" + index + "_" + 5;
    var errortype6 = "pedal_errortype_" + num +"_chk_" + index + "_" + 6;

    var  html = template.replace("{title}",getAnnoText("pedal") + "_" + num)
        .replace("{isquality}",isquality)
        .replace("{errortype1}",errortype1)
        .replace("{errortype2}",errortype2)
        .replace("{errortype3}",errortype3)
        .replace("{errortype4}",errortype4)
        .replace("{errortype5}",errortype5)
        .replace("{errortype6}",errortype6)
        .replace(new RegExp("{errortype}","gm"),errortype);

    if(quality == null){
        html =  html.replace("{checked}","");
        for(var j=1;j<=6;j++){
            html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\"");
        }
    }else{
        if(quality.iq == 1){
            html = html.replace("{checked}","checked='checked'");
            for(var j=1;j<=6;j++){
                html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\"");
            }
        }else{
            html.replace("{checked}","");
            for(var j=1;j<=6;j++){
                if(quality.et.indexOf(j)>=0){
                    html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\" checked='checked'");
                }else{
                    html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\"");
                }
            }
        }
    }

    return html;
}

function getMtcQualityItem(quality,shape,index){
    var template = '<td>'+
        '<div shapeid="+shape.id+">'+
        '<span class="ctitle1">{title}：</span>'+
        '<label><input type="radio" {checked} id={isquality}>合格</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype1} {checked} value="1">框不贴合</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype2} {checked} value="2">类型错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype3} {checked} value="3">遮挡错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype4} {checked} value="4">边缘卡掉错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype5} {checked} value="5">离开错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype6} {checked} value="6">多标</label>'+
        '</div>'+
        '</td>';

    var num = shape.num;
    var isquality = "mtc_isquality_" + num + "_chk_" + index;
    var errortype = "mtc_quality_" + num + "_chk_" + index;
    var errortype1 = "mtc_errortype_" + num +"_chk_" + index + "_" + 1;
    var errortype2 = "mtc_errortype_" + num +"_chk_" + index + "_" + 2;
    var errortype3 = "mtc_errortype_" + num +"_chk_" + index + "_" + 3;
    var errortype4 = "mtc_errortype_" + num +"_chk_" + index + "_" + 4;
    var errortype5 = "mtc_errortype_" + num +"_chk_" + index + "_" + 5;
    var errortype6 = "mtc_errortype_" + num +"_chk_" + index + "_" + 6;

    var  html = template.replace("{title}",getAnnoText("mtc") + "_" + num)
        .replace("{isquality}",isquality)
        .replace("{errortype1}",errortype1)
        .replace("{errortype2}",errortype2)
        .replace("{errortype3}",errortype3)
        .replace("{errortype4}",errortype4)
        .replace("{errortype5}",errortype5)
        .replace("{errortype6}",errortype6)
        .replace(new RegExp("{errortype}","gm"),errortype);

    if(quality == null){
        html =  html.replace("{checked}","");
        for(var j=1;j<=6;j++){
            html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\"");
        }
    }else{
        if(quality.iq == 1){;
            html = html.replace("{checked}","checked='checked'");
            for(var j=1;j<=6;j++){
                html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\"");
            }
        }else{
            html.replace("{checked}","");
            for(var j=1;j<=6;j++){
                if(quality.et.indexOf(j)>=0){
                    html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\" checked='checked'");
                }else{
                    html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\"");
                }
            }
        }
    }

    return html;
}

function getPsdQualityItem(quality,shape,index){
    var template = '<td>'+
        '<div shapeid="+shape.id+">'+
        '<span class="ctitle1">{title}：</span>'+
        '<label><input type="radio" {checked} id={isquality}>合格</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype1} {checked} value="1">框不贴合</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype2} {checked} value="2">类型错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype3} {checked} value="3">遮挡错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype4} {checked} value="4">边缘卡掉错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype5} {checked} value="5">离开错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype6} {checked} value="6">多标</label>'+
        '</div>'+
        '</td>';

    var num = shape.num;
    var isquality = "psd_isquality_" + num + "_chk_" + index;
    var errortype = "psd_errortype_" + num + "_chk_" + index;
    var errortype1 = "psd_errortype_" + num +"_chk_" + index + "_" + 1;
    var errortype2 = "psd_errortype_" + num +"_chk_" + index + "_" + 2;
    var errortype3 = "psd_errortype_" + num +"_chk_" + index + "_" + 3;
    var errortype4 = "psd_errortype_" + num +"_chk_" + index + "_" + 4;
    var errortype5 = "psd_errortype_" + num +"_chk_" + index + "_" + 5;
    var errortype6 = "psd_errortype_" + num +"_chk_" + index + "_" + 6;

    var  html = template.replace("{title}",getAnnoText("psd") + "_" + num)
        .replace("{isquality}",isquality)
        .replace("{errortype1}",errortype1)
        .replace("{errortype2}",errortype2)
        .replace("{errortype3}",errortype3)
        .replace("{errortype4}",errortype4)
        .replace("{errortype5}",errortype5)
        .replace("{errortype6}",errortype6)
        .replace(new RegExp("{errortype}","gm"),errortype);

    if(quality == null){
        html =  html.replace("{checked}","");
        for(var j=1;j<=6;j++){
            html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\"");
        }
    }else{
        if(quality.iq == 1){
            html = html.replace("{checked}","checked='checked'");
            for(var j=1;j<=6;j++){
                html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\"");
            }
        }else{
            html.replace("{checked}","");
            for(var j=1;j<=6;j++){
                if(quality.et.indexOf(j)>=0){
                    html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\" checked='checked'");
                }else{
                    html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\"");
                }
            }
        }
    }

    return html;
}

function getCarboxQualityItem(quality,shape,index){
    var template = '<td>'+
        '<div shapeid="+shape.id+">'+
        '<span class="ctitle1">{title}：</span>'+
        '<label><input type="radio" {checked} id={isquality}>合格</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype1} {checked} value="1">框不贴合</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype2} {checked} value="2">类型错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype3} {checked} value="3">遮挡错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype4} {checked} value="4">边缘卡掉错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype5} {checked} value="5">离开错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype6} {checked} value="6">多标</label>'+
        '</div>'+
        '</td>';

    var num = shape.num;
    var isquality = "carb_isquality_" + num + "_chk_" + index;
    var errortype = "carb_errortype_" + num + "_chk_" + index;
    var errortype1 = "carb_errortype_" + num +"_chk_" + index + "_" + 1;
    var errortype2 = "carb_errortype_" + num +"_chk_" + index + "_" + 2;
    var errortype3 = "carb_errortype_" + num +"_chk_" + index + "_" + 3;
    var errortype4 = "carb_errortype_" + num +"_chk_" + index + "_" + 4;
    var errortype5 = "carb_errortype_" + num +"_chk_" + index + "_" + 5;
    var errortype6 = "carb_errortype_" + num +"_chk_" + index + "_" + 6;

    var  html = template.replace("{title}",getAnnoText("carb") + "_" + num)
        .replace("{isquality}",isquality)
        .replace("{errortype1}",errortype1)
        .replace("{errortype2}",errortype2)
        .replace("{errortype3}",errortype3)
        .replace("{errortype4}",errortype4)
        .replace("{errortype5}",errortype5)
        .replace("{errortype6}",errortype6)
        .replace(new RegExp("{errortype}","gm"),errortype);

    if(quality == null){
        html =  html.replace("{checked}","");
        for(var j=1;j<=6;j++){
            html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\"");
        }
    }else{
        if(quality.iq == 1){
            html = html.replace("{checked}","checked='checked'");
            for(var j=1;j<=6;j++){
                html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\"");
            }
        }else{
            html.replace("{checked}","");
            for(var j=1;j<=6;j++){
                if(quality.et.indexOf(j)>=0){
                    html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\" checked='checked'");
                }else{
                    html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\"");
                }
            }
        }
    }

    return html;
}

function getDontQualityItem(quality,shape,index){
    var template = '<td>'+
        '<div shapeid="+shape.id+">'+
        '<span class="ctitle1">{title}：</span>'+
        '<label><input type="radio" {checked} id={isquality}>合格</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype1} {checked} value="1">框不贴合</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype2} {checked} value="2">类型错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype3} {checked} value="3">遮挡错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype4} {checked} value="4">边缘卡掉错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype5} {checked} value="5">离开错误</label>'+
        '<label><input type="checkbox" name={errortype} id={errortype6} {checked} value="6">多标</label>'+
        '</div>'+
        '</td>';

    var num = shape.num;
    var isquality = "donc_isquality_" + num + "_chk_" + index;
    var errortype = "donc_errortype_" + num + "_chk_" + index;
    var errortype1 = "donc_errortype_" + num +"_chk_" + index + "_" + 1;
    var errortype2 = "donc_errortype_" + num +"_chk_" + index + "_" + 2;
    var errortype3 = "donc_errortype_" + num +"_chk_" + index + "_" + 3;
    var errortype4 = "donc_errortype_" + num +"_chk_" + index + "_" + 4;
    var errortype5 = "donc_errortype_" + num +"_chk_" + index + "_" + 5;
    var errortype6 = "donc_errortype_" + num +"_chk_" + index + "_" + 6;

    var  html = template.replace("{title}",getAnnoText("donc") + "_" + num)
        .replace("{isquality}",isquality)
        .replace("{errortype1}",errortype1)
        .replace("{errortype2}",errortype2)
        .replace("{errortype3}",errortype3)
        .replace("{errortype4}",errortype4)
        .replace("{errortype5}",errortype5)
        .replace("{errortype6}",errortype6)
        .replace(new RegExp("{errortype}","gm"),errortype);

    if(quality == null){
        html =  html.replace("{checked}","");
        for(var j=1;j<=6;j++){
            html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\"");
        }
    }else{
        if(quality.iq == 1){
            html = html.replace("{checked}","checked='checked'");
            for(var j=1;j<=6;j++){
                html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\"");
            }
        }else{
            html.replace("{checked}","");
            for(var j=1;j<=6;j++){
                if(quality.et.indexOf(j)>=0){
                    html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\" checked='checked'");
                }else{
                    html = html.replace("{checked} value=\""+j+"\"","value=\""+j+"\"");
                }
            }
        }
    }
    return html;
}

function getQualityFromShape(shape,indexPos){
    var qs = shape.qs ;
    var qs1 = null ;

    if(qs.length == 0){
        qs1 = null;
    }
    for(var idx = 0;idx < qs.length ; idx ++){
        var q = qs[idx] ;
        if(indexPos == q.pos){
            qs1 = q ;
            break ;
        }
    }
    return qs1;
}

/**
* 找到当前帧quality的状态值
* @param shape
* @returns {*}
*/
function findCurrentQuality(shape){
    var qualities = shape.qs ;
    var q = null ;
    if(qualities != undefined && qualities.length != 0){
        for(var idx = 0;idx < qualities.length ; idx ++){
            var qs = qualities[idx] ;
            // 优先当前值
            if(pos == qs.pos){
                q = qs ;
                break ;
            }
        }
    }
    return q ;
}

function findCurrentQuality1(shape){
    var qualities = shape.qs ;
    var index = -1;
    if(qualities != undefined && qualities.length != 0){
        for(var idx = 0;idx < qualities.length ; idx ++){
            var qs = qualities[idx] ;
            // 优先当前值
            if(pos == qs.pos){
                index = idx;
                break ;
            }
        }
    }
    return index ;
}

function findCurrentQualitypos(shape){
    var qualities = shape.qs ;
    var index = -1;
    if(qualities != undefined && qualities.length != 0){
        for(var idx = 0;idx < qualities.length ; idx ++){
            var qs = qualities[idx] ;
            // 优先当前值
            if(pos<qs.pos){
                index = idx;
                break;
            }
        }
    }
    return index ;
}

/**
 * 质检按钮点击事件
 * @param target
 */
function onQualityInputClick(target) {
    if(!$("#deletebtndiv").is(":hidden")){
        $("#deletebtndiv").hide();
        isShowBtn = false ;
    }

    var shapes = getEditedShapes();
    var name = target.id ;
    tracePlay = false ;// 勾选时关闭轨迹播放
    var infos = name.split("_") ;
    var qualityType = infos[1] ;
    var index = infos[4] ;
    var selectvalue=infos[5];
    //更改shape的合格/错误类型
    var shape = shapes[index];
    var qsNow = [];
    var qs1 = null ;
    if(qualityType == "isquality"){
        //选择了合格按钮
        if(shape.qs != null && shape.qs.length > 0){
            var findIndex = -1;
            var indexInqs = 0;
            for(var idx = 0;idx < shape.qs.length;idx++){
                qs1 = shape.qs[idx];
                if(qs1.pos == pos){
                    //存在该形状在该帧的质检信息
                    findIndex = 2;
                    shape.qs[idx]={
                        iq: 1,
                        et: "",
                        pos: pos
                    };
                    break;
                }else if(qs1.pos < pos){
                    findIndex = 1;
                    indexInqs = idx;
                    break;
                }
            }
            qsNow ={
                iq: 1,
                et: "",
                pos: pos
            };
            if(findIndex == 1){
                shape.qs.splice(indexInqs + 1,0,qsNow);
            }
            if(findIndex == -1){
                shape.qs.push(qsNow);
            }
        }else{
            qsNow ={
                iq: 1,
                et: "",
                pos: pos
            };
            shape.qs.push(qsNow);
        }
        var etname = infos[0] + "_" + "isquality" + "_" + infos[2] + "_" + "chk" + "_" + infos[4];
        //点击合格按钮后将对应的错误类型复选框都取消勾选状态
        var etname = infos[0] + "_" + "errortype" + "_" + infos[2] + "_" + "chk" + "_" + infos[4];
        for(var idx = 1;idx <= 6;idx++){
            var etname = infos[0] + "_" + "errortype" + "_" + infos[2] + "_" + "chk" + "_" + infos[4] + "_" + idx;
            if($("#"+etname)[0].checked){
                $("#"+etname)[0].checked = false;
            }
        }
    }else if(qualityType == "errortype"){
        //选择了错误类型复选框按钮
        if(shape.qs != null && shape.qs.length > 0){
            var findIndex = -1;
            var indexInqs = 0;

            for(var idx = 0;idx < shape.qs.length;idx++){
                qs1 = shape.qs[idx];
                var et1="";
                if(qs1.pos == pos){
                    findIndex = 2;
                    for(var i=1;i<=6;i++){
                        var etname1 = infos[0] + "_errortype_" + infos[2] + "_chk_" + infos[4] + "_" + i;
                        if($("#"+etname1)[0].checked){
                            et1 = et1 + i + ",";
                        }
                    }
                    et1=et1.substring(0,et1.length - 1);

                    shape.qs[idx]={
                        iq: 0,
                        et: et1,
                        pos: pos
                    };
                    break;
                }
                if(qs1.pos > pos){
                    findIndex = 1;
                    indexInqs = idx;
                    break;
                }
            }
            qsNow ={
                iq: 0,
                et: selectvalue,
                pos: pos
            };
            if(findIndex == 1){
                shape.qs.splice(indexInqs ,0,qsNow);
            }
            if(findIndex == -1){
                shape.qs.push(qsNow);
            }
        }else{
            qsNow ={
                iq: 0,
                et: selectvalue,
                pos: pos
            };
            shape.qs.push(qsNow);
        }
        //点击错误类型复选框时若合格按钮被选中，则取消勾选
        var etname = infos[0] + "_" + "isquality" + "_" + infos[2] + "_" + "chk" + "_" + infos[4];
        if($("#"+etname)[0].checked){
            $("#"+etname)[0].checked=false;
        }
    }
    //统计错误框数
    document.getElementById("errortag").value=getErrottagCount();
}
/**
 * 统计错误框数
 */
function getErrottagCount() {
    var shapes=getEditedShapes();
    var shapeslen = shapes.length - 1;
    var count = 0;
    if(shapeslen>0) {
        for (var i = 0; i <= shapeslen; i++) {
            var shape = shapes[i];
            var quality = findCurrentQuality(shape);
            if(quality != null){
                if(quality.iq == 0){
                    count++;
                }
            }
        }
    }
    return count;
}
/**
 * 设置当前帧所有框合格
 */
function setAllshapeQuality(){
    var shapes=getEditedShapes();
    var shapeslen = shapes.length - 1;
    var index = 0;
    if(shapeslen >= 0) {
        for(var i=0;i<=shapeslen;i++){
            var shape = shapes[i];
            //判断当前帧该形状是否显示
            var cover = findCurrentCover(shape);
            var trace = shape.traces[0];
            var tracepos = trace.pos;
            var qualityidx = findCurrentQuality1(shape);
            // var type = shape.type;
            // var num = shape.num;
            if(cover.leave == 0 && pos >= tracepos){
                //当前帧形状存在
                if(qualityidx != -1){
                    //当前帧的对应形状有质检信息
                    shape.qs[qualityidx] = {
                        iq: 1,
                        et: "",
                        pos: pos
                    };
                }else{
                    var findIdx = findCurrentQualitypos(shape);
                    if(findIdx != -1){
                        shape.qs.splice(findIdx + 1,0,{
                            iq: 1,
                            et: "",
                            pos: pos
                        });
                    }else{
                        shape.qs.push({
                            iq: 1,
                            et: "",
                            pos: pos
                        });
                    }
                }
                var etname=shape.type + "_isquality_" + shape.num +"_chk_" + i;
                $("#"+ etname)[0].checked = "checked";
                for(var j = 1;j <= 6;j++){
                    etname=shape.type + "_errortype_" + shape.num +"_chk_" + i + "_"  + j;
                    $("#"+ etname)[0].checked = false;
                }
            }
        }

    }
}
/**
 * 验证框是否全部质检完成
 */
function isShapesValidate(){
    var shapes=getEditedShapes();
    var shapeslen = shapes.length - 1;
    var flag = false,flag1 = false;
    if(shapeslen >= 0) {
        for (var i = 0; i <= shapeslen; i++) {
            var shape = shapes[i];
            var quality = findCurrentQuality(shape);
            var cover = findCurrentCover(shape);
            var trace = shape.traces[0];
            var tracepos = trace.pos;
            if(cover.leave==0 && tracepos <= pos){
                if(quality == null){
                    flag = true;
                    break;
                }
            }

        }
    }
    return flag;
}

function isShapesValidate1(){
    var shapes=getEditedShapes();
    var shapeslen = shapes.length - 1;
    var flag = false,flag1 = false;
    if(shapeslen >= 0) {
        for (var i = 0; i <= shapeslen; i++) {
            var shape = shapes[i];
            var quality = findCurrentQuality(shape);
            var cover = findCurrentCover(shape);
            var trace = shape.traces[0];
            var tracepos = trace.pos;
            0.
            if(cover.leave==0 && tracepos <= pos){
                if(quality == null || quality.iq == 0){
                    flag = true;
                    break;
                }
            }

        }
    }
    if($("#leaktag").val() != 0){
        flag1 = true;
    }
    var flagAll = (flag || flag1);
    return flagAll;
}
