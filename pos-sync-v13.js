window.XINNAN_POS_SYNC_PROMISE=(async()=>{
  const r=await fetch("./pos-map-v13.json?v=20261011-7",{cache:"no-store"});
  if(!r.ok)throw new Error("POS map HTTP "+r.status);
  const rows=await r.json();

  const byPos=new Map();
  const byBarcode=new Map();
  const byName=new Map();

  for(const p of PRODUCT_LIST){
    const pos=String(p.posProductNo||"").trim();
    const bc=String(p.barcode||"").trim();
    const nm=String(p.name||"").trim();
    if(pos)byPos.set(pos,p);
    if(bc&&!byBarcode.has(bc))byBarcode.set(bc,p);
    if(nm&&!byName.has(nm))byName.set(nm,p);
  }

  for(const row of rows){
    const pos=String(row[0]||"").trim();
    const bc=String(row[1]||"").trim();
    const nm=String(row[2]||"").trim();
    if(!pos)continue;

    let p=byPos.get(pos)||null;
    if(!p&&bc)p=byBarcode.get(bc)||null;
    if(!p&&nm)p=byName.get(nm)||null;
    if(!p&&nm.startsWith("(舊)"))p=byName.get(nm.slice(3))||null;

    if(p){
      p.posProductNo=pos;
      if(bc)p.barcode=bc;
      if(nm)p.name=nm;
    }else{
      p={
        barcode:bc,
        name:nm,
        vip:null,
        mode:bc?"條碼掃描":"搜尋商品",
        posProductNo:pos
      };
      PRODUCT_LIST.push(p);
    }

    byPos.set(pos,p);
    if(bc)byBarcode.set(bc,p);
    if(nm)byName.set(nm,p);
  }

  BARCODE_MAP.clear();
  for(const p of PRODUCT_LIST){
    const bc=String(p.barcode||"").trim();
    if(!bc)continue;
    if(!BARCODE_MAP.has(bc))BARCODE_MAP.set(bc,[]);
    BARCODE_MAP.get(bc).push(p);
  }

  const badge=document.querySelector(".badge");
  if(badge)badge.textContent="✅ 正式盤點模式 v13｜完整 POS 對應同步版｜INITIAL-20261008";
  return {count:rows.length};
})();