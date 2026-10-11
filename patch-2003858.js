(()=>{
  const p={
    barcode:"4711908806446",
    name:"(舊)中衛口罩-櫻花粉3入",
    vip:50,
    mode:"條碼掃描",
    posProductNo:"2003858"
  };
  let i=PRODUCT_LIST.findIndex(x=>String(x.posProductNo||"")===p.posProductNo);
  if(i<0)i=PRODUCT_LIST.findIndex(x=>String(x.barcode||"")===p.barcode);
  if(i<0)PRODUCT_LIST.push(p);
  else PRODUCT_LIST[i]=p;

  if(!BARCODE_MAP.has(p.barcode))BARCODE_MAP.set(p.barcode,[]);
  const list=BARCODE_MAP.get(p.barcode);
  const j=list.findIndex(x=>String(x.posProductNo||"")===p.posProductNo || String(x.barcode||"")===p.barcode);
  if(j<0)list.push(p);
  else list[j]=p;
})();