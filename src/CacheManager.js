
CacheManager = {
  
  DB_NAME: 'three-lens-db',
  
  DB_VERSION: 1, // Use a long long for this value (don't use a float)
  
  DB_STORE_NAME: 'alldata-store',
  
  db:null,
  
  init : function(){
    CacheManager.initDb();
  },
  
  initDb : function () {
    console.debug("indexdb initializeing ...");
  
    try{
      var req = indexedDB.open(CacheManager.DB_NAME, CacheManager.DB_VERSION);
    }catch(e){
      console.info('浏览器不支持indexedDB存储，数据将无法保存至本地！');
      return false;
    }
    
    req.onsuccess = function (evt) {
      CacheManager.db = this.result;
      console.debug("indexDB is created successfully");
    };
  
    req.onerror = function (evt) {
      console.error("error initDb:", evt.target.errorCode);
    };
  
    req.onupgradeneeded = function (evt) {
      console.debug("init Db onupgradeneeded");
    
      var store = evt.currentTarget.result.createObjectStore(
        CacheManager.DB_STORE_NAME, { keyPath: 'id', autoIncrement: true });
      
      store.createIndex('dataid', 'dataid', { unique: false });
    };
  },
  
  getFile: function(key, success_callback) {
    var tx = CacheManager.db.transaction(CacheManager.DB_STORE_NAME, 'readonly');
    var store = tx.objectStore(CacheManager.DB_STORE_NAME);
    var req = store.get(key);
    req.onsuccess = function(evt) {
      var value = evt.target.result;
      if (value)
        success_callback(value.file);
    };
  },
  
  format : function(dataObj,fmt){
    var o = {
      "M+" : dataObj.getMonth()+1, //月份
      "d+" : dataObj.getDate(), //日
      "h+" : dataObj.getHours()%12 == 0 ? 12 : dataObj.getHours()%12, //小时
      "H+" : dataObj.getHours(), //小时
      "m+" : dataObj.getMinutes(), //分
      "s+" : dataObj.getSeconds(), //秒
      "q+" : Math.floor((dataObj.getMonth()+3)/3), //季度
      "S" : dataObj.getMilliseconds() //毫秒
    };
    
    var week = {
      "0" : "/u65e5",
      "1" : "/u4e00",
      "2" : "/u4e8c",
      "3" : "/u4e09",
      "4" : "/u56db",
      "5" : "/u4e94",
      "6" : "/u516d"
    };
    
    if(/(y+)/.test(fmt)){
     fmt=fmt.replace(RegExp.$1, (dataObj.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    
    if(/(E+)/.test(fmt)){
     fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[dataObj.getDay()+""]);
    }
    
    for(var k in o){
     if(new RegExp("("+ k +")").test(fmt)){
       fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
     }
    }
    
    return fmt;
  },
  
  addPublication: function (dataStr, dataid) {
    console.debug("addPublication arguments:", arguments);
    
    if (!CacheManager.db) {
      console.error("addPublication: the db is not initialized");
      return;
    }
    
    try{
      var tx = CacheManager.db.transaction(CacheManager.DB_STORE_NAME, 'readwrite');
      var store = tx.objectStore(CacheManager.DB_STORE_NAME);
  
      var req = store.add({
        dataid: dataid,
        dataStr: dataStr,
        savetime: CacheManager.format(new Date(),"yyyy-MM-dd hh:mm:ss:S")});
  
      req.onsuccess = function (evt) {
        console.debug("data insertion in DB successful");
      };
  
      req.onerror = function() {
        console.error("data insertion error", this.error);
      };
      
    }catch(e){
      console.warn('数据保存错误');
      return false;
    }
    
    return true ;
 }
  
}