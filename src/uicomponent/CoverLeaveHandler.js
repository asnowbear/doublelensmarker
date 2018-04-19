//---------------------------------------------------------------
//
// 图形覆盖/离开属性处理
// 1、UI渲染
// 2、事件监听
// 3、业务控制
//
//---------------------------------------------------------------


var oldMouseEnterID  ;
var backgroundColor = "#eeeeee",backgroundColorHL = "#B9D1EE" ;// 普通背景和高亮背景
function initCoverLeaveHandler(){

    // 遮盖、删除点击处理
    $("#cover").click(function(evevt){
        var target = event.target;
        if(target.tagName == "INPUT"){
            onCoverInputClick(target);
        }
    });

}

// 遮盖、删除点击处理
function mouseenter(event){
    var shapeid = event.attributes["shapeid"].nodeValue;
    if(oldMouseEnterID != shapeid){
        oldMouseEnterID = shapeid ;
        highlightShape(shapeid);
        event.style.backgroundColor = backgroundColorHL;
    }
}

// 遮盖、删除点击处理
function mouseleave(event){
    oldMouseEnterID = null ;
    highlightShape(null);
    event.style.backgroundColor = backgroundColor;
}

function onHideBoxCBClick(event){
    var ipt = event.target ;
    var checked = !ipt.checked ;
    var pCover = ipt.parentNode.parentNode ;
    var shapeId = pCover.attributes["shapeid"].nodeValue ;

    var shape = getShapeById(shapeId);
    shape.display = checked ;

    alwaysRedrawShapes();
}

/**
 * 显示覆盖/离开信息列表
 */
function renderCoverList(shapes){
    if(shapes == undefined){
        return ;
    }

    $("#cover").html("") ;
    var html = "" ;

    var idx = shapes.length - 1;
    for(;idx >= 0; idx --){
        var shape = shapes[idx];
        if(pos < shape.pos){
            continue;
        }

        var type = shape.type ;
        var cover = findCurrentCover(shape);// 找到当前帧COVER的状态值
        switch (type){
            case "psn":
                html += getPersonCoverItem(cover,shape,idx);
                break ;
            case "car":
                html += getCarCoverItem(cover,shape,idx);
                break ;
            case "pedal":
                html += getPedalCoverItem(cover,shape,idx);
                break ;
            case "mtc":
                html += getMtcCoverItem(cover,shape,idx);
                break ;
            case "psd":
                html += getPersonDownCoverItem(cover,shape,idx);
                break ;
            case "carb":
                html += getCarBoxCoverItem(cover,shape,idx);
                break ;
            case "donc":
                html += getDontCareCoverItem(cover,shape,idx);
                break ;
            default:
                break ;
        }
    }

    $("#cover").html(html);
    $("input[name='hideBoxCB']").change(function(e){
        onHideBoxCBClick(e);
    });

    highlightCoverAndLeaveList()
}




function getPedalCoverItem(cover,shape,index) {
    var template = '<div class="pcover" shapeid="'+shape.id+'" onmouseover="mouseenter(this);" onmouseout="mouseleave(this);">' +
        '<span class="ctitle">{title}</span><br/>' +
        '<label><input type="checkbox" name="hideBoxCB" style="float:right" {checked100}/></label><br/>' +
        '<label><input  id={covername2} name={covername} type="radio" {checked} value="1" />部分遮挡（35%）</label><br/>' +
        '<label><input  id={covername3} name={covername} type="radio" {checked} value="2"/>大部分遮挡（55%）</label><br/>' +
        '<label><input  id={covername4} name={covername} type="radio" {checked} value="3"/>不清楚 </label><br/>' +
        '<label><input  id={truncated} {checked} type="checkbox" value=""/>边缘卡掉 </label><br/>' +
        '<label><input  id={leavename} type="checkbox" value="" {checked} />离开 </label><br/></div>';

    var num = shape.num;
    var coverName = "pedal_cover_" + num + "_chk_" + index ;
    var coverName2 = "pedal_cover_" + num + "_chk_"+ index+"_" + 1;
    var coverName3 = "pedal_cover_" + num + "_chk_"+ index+"_" + 2;
    var coverName4 = "pedal_cover_" + num + "_chk_"+ index+"_" + 3;
    var coverName5 = "pedal_cover_" + num + "_chk_"+ index+"_" + (index+5) ;
    var leaveName = "pedal_leave_" + num + "_chk_" + index ;
    var truncatedName="pedal_truncated_" + num + "_chk_" + index ;
    var html =  template.replace("{title}",getAnnoText("pedal") + "_"+num)
        .replace("{covername2}",coverName2)
        .replace("{covername3}",coverName3)
        .replace("{covername4}",coverName4)
        .replace("{covername5}",coverName5)
        //.replaceAll("{covername}",coverName)
        .replace(new RegExp("{covername}","gm"),coverName)
        .replace("{leavename}",leaveName)
        .replace("{checked100}",shape.display ? "" : "checked=checked")
        .replace("{truncated}",truncatedName);

    // 機了勾選的狀態
    //html = cover.cover == 1 ? html.replace("{checked}","checked='checked'") : html.replace("{checked}","") ;
    //html = cover.cover == 0 ? html.replace("{checked}",""):html.replace("value=\""+cover.cover+"\" {checked}","checked='checked'");
    html = cover.cover == 0 ? html:html.replace("{checked} value=\""+cover.cover+"\"","value=\""+cover.cover+"\" checked='checked'");
    html=html.replace(new RegExp("type=\"radio\" {checked}","gm"),"type=\"radio\"");
    html = cover.truncated == 1 ? html.replace("{checked} type=","checked='checked' type=") : html.replace("{checked} type=","type=") ;
    html = cover.leave == 1 ? html.replace("{checked}","checked='checked'") : html.replace("{checked}","") ;
    return html;
}

