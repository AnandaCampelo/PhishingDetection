from fastapi import FastAPI, Query
from pydantic import BaseModel
from fastapi.responses import FileResponse
from detection import full_analysis
import csv
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

history = []

class AnalysisResult(BaseModel):
    url: str
    results: dict

@app.get("/")
def read_root():
    return {"message": "Phishing Detector API running"}

@app.get("/analyze", response_model=AnalysisResult)
def analyze_url(url: str = Query(..., description="URL to analyze")):
    analysis = full_analysis(url)
    result = {"url": url, "results": analysis}
    history.append(result)
    return AnalysisResult(url=url, results=analysis)

@app.get("/export")
def export_history():
    filename = "analysis_history.csv"
    with open(filename, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["URL", "WHOIS", "DNS Dynamic", "SSL", "Redirects", "Similarity", "HTML Content"])
        for item in history:
            row = [
                item['url'],
                item['results']['whois'],
                item['results']['dns_dynamic'],
                str(item['results']['ssl']),
                str(item['results']['redirects']),
                str(item['results']['similarity']),
                str(item['results']['html_content'])
            ]
            writer.writerow(row)
    return FileResponse(filename, media_type='text/csv', filename=filename)