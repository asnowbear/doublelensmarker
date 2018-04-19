
//---------------------------------------------------------------
// 工具条模块处理
// 1、显示框、隐藏框按钮点击处理
// 2、自增勾选框勾选事件处理
//---------------------------------------------------------------


function initToolbar(){

    // 显示框
    $("#displayAllShapesBtn").click(function(e){
        onDisplayAllShapesBtnClick(e);
    });

    // 隐藏框
    $("#hideAllShapesBtn").click(function(e){
        onHideAllShapesBtnClick(e);
    });

    // 显示/隐藏文字点击监听
    $("#displayAllAnnoTextBtn").click(function(e){
        ondisplayAllAnnoTextBtnClick(e);
    });

    // 自增勾选框勾选事件
    $("#incrementIpt").change(function(e){
        onIncrementIptChange(e);
    });
}

function onIncrementIptChange(e){
    var ipt = e.currentTarget;
    idIncrement = ipt.checked ;
}

/**
 *显示/隐藏框点击监听
 */
function onDisplayAllShapesBtnClick(){
    setCurrentShapesDisplay(true);
    redraw();
  
    // 设置属性栏可用
    // setPropertiesInputDisabled(false);
}

function onHideAllShapesBtnClick(){
    setCurrentShapesDisplay(false);
    redraw();
  
    // setPropertiesInputDisabled(true);
}

function setPropertiesInputDisabled(status){
  var pcovers = $('.pcover'),
      pcover = null;
  
  for(var iii = 0;iii < pcovers.length ; iii++){
    var pcoverChildren = pcovers[iii].children;
    for(var jjj = 0;jjj < pcoverChildren.length ; jjj++){
      var child = pcoverChildren[jjj];
      if(child.nodeName === 'LABEL'){
        if(child.children[0].nodeName === 'INPUT'){
          var id = child.children[0].id;
          if(id){
            console.log(id)
            // document.getElementById(id).disabled = true ;
            $('#'+id+'').attr('disabled','disabled');
          }
          // child.children[0].disabled = true;
        }
      }
    }
  }
}

/**
 *显示/隐藏文字点击监听
 */
function ondisplayAllAnnoTextBtnClick(){
    var displayAllAnnoTextBtnDom = $("#displayAllAnnoTextBtn");
    if(displayAllAnnoText){
        displayAllAnnoTextBtnDom.html("显示文字");
        displayAllAnnoText = false;
    }else{
        displayAllAnnoTextBtnDom.html("隐藏文字");
        displayAllAnnoText = true;
    }

    redraw();
}

function setCurrentShapesDisplay(display){
    var shapes = getEditedShapes();
    setShapesDisplay(display,shapes);
    var text = "隐藏框" ;

    $("#hideAllShapesBtn").html(text);
}

function setAllShapesDisplay(display){
    setShapesDisplay(display,getEditedShapes("center"));
    setShapesDisplay(display,getEditedShapes("left"));
    setShapesDisplay(display,getEditedShapes("right"));

    $("#hideAllShapesBtn").html("隐藏框");
}

function setShapesDisplay(display,shapes){
    var i = shapes.length - 1,shape = null ;
    for(;i >= 0 ;i --){
        shape = shapes[i];
        shape.display = display ;
    }
}
