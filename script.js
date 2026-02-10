async function loadAI(){

// ---------- NIFTY ----------
let nifty = await fetch("https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?range=6mo&interval=1d")
.then(r=>r.json());
let prices = nifty.chart.result[0].indicators.quote[0].close;
let last = prices[prices.length-1];
let avg200 = prices.slice(-200).reduce((a,b)=>a+b,0)/200;

let market = last > avg200 ? "🟢 Bullish" : "🔴 Bearish";
document.getElementById("trend").innerText = market;

// ---------- NEWS ----------
let news = await fetch("https://newsapi.org/v2/everything?q=india%20stock%20market&apiKey=4d7f491ca6ce4fa6bb2c608ee4f26dac")
.then(r=>r.json());

let score=0;
news.articles.forEach(n=>{
  let t=n.title.toLowerCase();
  if(t.includes("rise")||t.includes("growth")||t.includes("profit")) score++;
  if(t.includes("fall")||t.includes("loss")||t.includes("crash")) score--;
});

let newsSent = score>0 ? "🟢 Positive" : "🔴 Negative";
document.getElementById("news").innerText = newsSent;

// ---------- SECTORS ----------
let sectors={
  IT:"%5ECNXIT",
  BANK:"%5ENSEBANK",
  PHARMA:"%5ECNXPHARMA"
};

let best="IT",bestVal=-999;

for(let s in sectors){
 let d=await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sectors[s]}?range=1mo&interval=1d`)
 .then(r=>r.json());
 let c=d.chart.result[0].indicators.quote[0].close;
 let perf=(c[c.length-1]-c[0])/c[0]*100;
 if(perf>bestVal){bestVal=perf;best=s;}
}
document.getElementById("sector").innerText = best;

// ---------- STOCKS ----------
let stocks=["RELIANCE.NS","TCS.NS","INFY.NS","HDFCBANK.NS","ICICIBANK.NS"];
let ul=document.getElementById("stocks");
ul.innerHTML="";
stocks.forEach(s=>{
 let li=document.createElement("li");
 li.innerText=s;
 ul.appendChild(li);
});

// ---------- PUSH ALERT ----------
if(last > avg200 && score > 0){
 OneSignal.push(()=> {
  OneSignal.sendSelfNotification("🟢 BUY SIGNAL",
  "Market strong & news positive – Good time to invest");
 });
}

if(last < avg200 && score < 0){
 OneSignal.push(()=> {
  OneSignal.sendSelfNotification("🔴 SELL SIGNAL",
  "Market weak & bad news – Exit or hold cash");
 });
}

}

loadAI();