function getMtcCoverItem(cover,shape,index){
    var template = '<div class="pcover" shapeid="'+shape.id+'" onmouseover="mouseenter(this);" onmouseout="mouseleave(this);">' +
        '<span class="ctitle">{title}</span><br/>' +
        '<label><input type="checkbox" name="hideBoxCB" style="float:right" {checked100}/></label><br/>' +
        '<label><input  id={covername2} name={covername} type="radio" {checked} value="1" />部分遮挡（35%） </label><br/>' +
        '<label><input  id={covername3} name={covername} type="radio" {checked} value="2"/>大部分遮挡（55%）</label><br/>' +
        '<label><input  id={covername4} name={covername} type="radio" {checked} value="3"/>不清楚 </label><br/>' +
        '<label><input  id={truncated} {checked} type="checkbox" value=""/>边缘卡掉 </label><br/>' +
        '<label><input  id={leavename} type="checkbox" value="" {checked} />离开 </label><br/></div>';

    var num = shape.num;
    var coverName = "mtc_cover_" + num + "_chk_" + index ;
    var coverName2 = "mtc_cover_" + num + "_chk_"+ index+"_" + 1 ;
    var coverName3 = "mtc_cover_" + num + "_chk_"+ index+"_" + 2;
    var coverName4 = "mtc_cover_" + num + "_chk_"+ index+"_" + 3;
    var coverName5 = "mtc_cover_" + num + "_chk_"+ index+"_" + (index+5) ;
    var leaveName = "mtc_leave_" + num + "_chk_" + index ;
    var truncatedName="mtc_truncated_" + num + "_chk_" + index ;
    var html =  template.replace("{title}",getAnnoText("mtc") + "_"+num)
        .replace("{covername2}",coverName2)
        .replace("{covername3}",coverName3)
        .replace("{covername4}",coverName4)
        .replace("{covername5}",coverName5)
        //.replaceAll("{covername}",coverName)
        .replace(new RegExp("{covername}","gm"),coverName)
        .replace("{leavename}",leaveName)
        .replace("{checked100}",shape.display ? "" : "checked=checked")
        .replace("{truncated}",truncatedName);

    // 機了勾選的狀態
    //html = cover.cover == 1 ? html.replace("{checked}","checked='checked'") : html.replace("{checked}","") ;
    //html = cover.cover == 0 ? html.replace("{checked}",""):html.replace("value=\""+cover.cover+"\" {checked}","checked='checked'");
    html = cover.cover == 0 ? html:html.replace("{checked} value=\""+cover.cover+"\"","value=\""+cover.cover+"\" checked='checked'");
    html=html.replace(new RegExp("type=\"radio\" {checked}","gm"),"type=\"radio\"");
    html = cover.truncated == 1 ? html.replace("{checked} type=","checked='checked' type=") : html.replace("{checked} type=","type=") ;
    html = cover.leave == 1 ? html.replace("{checked}","checked='checked'") : html.replace("{checked}","") ;
    return html;
}

/**
 * person项
 * @param shape
 * @param personNum
 * @param index
 * @returns {string}
 */
