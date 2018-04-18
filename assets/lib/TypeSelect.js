

var oldShowId = "" ;
var oldLiId = "" ;
var onShapeTypeSelected = true ;//

var hoverColor="#1e90ff";
var currentTypeSelectingShape = null;//当前正要确认类型的shape
var typeSelectMode = "add";
function initTypeSelect(){

    $(".typelist li").mouseenter(function(e){
        if(e == null || e.currentTarget == null){
            console.info("e is null ") ;
            return
        }

        var tagName = e.currentTarget.tagName;
        if(tagName == undefined ){
            return ;
        }

        if(tagName == "LI" || tagName == "SPAN"){
            var li=e.currentTarget;
            if(tagName == "SPAN"){
                li = e.currentTarget.parent ;
            }

            if(oldShowId != ""){
                $("#"+oldShowId).hide();
            }

            if(oldLiId != ""){
                $("#"+oldLiId).css({"background":"#f5f5f5"});
            }

            var id= li.id;
            var type=id.split("_")[0];
            var typeSelectId = "typeselectdiv_"+type;

            $("#"+id).css({"background":""+hoverColor+""});

            oldShowId = typeSelectId;
            oldLiId = id;

            var typelistDom = $(".typelist");

            // 计算出现的位置
            var newLeft = typelistDom[0].offsetLeft + typelistDom[0].clientWidth + 1 ;
            var newTop = typelistDom[0].offsetTop + li.offsetTop;

            // 减少浏览器重排、重绘
            $("#"+typeSelectId).css({"left":newLeft + "px",
                                      "top":newTop+"px",
                                      "display":"block"});


            var iptId = "tsIpt_"+type;

            if(typeSelectMode == "modify"){
                if(type == currentTypeSelectingShape.type){
                    var oldNum = currentTypeSelectingShape.num;
                    $("#"+iptId).val(oldNum);
                }else{
                    $("#"+iptId).val("");// 其他置空
                }
            }else{
                $("#"+iptId).val("");
            }

            generateShapeNum(type);
        }
    });

    // 确定按钮点击，向外部输出值
    $(".typeselectBtn").click(function(e){
        var target = e.currentTarget;
        var id=target.id;
        var priff=id.split("_")[1];
        var iptId="tsIpt_"+priff;
        var iptDom=$("#"+iptId);

        var val = iptDom.val() ;

        // 非空检查
        if(val == undefined || val == ""){
            alert("请选择或输入图形的ID!");
            iptDom.focus();
            return ;
        }

        val = trim(val);

        // 数字检查
        if(!isNaN(val)){
            val = Number(val);
            if(val < 1 || val > 999999 || val.toString().indexOf(".") > -1){
                alert("输入的ID值无效,请输入1-999999之间的正整数！");
                iptDom.focus();
                return ;
            }
        }else{
            alert("输入的ID值无效,请输入1-999999之间的正整数！");
            iptDom.focus();
            return ;
        }

        // 重复检查
        if(exsitInShapes(val,priff,getEditedShapes())){
            //alert("值已经在同侧画面出现，请重新输入！");
            alert("值已经在，请重新输入！");
            iptDom.focus();
            return ;
        }

        onShapeTypeSelected = true ;

        onShapeDrawedAndSelectedEnd(val,priff);
        //判断是否是修改
        // addShapeModifystatus(currentTypeSelectingShape,"modifystatus");
        //选中完毕后就关闭
        hideTypeSelect();
    });

    // 关闭按钮点击处理
    $("#shut").click(function(e){
        closeTypeSelect();
    });
}

function generateShapeNum(type){
    // 自增
    if(idIncrement){
        var num =generateAutomaticNumnew(type);
        //var num = generateAutomaticNum(type);
        var typeSelectId = "tsIpt_"+type;
        $("#"+typeSelectId).val(num);
    }else{
        initSelectedNumList(type);
    }
}

//删除左右两端的空格
function trim(str){
    return str.replace(/(^s*)|(s*$)/g, "");
}

