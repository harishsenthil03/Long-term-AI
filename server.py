from flask import Flask, jsonify
import yfinance as yf
from newsapi import NewsApiClient
from textblob import TextBlob

NEWS_KEY = "4d7f491ca6ce4fa6bb2c608ee4f26dac"

app = Flask(__name__)

@app.route("/data")
def data():
    # NIFTY
    nifty = yf.download("^NSEI", period="6mo")
    close = nifty["Close"]
    dma200 = close.rolling(200).mean()
    trend = "BULLISH" if close[-1] > dma200[-1] else "BEARISH"

    # News
    newsapi = NewsApiClient(api_key=NEWS_KEY)
    news = newsapi.get_everything(q="indian stock market", language="en", page_size=20)

    score = 0
    for n in news["articles"]:
        score += TextBlob(n["title"]).sentiment.polarity

    sentiment = "POSITIVE" if score > 0 else "NEGATIVE"

    # Sector
    sectors = {
        "IT":"^CNXIT",
        "BANK":"^NSEBANK",
        "PHARMA":"^CNXPHARMA"
    }

    perf={}
    for s in sectors:
        d=yf.download(sectors[s],period="1mo")["Close"]
        perf[s]=(d[-1]-d[0])/d[0]*100

    best_sector=max(perf,key=perf.get)

    # Stocks
    stocks=["RELIANCE.NS","TCS.NS","INFY.NS","HDFCBANK.NS","ICICIBANK.NS"]
    result=[]

    for s in stocks:
        df=yf.download(s,period="1y")["Close"]
        dma=df.rolling(200).mean()
        if df[-1]>dma[-1]:
            growth=(df[-1]-df[0])/df[0]*100
            result.append({"stock":s,"growth":round(growth,2)})

    result=sorted(result,key=lambda x:x["growth"],reverse=True)[:5]

    return jsonify({
        "trend":trend,
        "news":sentiment,
        "sector":best_sector,
        "stocks":result
    })

app.run()