function getPersonCoverItem(cover,shape,index){
    var template = '<div class="pcover" shapeid="'+shape.id+'" onmouseover="mouseenter(this);" onmouseout="mouseleave(this);">' +
        '<span class="ctitle">{title}</span>' +
        '<label><input type="checkbox" name="hideBoxCB" style="float:right" {checked100}/></label><br/>' +
        '<label><input  id={covername2} name={covername} type="radio" {checked} value="1" />部分遮挡（35%） </label><br/>' +
        '<label><input  id={covername3} name={covername} type="radio" {checked} value="2"/>大部分遮挡（55%）</label><br/>' +
        '<label><input  id={covername4} name={covername} type="radio" {checked} value="3"/>不清楚 </label><br/>' +
        '<label><input  id={truncated} {checked} type="checkbox" value=""/>边缘卡掉 </label><br/>' +
        '<label><input  id={leavename} type="checkbox" value="" {checked} />离开 </label><br/></div>';

    var num = shape.num;
    var coverName = "person_cover_" + num + "_chk_" + index ;
    var coverName2 = "person_cover_" + num + "_chk_"+ index+"_" + 1 ;
    var coverName3 = "person_cover_" + num + "_chk_"+ index+"_" + 2;
    var coverName4 = "person_cover_" + num + "_chk_"+ index+"_" + 3;
    var coverName5 = "person_cover_" + num + "_chk_"+ index+"_" + (index+5) ;
    var leaveName = "person_leave_" + num + "_chk_" + index ;
    var truncatedName="person_truncated_" + num + "_chk_" + index ;
    var html =  template.replace("{title}",getAnnoText("psn") + "_"+num)
        .replace("{covername2}",coverName2)
        .replace("{covername3}",coverName3)
        .replace("{covername4}",coverName4)
        .replace("{covername5}",coverName5)
        //.replaceAll("{covername}",coverName)
        .replace(new RegExp("{covername}","gm"),coverName)
        .replace("{leavename}",leaveName)
        .replace("{checked100}",shape.display ? "" : "checked=checked")
        .replace("{truncated}",truncatedName);

    // 機了勾選的狀態
    //html = cover.cover == 1 ? html.replace("{checked}","checked='checked'") : html.replace("{checked}","") ;
    //html = cover.cover == 0 ? html.replace("{checked}",""):html.replace("value=\""+cover.cover+"\" {checked}","checked='checked'");
    html = cover.cover == 0 ? html:html.replace("{checked} value=\""+cover.cover+"\"","value=\""+cover.cover+"\" checked='checked'");
    html=html.replace(new RegExp("type=\"radio\" {checked}","gm"),"type=\"radio\"");
    html = cover.truncated == 1 ? html.replace("{checked} type=","checked='checked' type=") : html.replace("{checked} type=","type=") ;
    html = cover.leave == 1 ? html.replace("{checked}","checked='checked'") : html.replace("{checked}","") ;
    return html;
}

/**
 * 坐着的人person项
 * @param shape
 * @param personNum
 * @param index
 * @returns {string}
 */
function getPersonDownCoverItem(cover,shape,index){
    var template = '<div class="pcover" shapeid="'+shape.id+'" onmouseover="mouseenter(this);" onmouseout="mouseleave(this);">' +
        '<span class="ctitle">{title}</span><br/>' +
        '<label><input type="checkbox" name="hideBoxCB" style="float:right" {checked100}/></label><br/>' +
        '<label><input  id={covername2} name={covername} type="radio" {checked} value="1" />部分遮挡（35%） </label><br/>' +
        '<label><input  id={covername3} name={covername} type="radio" {checked} value="2"/>大部分遮挡（55%） </label><br/>' +
        '<label><input  id={covername4} name={covername} type="radio" {checked} value="3"/>不清楚 </label><br/>' +
        '<label><input  id={truncated} {checked} type="checkbox" value=""/>边缘卡掉 </label><br/>' +
        '<label><input  id={leavename} type="checkbox" value="" {checked} />离开 </label><br/></div>';

    var num = shape.num;
    var coverName = "persondown_cover_" + num + "_chk_" + index ;
    var coverName2 = "persondown_cover_" + num + "_chk_"+ index+"_" + 1 ;
    var coverName3 = "persondown_cover_" + num + "_chk_"+ index+"_" + 2;
    var coverName4 = "persondown_cover_" + num + "_chk_"+ index+"_" + 3;
    var coverName5 = "persondown_cover_" + num + "_chk_"+ index+"_" + (index+5) ;
    var leaveName = "persondown_leave_" + num + "_chk_" + index ;
    var truncatedName="persondown_truncated_" + num + "_chk_" + index ;
    var html =  template.replace("{title}",getAnnoText("psd") + "_"+num)
        .replace("{covername2}",coverName2)
        .replace("{covername3}",coverName3)
        .replace("{covername4}",coverName4)
        .replace("{covername5}",coverName5)
        //.replaceAll("{covername}",coverName)
        .replace(new RegExp("{covername}","gm"),coverName)
        .replace("{leavename}",leaveName)
        .replace("{checked100}",shape.display ? "" : "checked=checked")
        .replace("{truncated}",truncatedName);

    // 機了勾選的狀態
    //html = cover.cover == 1 ? html.replace("{checked}","checked='checked'") : html.replace("{checked}","") ;
    //html = cover.cover == 0 ? html.replace("{checked}",""):html.replace("value=\""+cover.cover+"\" {checked}","checked='checked'");
    html = cover.cover == 0 ? html:html.replace("{checked} value=\""+cover.cover+"\"","value=\""+cover.cover+"\" checked='checked'");
    html=html.replace(new RegExp("type=\"radio\" {checked}","gm"),"type=\"radio\"");
    html = cover.truncated == 1 ? html.replace("{checked} type=","checked='checked' type=") : html.replace("{checked} type=","type=") ;
    html = cover.leave == 1 ? html.replace("{checked}","checked='checked'") : html.replace("{checked}","") ;

    return html;
}