function initSelectedNumList(type){
    var i = leftShapes.length - 1,s = null,nums=[];
    for(;i >= 0;i --){
        s = leftShapes[i];
        if(s.type == type){
            nums.push(s.num);
        }
    }

    i = rightShapes.length - 1;
    s = null ;
    for(;i >= 0 ;i --){
        s = rightShapes[i];
        if(s.type == type){
            nums.push(s.num);
        }
    }

    i = centerShapes.length - 1;
    s = null ;
    for(;i >= 0 ;i --){
        s = centerShapes[i];
        if(s.type == type){
            nums.push(s.num);
        }
    }

    nums.sort(function(a,b){return a>b?1:-1});//从小到大排序

    //数组去重
    nums=arrayDistinct(nums);

    var option = '<option value="{value}">',optHtml = "";
    i = 0;
    len = nums.length ;
    for(;i<len;i++){
        optHtml += option.replace("{value}",nums[i]);
    }

    var id = "autoNames_"+type;
    $("#"+id).html(optHtml);
}

function exsitInShapes(val,type,shapes){

    //当前判断的是当前编辑的shape是否有重复
    /*var i=shapes.length - 1,s = null;
    for(;i >= 0; i --){
        s = shapes[i];
        if(s.type == type){
            if(s.num == val){
                return true ;
            }
        }
    }*/
    var map={};
    var shapesmaps=[];
    for(var k=0;k<leftShapes.length;k++){
        shapesmaps[k]=leftShapes[k];
    }
    for(var k=0;k<rightShapes.length;k++){
        shapesmaps[leftShapes.length+k]=rightShapes[k];
    }
    for(var k=0;k<centerShapes.length;k++){
        shapesmaps[leftShapes.length+rightShapes.length+k]=centerShapes[k];
    }

    for(var k=0;k<shapesmaps.length;k++){
        var s1=shapesmaps[k];
        map[s1.num]=s1.type;
    }

    if(map[val]!=null&&map[val]!=type){
        return true;
    }

    //判断三屏中是否有重复的数值
    var i = leftShapes.length - 1,s = null;
    //数字重复的数量
    var cfcount=0;
    var oncount=0;
    //是否存在不同类型相同数字的情况，如果有不允许保存
    var typecheckcount=false;
    for(;i >= 0;i --){
        s = leftShapes[i];
            if(s.num == val||s.num==-1){
                    cfcount++;
                    oncount++;
                    if(s.type!=type){
                        //typecheckcount=true;
                        if(map[val]!=null&&map[val]!=type){
                            return true;
                        }
                    }
                //return true ;
            }
    }
    if(oncount>1){
        return true;
    }
    i = rightShapes.length - 1;
    s = null ;
    oncount=0;
    for(;i >= 0 ;i --){
        s = rightShapes[i];
        //if(s.type == type){
            if(s.num == val||s.num==-1){
                    cfcount++;
                    oncount++;
                    //return true ;
                    if(s.type!=type){
                        //typecheckcount=true;
                        if(map[val]!=null&&map[val]!=type){
                            return true;
                        }
                    }
            }
        //}
    }
    if(oncount>1){
        return true;
    }
    i = centerShapes.length - 1;
    s = null ;
    oncount=0;
    for(;i >= 0 ;i --){
        s = centerShapes[i];
        //if(s.type == type){
            if(s.num == val||s.num==-1){
                    cfcount++;
                    oncount++;
                    if(s.type!=type){
                        //typecheckcount=true;
                        if(map[val]!=null&&map[val]!=type){
                            return true;
                        }
                    }
                    //return true ;
            }
        //}
    }
    if(oncount>1){
        return true;
    }
    //如果超过三个则弹出提示
    if(cfcount>3){
        return true;
    }
    return false ;
}

function generateAutomaticNum(type){
    var nextMaxVal = 0;

    var i = leftShapes.length - 1,s = null;
    for(;i >= 0;i --){
        s = leftShapes[i];
        if(s.type == type){
            if(Number(s.num) > nextMaxVal){
                nextMaxVal = Number(s.num) ;
            }
        }
    }

    i = rightShapes.length - 1;
    s = null ;
    for(;i >= 0 ;i --){
        s = rightShapes[i];
        if(s.type == type){
            if(Number(s.num) > nextMaxVal){
                nextMaxVal = Number(s.num) ;
            }
        }
    }

    i = centerShapes.length - 1;
    s = null ;
    for(;i >= 0 ;i --){
        s = centerShapes[i];
        if(s.type == type){
            if(Number(s.num) > nextMaxVal){
                nextMaxVal = Number(s.num) ;
            }
        }
    }

    return Number(nextMaxVal) + 1;
}
/**
 * 设置自动增长的数字是连续的三屏连续
 * @param type
 * @returns {number}
 */
