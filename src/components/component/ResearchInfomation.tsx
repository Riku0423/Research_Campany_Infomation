"use client";

import React, { useState, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Clipboard } from "lucide-react"

const DIFY_API_URL = "https://api.dify.ai/v1/workflows/run"
const API_KEY = "app-k9aLSlsu3pdZwS437ksuP0pd"

interface CompanyData {
  companyName: string;
  [key: string]: string | string[];
}

export function CompanyAnalysis() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [companyData, setCompanyData] = useState<CompanyData | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      console.log("APIリクエスト開始:", url)
      const response = await fetch(DIFY_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: { url },
          response_mode: "blocking",
          user: "user-123"
        })
      })
      console.log("APIレスポンス受信")
      const data = await response.json()
      console.log("APIレスポンスデータ:", data)
      const parsedData = parseCompanyData(data.data.outputs.text)
      console.log("パース済みデータ:", parsedData)
      setCompanyData(parsedData)
    } catch (err) {
      console.error("エラー発生:", err)
      setError("分析中にエラーが発生しました。")
    } finally {
      setLoading(false)
    }
  }

  const parseCompanyData = (text: string): CompanyData => {
    console.log("データパース開始:", text)
    const lines = text.split('\n')
    const data: CompanyData = { companyName: '' }
    let currentKey = ''

    lines.forEach(line => {
      if (line.startsWith('##')) {
        data.companyName = line.replace('##', '').trim()
      } else if (line.startsWith('#')) {
        currentKey = line.replace('#', '').trim()
        data[currentKey] = ''
      } else if (line.trim() !== '') {
        if (currentKey === 'クライアント' || currentKey === '最近のニュース') {
          if (!Array.isArray(data[currentKey])) data[currentKey] = [] as string[]
          (data[currentKey] as string[]).push(line.replace('*', '').trim())
        } else {
          data[currentKey] = (data[currentKey] as string) + line.trim()
        }
      }
    })

    console.log("パース完了:", data)
    return data
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('コピーしました。')
    }).catch(err => {
      console.error('コピーに失敗しました:', err)
    })
  }

  const handleCopyAll = () => {
    if (!companyData) return

    const allText = `
会社名: ${companyData.companyName}

会社概要:
本社住所: ${companyData['本社住所']}
電話番号: ${companyData['電話番号']}
社長: ${companyData['社長']}
従業員数: ${companyData['従業員数']}
売上: ${companyData['売上']}

事業内容:
事業１: ${companyData['事業１']}
${companyData['事業１の説明']}

事業２: ${companyData['事業２']}
${companyData['事業２の説明']}

事業３: ${companyData['事業３']}
${companyData['事業３の説明']}

主要クライアント:
${Array.isArray(companyData['クライアント']) ? companyData['クライアント'].join('\n') : ''}

最近のニュース:
${Array.isArray(companyData['最近のニュース']) ? companyData['最近のニュース'].join('\n') : ''}
    `.trim()

    handleCopy(allText)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="max-w-4xl w-full px-6 py-8 bg-card rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-card-foreground">企業情報分析</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="url" className="block mb-2 text-card-foreground">
              企業URL
            </Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "分析中..." : "分析を開始"}
          </Button>
        </form>
        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">エラー:</strong> <span className="block sm:inline">{error}</span>
          </div>
        )}
        {companyData && (
          <div className="mt-8 space-y-6" ref={resultRef}>
            <h2 className="text-2xl font-bold mb-4 text-card-foreground">{companyData.companyName}</h2>
            <Button onClick={handleCopyAll} className="w-full mb-4">
              <Clipboard className="w-4 h-4 mr-2" />
              全体をコピー
            </Button>
            <Card>
              <CardHeader>
                <CardTitle>会社概要</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div><span className="font-medium">本社住所:</span> {companyData['本社住所']}</div>
                  <div><span className="font-medium">電話番号:</span> {companyData['電話番号']}</div>
                  <div><span className="font-medium">社長:</span> {companyData['社長']}</div>
                  <div><span className="font-medium">従業員数:</span> {companyData['従業員数']}</div>
                  <div><span className="font-medium">売上:</span> {companyData['売上']}</div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleCopy(`本社住所: ${companyData['本社住所']}\n電話番号: ${companyData['電話番号']}\n社長: ${companyData['社長']}\n従業員数: ${companyData['従業員数']}\n売上: ${companyData['売上']}`)} className="ml-auto">
                  <Clipboard className="w-4 h-4 mr-2" />
                  コピー
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>事業内容</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">{companyData['事業１']}</h3>
                    <p>{companyData['事業１の説明']}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">{companyData['事業２']}</h3>
                    <p>{companyData['事業２の説明']}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">{companyData['事業３']}</h3>
                    <p>{companyData['事業３の説明']}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleCopy(`事業１: ${companyData['事業１']}\n${companyData['事業１の説明']}\n\n事業２: ${companyData['事業２']}\n${companyData['事業２の説明']}\n\n事業３: ${companyData['事業３']}\n${companyData['事業３の説明']}`)} className="ml-auto">
                  <Clipboard className="w-4 h-4 mr-2" />
                  コピー
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>主要クライアント</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside">
                  {Array.isArray(companyData['クライアント']) && companyData['クライアント'].map((client, index) => (
                    <li key={index}>{client}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleCopy(Array.isArray(companyData['クライアント']) ? companyData['クライアント'].join('\n') : '')} className="ml-auto">
                  <Clipboard className="w-4 h-4 mr-2" />
                  コピー
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>最近のニュース</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside">
                  {Array.isArray(companyData['最近のニュース']) && companyData['最近のニュース'].map((news, index) => (
                    <li key={index}>{news}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleCopy(Array.isArray(companyData['最近のニュース']) ? companyData['最近のニュース'].join('\n') : '')} className="ml-auto">
                  <Clipboard className="w-4 h-4 mr-2" />
                  コピー
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}