function getCarCoverItem(cover,shape,index){
    // 定义模板
    var template = '<div  class="pcover" shapeid="'+shape.id+'" onmouseover="mouseenter(this);" onmouseout="mouseleave(this);">' +
        '<span class="ctitle">{title}</span><br/>' +
        '<label><input type="checkbox" name="hideBoxCB" style="float:right" {checked100}/></label><br/>' +
        '<label><input  id={covername2} name={covername} type="radio" {checked} value="1" />部分遮挡（35%） </label><br/>' +
        '<label><input  id={covername3} name={covername} type="radio" {checked} value="2"/>大部分遮挡 （55%）</label><br/>' +
        '<label><input  id={covername4} name={covername} type="radio" {checked} value="3"/>不清楚 </label><br/>' +
        '<label><input  id={truncated} {checked} type="checkbox" value=""/>边缘卡掉 </label><br/>' +
        '<label><input  id={leavename} type="checkbox" value="" {checked}  /><span>离开</span> </label><br/></div>';

    var num = shape.num;
    var coverName  = "car_cover_" + num + "_chk_" + index;
    var coverName2 = "car_cover_" + num + "_chk_"+ index+"_" + 1 ;
    var coverName3 = "car_cover_" + num + "_chk_"+ index+"_" + 2;
    var coverName4 = "car_cover_" + num + "_chk_"+ index+"_" + 3;
    var coverName5 = "car_cover_" + num + "_chk_"+ index+"_" + (index+5) ;
    var leaveName = "car_leave_" + num + "_chk_" + index ;
    var truncatedName="car_truncated_" + num + "_chk_" + index ;
    var html =  template.replace("{title}",getAnnoText("car") + "_"+num)
        .replace("{covername2}",coverName2)
        .replace("{covername3}",coverName3)
        .replace("{covername4}",coverName4)
        .replace("{covername5}",coverName5)
        //.replaceAll("{covername}",coverName)
        .replace(new RegExp("{covername}","gm"),coverName)
        .replace("{leavename}",leaveName)
        .replace("{checked100}",shape.display ? "" : "checked=checked")
        .replace("{truncated}",truncatedName);

    // 機了勾選的狀態
    html = cover.cover == 0 ? html:html.replace("{checked} value=\""+cover.cover+"\"","value=\""+cover.cover+"\" checked='checked'");
    html=html.replace(new RegExp("type=\"radio\" {checked}","gm"),"type=\"radio\"");
    //html = cover.cover == 1 ? html.replace("{checked}","checked='checked'") : html.replace("{checked}","") ;
    html = cover.truncated == 1 ? html.replace("{checked} type=","checked='checked' type=") : html.replace("{checked} type=","type=") ;
    html = cover.leave == 1 ? html.replace("{checked}","checked='checked'") : html.replace("{checked}","") ;

    return html;
}
/**
 * 厢型汽车
 * @param cover
 * @param shape
 * @param index
 * @returns {string}
 */
function getCarBoxCoverItem(cover,shape,index){
    // 定义模板
    var template = '<div  class="pcover" shapeid="'+shape.id+'" onmouseover="mouseenter(this);" onmouseout="mouseleave(this);">' +
        '<span class="ctitle">{title}</span><br/>' +
        '<label><input type="checkbox" name="hideBoxCB" style="float:right" {checked100}/></label><br/>' +
        '<label><input  id={covername2} name={covername} type="radio" {checked} value="1" />部分遮挡（35%） </label><br/>' +
        '<label><input  id={covername3} name={covername} type="radio" {checked} value="2"/>大部分遮挡（55%） </label><br/>' +
        '<label><input  id={covername4} name={covername} type="radio" {checked} value="3"/>不清楚 </label><br/>' +
        '<label><input  id={truncated} {checked} type="checkbox" value=""/>边缘卡掉 </label><br/>' +
        '<label><input  id={leavename} type="checkbox" value="" {checked}  /><span>离开</span> </label><br/></div>';

    var num = shape.num;
    var coverName  = "carbox_cover_" + num + "_chk_" + index;
    var coverName2 = "carbox_cover_" + num + "_chk_"+ index+"_" + 1;
    var coverName3 = "carbox_cover_" + num + "_chk_"+ index+"_" + 2;
    var coverName4 = "carbox_cover_" + num + "_chk_"+ index+"_" + 3;
    var coverName5 = "carbox_cover_" + num + "_chk_"+ index+"_" + (index+5) ;
    var leaveName = "carbox_leave_" + num + "_chk_" + index ;
    var truncatedName="carbox_truncated_" + num + "_chk_" + index ;
    var html =  template.replace("{title}",getAnnoText("carb") + "_"+num)
        .replace("{covername2}",coverName2)
        .replace("{covername3}",coverName3)
        .replace("{covername4}",coverName4)
        .replace("{covername5}",coverName5)
        //.replaceAll("{covername}",coverName)
        .replace(new RegExp("{covername}","gm"),coverName)
        .replace("{checked100}",shape.display ? "" : "checked=checked")
        .replace("{leavename}",leaveName)
        .replace("{truncated}",truncatedName);

    // 機了勾選的狀態
    html = cover.cover == 0 ? html:html.replace("{checked} value=\""+cover.cover+"\"","value=\""+cover.cover+"\" checked='checked'");
    html=html.replace(new RegExp("type=\"radio\" {checked}","gm"),"type=\"radio\"");
    //html = cover.cover == 1 ? html.replace("{checked}","checked='checked'") : html.replace("{checked}","") ;
    html = cover.truncated == 1 ? html.replace("{checked} type=","checked='checked' type=") : html.replace("{checked} type=","type=") ;
    html = cover.leave == 1 ? html.replace("{checked}","checked='checked'") : html.replace("{checked}","") ;

    return html;
}