function generateAutomaticNumnew(type){
    var nextMaxVal = 0;
    var shapesNum=[];
    var i = leftShapes.length - 1,s = null;
    for(;i >= 0;i --){
        s = leftShapes[i];
        shapesNum.push(s);
        /*if(s.type == type){
            if(Number(s.num) > nextMaxVal){
                nextMaxVal = Number(s.num) ;
            }
        }*/
    }

    i = rightShapes.length - 1;
    s = null ;
    for(;i >= 0 ;i --){
        s = rightShapes[i];
        shapesNum.push(s);
        /*if(s.type == type){
            if(Number(s.num) > nextMaxVal){
                nextMaxVal = Number(s.num) ;
            }
        }*/
    }

    i = centerShapes.length - 1;
    s = null ;
    for(;i >= 0 ;i --){
        s = centerShapes[i];
        shapesNum.push(s);
        /*if(s.type == type){
            if(Number(s.num) > nextMaxVal){
                nextMaxVal = Number(s.num) ;
            }
        }*/
    }

    if(shapesNum.length>0){
        i = shapesNum.length - 1;
        for(;i >= 0 ;i --) {
            s = shapesNum[i];
            if (Number(s.num) > nextMaxVal) {
                nextMaxVal = Number(s.num);
            }
        }
    }

    return Number(nextMaxVal) + 1;
}


function beforeShowTypeSelect(){
    onShapeTypeSelected = false;// 开始选择

    if(oldLiId != ""){
        $("#"+oldLiId).css({"background":"#f5f5f5"});
    }
}

function showTypeSelect(shape,mode){
    beforeShowTypeSelect();

    // 修改模式下，隐藏删除按钮
    if(mode == "modify"){
        //$("#shut").hide();
        //循环所有的shape然后，再设置属性是修改
        // addShapeModifystatus(shape,mode);
    }

    // 确定值修改模式
    typeSelectMode = mode ;

    var x = shape.x2 < shape.x1 ? shape.x2 : shape.x1;
    var y = shape.y2 < shape.y1 ? shape.y2 : shape.y1;
    var w = Math.abs(shape.x2 - shape.x1);

    var imageId = editedCanvas.replace("can","image");
    var imageDom = $("#"+imageId);
    var typelistDom = $(".typelist");

    var pw = x + w + imageDom[0].offsetLeft + 5;
    if(pw + typelistDom.width() >= imageDom.width() + imageDom[0].offsetLeft){
        pw = pw;
    }

    var ph = y + imageDom[0].offsetTop ;
    if(ph + typelistDom.height() >= imageDom.height() + imageDom[0].offsetTop){
        ph = imageDom.height() + imageDom[0].offsetTop - typelistDom.height() ;
    }

    typelistDom.css({"left":pw+"px","top":ph+"px","display":"block"});

    currentTypeSelectingShape = shape ;//

}

function hideTypeSelect(){
    $(".typelist").hide();
    $(".typeselect").hide();
}

/**
 * 关闭并隐藏，这里需要删除图形
 */
function closeTypeSelect(){
    hideTypeSelect();

    btnEnabled = true;
    isShowBtn = false;
    onShapeTypeSelected = true ;

    drawType = "new";
    currentPos = -1;

    // 如果是modify模式，则不需要删除图形
    if(typeSelectMode == "modify"){
        return ;
    }

    var targetShape = currentTypeSelectingShape;
    if(targetShape == null){
        return ;
    }

    var shapes = getEditedShapes();
    var i = shapes.length - 1,s = null,delIndex = -1;
    for(;i >= 0 ;i--){
        s = shapes[i];
        if(s.id == targetShape.id){
            delIndex = i;
            break ;
        }
    }

    if(delIndex > -1){
        shapes.splice(delIndex,1);
    }
    lastpos = pos;
    redraw();
    save();
}
/**
 * 当前修改的shape
 * @param shape  当前修改的shape
 * @param model  修改标识，modify
 */
