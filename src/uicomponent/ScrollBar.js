//---------------------------------------------------------------
//
// 滚动条对象
// 1、滚动条UI
// 2、事件监听
// 3、下载进度控制
// 4、鼠标拖到控制
// 5、上、下帧，前后十帧按键控制
//---------------------------------------------------------------

ScrollBar = {
    value : 0,
    maxValue : 0,
    step : 1,
    currentX : -1,
    currentLoadX : -1,// 当前下载的进度
    oScrollBarWidth : 0,// 当前进度条的宽度
    valite : false,
    currentValue : 0,
    moveSpeed : 90,// 滚动条拖动时的速度
    thumbOffsetLeft : 0,// 距离body左边的距离
    othumbOffsetLeft : 0,
    scrollThumb : null,
    scrollTrack : null,
    valsMapSmall : {},
    valsMapFull : {},

    /**
     * 初始化
     * @constructor
     */
    Initialize : function(value,maxValue,step,currentX) {
        if (this.value > this.maxValue) {
            alert("给定当前值大于了最大值");
            return;
        }
        this.GetValue();
        $("#scroll_Track").css("width", this.currentX + 2 + "px");
        $("#scroll_Thumb").css("margin-left", "-1px");
        document.getElementById('showproc').innerHTML = 1 + '/' + data.images.length;
        this.valsMapSmall.scrollBarWidth = $("#scrollBar").width();
        this.othumbOffsetLeft = $("#scroll_Thumb")[0].offsetLeft + 27/2;

        this.Value();

        if($(".col-md-9").length != 0){
            ScrollBar.thumbOffsetLeft = $(".col-md-9")[0].offsetLeft + 20;
        }

        ScrollBar.scrollThumb = $("#scroll_Thumb");
        ScrollBar.scrollTrack = $("#scroll_Track");
    },

    /**
     * 下载进度更新显示
     * @param rate
     */
    loadingProgress : function(rate){
        this.currentLoadX = $("#scrollBar").width() * rate ;
        $("#scroll_load").width(this.currentLoadX);
    },

    /**
     * 全屏、小屏模式调整处理
     * @param mode
     */
    updateUiMode : function(mode){
        var oScrollBarWidth = null ;
        if(mode == "full"){
            oScrollBarWidth = this.valsMapSmall.scrollBarWidth ;// 获取小屏下的宽度
            this.valsMapFull.scrollBarWidth = $("#scrollBar").width() ;// 缓存大屏下的宽度

            this.currentLoadX = this.valsMapFull.scrollBarWidth ;

            if($(".col-md-9").length != 0){
                ScrollBar.thumbOffsetLeft = 5 ;
            }

        }else if(mode == "small"){
            oScrollBarWidth = this.valsMapFull.scrollBarWidth ;// 获取宽屏下的宽度
            this.currentLoadX = this.valsMapSmall.scrollBarWidth ;

            if($(".col-md-9").length != 0){
                ScrollBar.thumbOffsetLeft = $(".col-md-9")[0].offsetLeft + 20;
            }
        }

        this.SetPos(pos);
    },


    /**
     * 设置滚动条下标位置
     * @param pos
     * @constructor
     */
    SetPos : function(pos) {
        this.value = pos;

        var mWidth =  ($("#scrollBar").width() - 11) / (this.maxValue - 1) * (this.value - 1);
        (mWidth == 0 ) && (mWidth = -1);

        if(mWidth > this.currentLoadX){
            return false;
        }

        ScrollBar.scrollThumb.css("margin-left", mWidth + "px");
        ScrollBar.scrollTrack.css("width", mWidth + 2 + "px");
        document.getElementById('showproc').innerHTML = this.value + '/' + data.images.length;

        return true ;
    },

    /**
     * 鼠标拖动
     */
    mouseMove : function(event){
        if (ScrollBar.valite == false)
            return;

        // 禁止拖放对象文本被选择的方法
        // 防止div在拖动的时候，出现moveover监控失控
        if(window.getSelection){
            window.getSelection().removeAllRanges();
        }else{
            document.selection.empty();
        }

        var clientX = event.clientX - ScrollBar.thumbOffsetLeft;
        var changeX = clientX - ScrollBar.currentX;
        ScrollBar.currentValue = changeX - 80.5;
        var mWidth = ScrollBar.currentValue ;

        // 拖动不能超过下载的进度
        if(mWidth >= this.currentLoadX - 5){
            return false;
        }

        ScrollBar.scrollThumb.css({"margin-left":mWidth + "px"});// 拖动的时候始终改变颜色
        ScrollBar.scrollTrack.css("width", mWidth + 2 + "px");

        if ((mWidth + 25) >= $("#scrollBar").width()) {
            ScrollBar.scrollThumb.css("margin-left", $("#scrollBar").width() - 25 + "px");
            ScrollBar.scrollTrack.css("width", $("#scrollBar").width() + 2 + "px");
            ScrollBar.value = ScrollBar.maxValue;
        } else if (mWidth <= 0) {
            ScrollBar.scrollThumb.css("margin-left", "-1px");
            ScrollBar.scrollTrack.css("width", "0px");

            ScrollBar.value = Math.round(mWidth / ($("#scrollBar").width()- 22) * this.maxValue) + 1;
        } else {
            ScrollBar.value = Math.round(mWidth / ($("#scrollBar").width()- 22) * this.maxValue) + 1;
        }

        var beforPos = Math.round(ScrollBar.value);
        if (beforPos > data.images.length)
            beforPos = data.images.length;

        if(beforPos <= 1){
            beforPos = 1 ;
        }

        document.getElementById('showproc').innerHTML = pos + '/' + data.images.length;

        if(beforPos > pos){
            tracePlay = true ;
            playForward = true ;
        }else{
            tracePlay = true ;
            playForward = false ;
        }

        if(pos != beforPos){
            pos = beforPos ;
            show();
        }
    },

    /**
     * 控制进度条的值
     * @constructor
     */
    Value : function() {
        $("#scroll_Thumb").mousedown(function(e) {
            if (btnEnabled && check()){
                ScrollBar.valite = true;
            }
        });

        $(document.body).mousemove(function(event) {
            ScrollBar.mouseMove(event);
        });

        $(document.body).mouseup(function() {
            ScrollBar.value = Math.round(100 * (ScrollBar.currentValue / $("#scrollBar").width()));
            ScrollBar.valite = false;
            if (ScrollBar.value >= ScrollBar.maxValue)
                ScrollBar.value = ScrollBar.maxValue;
            if (ScrollBar.value <= 0)
                ScrollBar.value = 0;
        });
    },

    /**
     * 获取滚动条位置
     * @constructor
     */
    GetValue : function() {
        this.currentX = $("#scrollBar").width() * (this.value / this.maxValue);
    }
}