/**
 * don't care
 * @param cover
 * @param shape
 * @param index
 * @returns {string}
 */
function getDontCareCoverItem(cover,shape,index){
    // 定义模板
    var template = '<div  class="pcover" shapeid="'+shape.id+'" onmouseover="mouseenter(this);" onmouseout="mouseleave(this);">' +
        '<span class="ctitle">{title}</span><br/>' +
        '<label><input type="checkbox" name="hideBoxCB" style="float:right" {checked100}/></label><br/>' +
        '<label><input  id={covername2} name={covername} type="radio" {checked} value="1" />部分遮挡（35%） </label><br/>' +
        '<label><input  id={covername3} name={covername} type="radio" {checked} value="2"/>大部分遮挡（55%） </label><br/>' +
        '<label><input  id={covername4} name={covername} type="radio" {checked} value="3"/>不清楚 </label><br/>' +
        '<label><input  id={truncated} {checked} type="checkbox" value=""/>边缘卡掉 </label><br/>' +
        '<label><input  id={leavename} type="checkbox" value="" {checked}  /><span>离开</span> </label><br/></div>';

    var num = shape.num;
    var coverName  = "donc_cover_" + num + "_chk_" + index;
    var coverName2 = "donc_cover_" + num + "_chk_"+ index+"_" + 1 ;
    var coverName3 = "donc_cover_" + num + "_chk_"+ index+"_" + 2;
    var coverName4 = "donc_cover_" + num + "_chk_"+ index+"_" + 3;
    var coverName5 = "donc_cover_" + num + "_chk_"+ index+"_" + (index+5) ;
    var leaveName = "donc_leave_" + num + "_chk_" + index ;
    var truncatedName="donc_truncated_" + num + "_chk_" + index ;
    var html =  template.replace("{title}",getAnnoText("donc") + "_"+num)
        .replace("{covername2}",coverName2)
        .replace("{covername3}",coverName3)
        .replace("{covername4}",coverName4)
        .replace("{covername5}",coverName5)
        //.replaceAll("{covername}",coverName)
        .replace(new RegExp("{covername}","gm"),coverName)
        .replace("{checked100}",shape.display ? "" : "checked=checked")
        .replace("{leavename}",leaveName)
        .replace("{truncated}",truncatedName);

    // 機了勾選的狀態
    html = cover.cover == 0 ? html:html.replace("{checked} value=\""+cover.cover+"\"","value=\""+cover.cover+"\" checked='checked'");
    html=html.replace(new RegExp("type=\"radio\" {checked}","gm"),"type=\"radio\"");
    //html = cover.cover == 1 ? html.replace("{checked}","checked='checked'") : html.replace("{checked}","") ;
    html = cover.truncated == 1 ? html.replace("{checked} type=","checked='checked' type=") : html.replace("{checked} type=","type=") ;
    html = cover.leave == 1 ? html.replace("{checked}","checked='checked'") : html.replace("{checked}","") ;

    return html;
}

/**
 * 找到当前帧COVER的状态值
 * @param shape
 * @returns {*}
 */
function findCurrentCover(shape){
    var covers = shape.covers ;
    var c = null ;
    for(var idx = 0;idx < covers.length ; idx ++){
        var cvs = covers[idx] ;

        // 优先当前值
        if(pos == cvs.pos){
            c = cvs ;
            break ;
        }

        if(pos > cvs.pos){
            c = cvs ;
        }
    }

    // 未找到，就给定初始值
    if(c == null){
        c = {
            cover : 0,
            leave : 0,
            truncated:0
        }
    }

    return c ;
}

/**
 * 找到当前帧COVER的状态值
 * @param shape
 * @returns {*}
 */
function findCurrentPose(shape){
    var pose = shape.pose ;
    var c = null ;
    for(var idx = 0;idx < pose.length ; idx ++){
        var cvs = pose[idx] ;

        // 优先当前值
        if(pos == cvs.pos){
            c = cvs ;
            break ;
        }

        if(pos > cvs.pos){
            c = cvs ;
        }
    }

    // 未找到，就给定初始值
    //if(c == null){
    //	c = {
    //		cover : 0,
    //		leave : 0
    //	}
    //}

    return c ;
}