function addShapeModifystatus(shape,model){
    var modifystatue;
    //如果当前是修改但是没有点击修改确认
    if(model=="modify") {
        modifystatue=0;
        var i = leftShapes.length - 1;
        for (; i >= 0; i--) {
            s = leftShapes[i];
            if (shape == s) {
                if (s.traces.length > 0) {
                    //如果有内容则直接加上修改标识，标识是未修改的0,1是修改，在最后点击确认时会更新修改的状态
                    for (var c = 0; c < s.traces.length; c++) {
                        var trace = s.traces[c];
                        if (pos == trace.pos) {
                            if(leftShapes[i].traces[c].mdfs!=null&&leftShapes[i].traces[c].mdfs==1){
                                leftShapes[i].traces[c].mdfs =1;
                            }else {
                                leftShapes[i].traces[c].mdfs = modifystatue;
                            }
                        }
                    }
                }
            }
        }

        i = rightShapes.length - 1;
        s = null;
        for (; i >= 0; i--) {
            s = rightShapes[i];
            if (shape == s) {
                if (s.traces.length > 0) {
                    //如果有内容则直接加上修改标识，标识是未修改的0,1是修改，在最后点击确认时会更新修改的状态
                    for (var c = 0; c < s.traces.length; c++) {
                        var trace = s.traces[c];
                        if (pos == trace.pos) {
                            if(rightShapes[i].traces[c].mdfs!=null&&rightShapes[i].traces[c].mdfs==1){
                                rightShapes[i].traces[c].mdfs =1;
                            }else {
                                rightShapes[i].traces[c].mdfs = modifystatue;
                            }
                        }
                    }
                }
            }
        }

        i = centerShapes.length - 1;
        s = null;
        for (; i >= 0; i--) {
            s = centerShapes[i];
            if (shape == s) {
                if (s.traces.length > 0) {
                    //如果有内容则直接加上修改标识，标识是未修改的0,1是修改，在最后点击确认时会更新修改的状态
                    for (var c = 0; c < s.traces.length; c++) {
                        var trace = s.traces[c];
                        if (pos == trace.pos) {
                            if(centerShapes[i].traces[c].mdfs!=null&&centerShapes[i].traces[c].mdfs==1){
                                centerShapes[i].traces[c].mdfs =1;
                            }else {
                                centerShapes[i].traces[c].mdfs = modifystatue;
                            }
                        }
                    }
                }
            }
        }
    }
    //修改当前添加的状态，如果点击确认修改之后，再修改修改的状态是已修改
    if(model=="modifystatus") {
        modifystatue=1;
        var i = leftShapes.length - 1;
        for (; i >= 0; i--) {
            s = leftShapes[i];
            if (shape == s) {
                if (s.traces.length > 0) {
                    //如果有内容则直接加上修改标识，标识是未修改的0,1是修改，在最后点击确认时会更新修改的状态
                    for (var c = 0; c < s.traces.length; c++) {
                        var trace = s.traces[c];
                        if (pos == trace.pos) {
                            if(trace.mdfs!=null) {
                                leftShapes[i].traces[c].mdfs = modifystatue;
                            }
                        }
                    }
                }
            }
        }

        i = rightShapes.length - 1;
        s = null;
        for (; i >= 0; i--) {
            s = rightShapes[i];
            if (shape == s) {
                if (s.traces.length > 0) {
                    //如果有内容则直接加上修改标识，标识是未修改的0,1是修改，在最后点击确认时会更新修改的状态
                    for (var c = 0; c < s.traces.length; c++) {
                        var trace = s.traces[c];
                        if (pos == trace.pos) {
                            if(trace.mdfs!=null) {
                                rightShapes[i].traces[c].mdfs = modifystatue;
                            }
                        }
                    }
                }
            }
        }

        i = centerShapes.length - 1;
        s = null;
        for (; i >= 0; i--) {
            s = centerShapes[i];
            if (shape == s) {
                Index = 0;
                findIndex = -1;
                if (s.traces.length > 0) {
                    //如果有内容则直接加上修改标识，标识是未修改的0,1是修改，在最后点击确认时会更新修改的状态
                    for (var c = 0; c < s.traces.length; c++) {
                        var trace = s.traces[c];
                        if (pos == trace.pos) {
                            if(trace.mdfs!=null) {
                                centerShapes[i].traces[c].mdfs = modifystatue;
                            }
                        }
                    }
                }
            }
        }
    }
}

/**
 * 数组去重
 * @param showarray
 * @returns {Array}
 */
function arrayDistinct(showarray){
    var newnums=[];
    //var showarray=[1,1,1,2,3];
    for(var i=0;i<showarray.length;i++){
        if( showarray[i] !== showarray[i+1])
        {
            newnums.push(showarray[i]);
        }
    }
    return newnums;
}

