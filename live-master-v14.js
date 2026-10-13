(()=>{
function syncCloudRows(rows){
  for(const p of rows||[]){
    const pos=String(p.posProductNo||"").trim();
    const bc=String(p.barcode||"").trim();
    let i=-1;
    if(pos)i=PRODUCT_LIST.findIndex(x=>String(x.posProductNo||"").trim()===pos);
    if(i<0&&bc)i=PRODUCT_LIST.findIndex(x=>String(x.barcode||"").trim()===bc);
    if(i>=0)PRODUCT_LIST[i]=p; else PRODUCT_LIST.push(p);
  }
}

runProductSearch=async function(){
  const raw=$("search").value.trim();
  const q=raw.toLowerCase();
  if(q.length<2){
    searchRequestSeq++;
    $("searchResults").innerHTML="";
    $("searchStatus").textContent="至少輸入 2 個字或 2 碼";
    return;
  }
  const seq=++searchRequestSeq;
  $("searchStatus").textContent="☁️ 正在讀取 Google 商品主檔最新資料…";
  try{
    const cloud=await searchProductsFromCloud(raw);
    if(seq!==searchRequestSeq||$("search").value.trim()!==raw)return;
    syncCloudRows(cloud);
    renderSearchResults(cloud,cloud.length?"Google 商品主檔最新資料":"");
  }catch(e){
    if(seq!==searchRequestSeq)return;
    const local=[];
    for(const p of PRODUCT_LIST){
      const name=String(p.name||"").toLowerCase();
      const barcode=String(p.barcode||"").toLowerCase();
      const pos=String(p.posProductNo||"").toLowerCase();
      if(name.includes(q)||barcode.includes(q)||pos.includes(q)){
        local.push(p);
        if(local.length>=30)break;
      }
    }
    if(local.length){
      renderSearchResults(local,"本機備援");
      $("searchStatus").textContent="⚠️ Google 商品主檔暫時無法連線，目前顯示本機備援資料。";
    }else{
      $("searchResults").innerHTML="";
      $("searchStatus").textContent="❌ Google 商品主檔暫時無法連線，本機也找不到商品。";
    }
  }
};

showBarcode=async function(code){
  code=String(code||"").trim();
  if(!code)return;
  scanPaused=true;
  $("cameraStatus").className="status";
  $("cameraStatus").textContent="☁️ 正在讀取 Google 商品主檔最新資料："+code;
  try{
    const list=await findBarcodeFromCloud(code);
    syncCloudRows(list);
    if(list&&list.length){
      const p=chooseDuplicate(list);
      if(p)showProductObject(p,"條碼掃描");
      else {scanPaused=false;lockedCode=null;}
      return;
    }
    scanPaused=false;lockedCode=null;
    $("cameraStatus").className="status bad";
    $("cameraStatus").textContent="⚠️ Google 商品主檔找不到："+code;
  }catch(e){
    const local=BARCODE_MAP.get(code)||[];
    if(local.length){
      const p=chooseDuplicate(local);
      if(p){
        $("cameraStatus").className="status";
        $("cameraStatus").textContent="⚠️ Google 商品主檔暫時無法連線，先使用本機備援。";
        showProductObject(p,"條碼掃描");
      }
    }else{
      scanPaused=false;lockedCode=null;
      $("cameraStatus").className="status bad";
      $("cameraStatus").textContent="❌ Google 商品主檔暫時無法連線，本機也沒有此條碼。";
    }
  }
};

const badge=document.querySelector(".badge");
if(badge)badge.textContent="✅ 正式盤點模式 v14｜Google 商品主檔即時同步版｜INITIAL-20261008";
})();

// 2026-10-13 健挺盒/顆盤點選項：即使雲端包裝規則尚未回傳，也在手機盤點頁補上盒裝換算。
const __xinnanOriginalGetPackageOptionsFromCloud=getPackageOptionsFromCloud;
getPackageOptionsFromCloud=async function(p){
  const barcode=String(p?.barcode||"").trim();
  let data=null;
  try{data=await __xinnanOriginalGetPackageOptionsFromCloud(p)}catch(e){data=null}
  const fallback={
    "4713930511077":{baseUnit:"顆",conversion:4,unit:"盒",posName:"2001161 健挺4入"},
    "4713930511459":{baseUnit:"顆",conversion:30,unit:"盒",posName:"2002172 健挺膜衣錠100mg 30錠/盒"}
  }[barcode];
  if(!fallback)return data;
  const out=(data&&typeof data==="object")?{...data}:{options:[]};
  const opts=Array.isArray(out.options)?[...out.options]:[];
  if(!opts.some(o=>Number(o.conversion)===fallback.conversion && String(o.unit||"")===fallback.unit)){
    opts.push({unit:fallback.unit,conversion:fallback.conversion,posName:fallback.posName});
  }
  out.baseUnit=fallback.baseUnit;
  out.options=opts;
  out.hasPackageVariants=true;
  return out;
};
