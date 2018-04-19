/**
 * Created by zhangyong on 2016/10/9.
 */


function ReferenceLine(){
    this.lineWidth = 1 ;
    this.strokeStyle = "#ff0000";
}

ReferenceLine.prototype.updateEditedContext = function(){
    var can = document.getElementById(editedCanvas);
    this.context = can.getContext('2d');
}

ReferenceLine.prototype.updateXY = function(x,y){
    this.x = x ;
    this.y = y ;
}

ReferenceLine.prototype.drawOrUpdate = function() {
    var me = this ;
    me.updateEditedContext();
    var x = me.x,y = me.y ;

    me.context.save();
    me.context.translate(0.5,0.5);
    me.context.lineWidth = me.lineWidth ;
    me.context.setLineDash([4,5]);
    me.context.strokeStyle = me.strokeStyle ;

    var w = $("#"+editedCanvas).width(),
        h = $("#"+editedCanvas).height();

    me.context.beginPath();
    me.context.moveTo(0,y);
    me.context.lineTo(w,y);

    me.context.moveTo(x,0);
    me.context.lineTo(x,h);
    me.context.closePath();

    me.context.stroke();
    me.context.restore();
}