function addTraceToShape(shape,pos){
    var findIdx = -1 ;
    for(var idx = 1;idx < shape.traces.length ; idx ++){
        var t = shape.traces[idx];
        if(pos < t.pos){
            findIdx = idx ;
            break ;
        }

        // 如果在当前帧上存在轨迹，则不需要添加
        if(pos == t.pos){
            findIdx = -2 ;
            break ;
        }
    }

    if(findIdx == -2){
        return ;
    }

    // 新的轨迹点
    if(findIdx == -1){
        findIdx = shape.traces.length;
    }

    // 移动后记录轨迹
    var trace = {
        x1 : shape.x1,
        y1 : shape.y1,
        x2 : shape.x2,
        y2 : shape.y2,
        shapeid : shape.id ,
        pos : pos
    }

    shape.traces.splice(findIdx,0,trace);
}

function highlightCoverAndLeaveList(){
    var shapes = getEditedShapes(),shapeid;
    for(var i = 0;i < shapes.length ; i ++){
        if(shapes[i].isSelected){
            shapeid = shapes[i].id;
            break ;
        }
    }

    if(!shapeid){
        return ;
    }

    var pCovers = $(".pcover"),pcover,pcId;
    for(var i = 0;i < pCovers.length ; i ++){
        pCover = pCovers[i];
        pCover.style.backgroundColor = backgroundColor ;
        pcId = pCover.attributes["shapeid"].nodeValue;

        if(pcId === shapeid){
            pCover.style.backgroundColor = backgroundColorHL ;
            var postion = pCover.offsetHeight * i - 20;
            $("#coverScrollDiv").scrollTop(postion);
        }
    }
}

/**
 * 遮罩、离开勾选事件处理
 * @param target
 */
function onCoverInputClick(target){

    if(!$("#deletebtndiv").is(":hidden")){
        $("#deletebtndiv").hide();
        isShowBtn = false ;
    }

    var shapes = getEditedShapes();
    var name = target.id ;
    if(name === ''){
      return ;
    }
    
    tracePlay = false ;// 勾选时关闭轨迹播放

    var infos = name.split("_") ;
    var coverType = infos[1] ;
    var index = infos[4] ;
    var selectvalue=infos[5];
    var leave = 0 ;
    var leaveClick = false ;
    var isnoselected = false;
    // 更改shape cover/leave的状态
    var shape = shapes[index] ;
    //如果当前区域选择了遮挡部分
    var cover1 = 0 ;
    var truncated=0;
    
    if(shape === undefined || coverType === undefined){
      return ;
    }
    
    if(shape.display === false){
      target.checked = !target.checked;
      alert('图形隐藏，无法设置属性！')
      return
    }

    //如果是遮挡部分，则判断最后一个选择的是什么遮挡，如果最后一个的值和当前的值一样，则把值清空
    if(coverType=="cover") {
        if (shape.covers != null && shape.covers.length > 0) {
            for (var j = 0; j < shape.covers.length; j++) {
                if(selectvalue==shape.covers[j].cover&&shape.covers[j].pos==pos){
                    cover1 = 0;
                    isnoselected = true;
                }
            }
            if(!isnoselected) {
                for (var idx = 0; idx < shape.covers.length; idx++) {
                    cs = shape.covers[idx];
                    if (cs.pos == pos) {
                        cover1 = cs.cover;
                        break;
                    }

                }
            }
            //如果只选遮挡部分，如果以前的边缘卡掉有值则保留最后记录的值
            //truncated=shape.covers[shape.covers.length - 1].truncated;
            for (var k = 0; k < shape.covers.length; k++) {
                var kcs=shape.covers[k];
                if (kcs.pos <= pos) {
                    truncated=shape.covers[k].truncated;
                }
            }
        }
    }
    //如果当前区域选择边缘卡掉
    if(coverType=="truncated") {
        if (shape.covers != null && shape.covers.length > 0) {
            for (var idx = 0; idx < shape.covers.length; idx++) {
                cs = shape.covers[idx];
                if (cs.pos == pos) {
                    truncated = cs.truncated;
                    break;
                }
            }
            //cover=shape.covers[shape.covers.length - 1].cover;
            for (var q = 0; q < shape.covers.length; q++) {
                var qcs=shape.covers[q];
                if (qcs.pos <= pos) {
                    cover1=shape.covers[q].cover;
                }
            }
        }
    }
    switch (coverType){
        case "cover" :
            if(!isnoselected) {
                cover1 = $("#" + name + "").val();
            }
            if(cover1!=0) {
                updateCoverByNowCover(cover1, shape, pos, index);
            }
            break ;
        case "truncated" :
            var checked = $("#"+name+"").prop("checked") ;
            truncated = checked ? 1 : 0 ;
            if(truncated!=0)
            updateCoverByNowtruncated(truncated, shape, pos, index);
            break ;
        case "leave" :
            var checked = $("#"+name+"").prop("checked") ;
            leave = checked ? 1 : 0 ;
            leaveClick = true ;
        default:
            break ;
    }

    var insertPos = pos;

    if(leaveClick){
        //如果当前帧新建标注框然后再点击离开时，不让点击离开
        //||data.images.length==pos
        if(shape.pos==pos){
            alert("当前帧新建的标注框,或最后一帧不允许设定离开!");
            $("#"+name)[0].checked=false;
            return false;
        }
        //判断如果逆操作判断
        //如果再离开范围之内，则所有的影藏内容都变为空值
        checkCoverAndLeave(shape,pos,leave,index);
        addTraceToShape(shape,insertPos);

        paint = false;
        $("#deletebtndiv").hide();
        shape.isSelected = false;// 当前图形高亮

        currentPos = -1;// 开始绘制状态
        redraw();
        document.getElementById("can").style.cursor = "default";
    }

    // 添加遮罩数据
    var cover = {
        cover : cover1,
        leave : leave,
        truncated:truncated,
        pos : pos
    };

    // 首次不存在，则添加
    if(shape.covers.length == 0){
        shape.covers.push(cover) ;
    }else{
        var find = false;
        var index = -1 ;
        var cs = null ;
        // 如果在当前POS存在，则覆盖
        for(var idx = 0;idx < shape.covers.length ; idx ++){
            cs = shape.covers[idx];
            if(cs.pos == pos){
                shape.covers[idx] = cover ;
                find = true ;
                break ;
            }

            // 找到插入的位置
            if(cs.pos <= pos){
                index = idx ;
            }
        }

        if(!find){
            shape.covers.splice(index + 1,0,cover);// 从index +1 处插入一个值
        }
    }
    //如果是质检之后修改则判断是否进行修改并改变status的状态
    modifyShapeStatus(imagesAndTypeMap,currentEditedType,pos);
    redraw();
}

/**
 * 如果当前勾选了离开，则当前不允许选中
 */
function isShapeInCoverAndLeave(shape){
    for(var ii = 0;ii < shape.covers.length ; ii ++){
        var objCL = shape.covers[ii];
        var posone=0;
        if(ii+1<shape.covers.length){
            var objCL1 = shape.covers[ii+1];
            posone=objCL1.pos;
        }
        if(posone!=0){
            if(objCL.leave === 1 && objCL.pos <= pos&&pos<posone){
                return true;
            }
        }else{
            if(objCL.leave === 1 && objCL.pos <= pos){
                return true;
            }
        }
    }

    return false ;
}

function getPoseFromShape(shape,indexPos){
    var pose = shape.pose ;
    var p = null ;

    for(var idx = 0;idx < pose.length ; idx ++){
        var c = pose[idx] ;
        if(indexPos < c.pos){
            if(idx - 1 >= 0){
                p = pose[idx - 1] ;
            }

            break ;
        }
    }

    if(p == null){
        p = pose[pose.length - 1] ;
    }

    return p;
}

function getCoverFromShape(shape,indexPos){
    var covers = shape.covers ;
    var cover = null ;

    if(covers.length == 0){
        cover = {
            cover : 0,
            leave : 0,
            truncated:0
        } ;
    }
    for(var idx = 0;idx < covers.length ; idx ++){
        var c = covers[idx] ;
        if(indexPos < c.pos){
            if(idx - 1 >= 0){
                cover = covers[idx - 1] ;
            }else{
                cover = {
                    cover : 0,
                    leave : 0,
                    truncated:0
                } ;
            }
            break ;
        }
    }

    if(cover == null){
        cover = covers[covers.length - 1] ;
    }

    return cover;
}

function checkCoverAndLeave(shape,pos,leavestatus,index){
    //当前标注的前一个离开帧数
    var leaveprenum=0;
    var leavelaternum=0;
    //当前标注数后第一个
    var backlaternum=0;
    var leavecount=0;
    var leavefirst=0;
    if(leavestatus==1) {
        if (null != shape.covers && shape.covers.length > 0) {
            for (var i = 0; i < shape.covers.length; i++) {
                //当前帧前面最后离开的帧数
                if(pos>=shape.covers[i].pos){
                    if (shape.covers[i].leave == 1) {
                        leaveprenum=shape.covers[i].pos;
                    }
                }
                //当前帧后面的离开的第一帧
                if(pos<shape.covers[i].pos){
                    if (shape.covers[i].leave == 1) {
                        leavelaternum=shape.covers[i].pos;
                    }
                }

                if (pos < shape.covers[i].pos) {
                    if (shape.covers[i].leave == 0) {
                        if (backlaternum == 0) {
                            backlaternum = shape.covers[i].pos;
                        }
                    }
                }
            }
            //leavenum=pos;
            //如果以前没有离开的记录，则直接把后面的都置为离开状态
            if (leaveprenum == 0 && backlaternum == 0&&leavelaternum==0) {
                for (var i = 0; i < shape.covers.length; i++) {
                    if(shape.covers[i].pos>=pos) {
                        shapesAndTypeMap[currentEditedType][index].covers[i].cover = 0;
                        shapesAndTypeMap[currentEditedType][index].covers[i].truncated = 0;
                        shapesAndTypeMap[currentEditedType][index].covers[i].leave=1;
                    }
                }
                //如果前面有离开的状态，则后面有未离开的
            } else if (leaveprenum == 0 && backlaternum == 0&&leavelaternum>0) {
                for (var i = 0; i < shape.covers.length; i++) {
                    if (shape.covers[i].pos>=pos && leavelaternum > shape.covers[i].pos) {
                        shapesAndTypeMap[currentEditedType][index].covers[i].cover = 0;
                        shapesAndTypeMap[currentEditedType][index].covers[i].truncated = 0;
                        shapesAndTypeMap[currentEditedType][index].covers[i].leave = 1;
                    }
                }
            } else if (leaveprenum == 0 && backlaternum > 0&&leavelaternum==0) {
                for (var i = 0; i < shape.covers.length; i++) {
                    if (shape.covers[i].pos>=pos) {
                        shapesAndTypeMap[currentEditedType][index].covers[i].cover = 0;
                        shapesAndTypeMap[currentEditedType][index].covers[i].truncated = 0;
                        shapesAndTypeMap[currentEditedType][index].covers[i].leave = 1;
                    }
                }
            } else if (leaveprenum > 0 && backlaternum == 0&&leavelaternum==0) {
                for (var i = 0; i < shape.covers.length; i++) {
                    if (shape.covers[i].pos>=pos) {
                        shapesAndTypeMap[currentEditedType][index].covers[i].cover = 0;
                        shapesAndTypeMap[currentEditedType][index].covers[i].truncated = 0;
                        shapesAndTypeMap[currentEditedType][index].covers[i].leave = 1;
                    }
                }
            } else if (leaveprenum > 0 && backlaternum > 0&&leavelaternum==0) {
                for (var i = 0; i < shape.covers.length; i++) {
                    if (shape.covers[i].pos>=pos && shape.covers[i].pos<backlaternum) {
                        shapesAndTypeMap[currentEditedType][index].covers[i].cover = 0;
                        shapesAndTypeMap[currentEditedType][index].covers[i].truncated = 0;
                        shapesAndTypeMap[currentEditedType][index].covers[i].leave = 1;
                    }
                }
            } else if (leaveprenum > 0 && backlaternum > 0&&leavelaternum>0) {
                for (var i = 0; i < shape.covers.length; i++) {
                    if (shape.covers[i].pos>=pos && backlaternum > shape.covers[i].pos) {
                        shapesAndTypeMap[currentEditedType][index].covers[i].cover = 0;
                        shapesAndTypeMap[currentEditedType][index].covers[i].truncated = 0;
                        shapesAndTypeMap[currentEditedType][index].covers[i].leave = 1;
                    }
                }
            }
        }
    }
}

/**
 * 标注框除隐藏复选框外的其他选择框是否允许编辑
 * @param abled
 */
function enabledCoverAndLeaveIpt1(abled){
    var coverIptDom = $('#cover input');
    if(coverIptDom != null){
        var ij = coverIptDom.length - 1;
        for(;ij >= 0;ij --){
            if(coverIptDom[ij].name != "hideBoxCB"){
                coverIptDom[ij].disabled = abled;
            }
        }
    }
}
/**
 *
 * 根据当前帧的数据的值来判断后面是否有值如果有值则不修改如果没值则修改
 * @param coverv
 * @param nowshape
 */
function updateCoverByNowCover(coverv,nowshape,pos,index){
    var cs;
    if(nowshape!=null){
        if(nowshape.covers!=null&&nowshape.covers.length>0){
            for(var idx = 0;idx < nowshape.covers.length ; idx ++){
                cs = nowshape.covers[idx];
                if(cs.pos>pos) {
                    if (cs.cover != 0) {
                        break;
                    }else{
                        if(cs.leave!=1) {
                            shapesAndTypeMap[currentEditedType][index].covers[idx].cover = coverv;
                        }
                    }
                }
            }
        }
    }

}

/**
 *
 * 根据当前帧的数据的值来判断后面是否有值如果有值则不修改如果没值则修改
 * @param truncated
 * @param nowshape
 */
function updateCoverByNowtruncated(truncated,nowshape,pos,index){
    var cs;
    if(truncated!=0) {
        if (nowshape != null) {
            if (nowshape.covers != null && nowshape.covers.length > 0) {
                for (var idx = 0; idx < nowshape.covers.length; idx++) {
                    cs = nowshape.covers[idx];
                    if (cs.pos > pos) {
                        if (cs.truncated != 0) {
                            break;
                        } else {
                            if(cs.leave!=1) {
                                shapesAndTypeMap[currentEditedType][index].covers[idx].truncated = truncated;
                            }
                        }
                    }
                }
            }
        }
    }else{

    }

}
