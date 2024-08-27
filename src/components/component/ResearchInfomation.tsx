'use client'

import React, { useState, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Clipboard, Building2, Phone, User, Users, DollarSign, Briefcase, Users2, Newspaper } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const DIFY_API_URL = "https://api.dify.ai/v1/workflows/run"
const API_KEY = "app-k9aLSlsu3pdZwS437ksuP0pd"

interface CompanyData {
  companyName: string;
  [key: string]: string | string[];
}

export default function Component() {
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full px-6 py-8 bg-white rounded-lg shadow-xl"
      >
        <h1 className="text-4xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">企業情報分析</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="url" className="block mb-2 text-lg font-medium text-gray-700">
              企業URL
            </Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full text-lg"
            />
          </div>
          <Button type="submit" className="w-full text-lg h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300" disabled={loading}>
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                分析中...
              </div>
            ) : (
              "分析を開始"
            )}
          </Button>
        </form>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded"
            >
              <p className="font-bold">エラー</p>
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
        {companyData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 space-y-6" 
            ref={resultRef}
          >
            <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">{companyData.companyName}</h2>
            <Button onClick={handleCopyAll} className="w-full mb-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 transition-all duration-300">
              <Clipboard className="w-5 h-5 mr-2" />
              全体をコピー
            </Button>
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100">
                <CardTitle className="flex items-center text-2xl text-gray-800">
                  <Building2 className="w-6 h-6 mr-2 text-purple-600" />
                  会社概要
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center"><Building2 className="w-5 h-5 mr-2 text-gray-600" /><span className="font-medium">本社住所:</span> <span className="ml-2">{companyData['本社住所']}</span></div>
                  <div className="flex items-center"><Phone className="w-5 h-5 mr-2 text-gray-600" /><span className="font-medium">電話番号:</span> <span className="ml-2">{companyData['電話番号']}</span></div>
                  <div className="flex items-center"><User className="w-5 h-5 mr-2 text-gray-600" /><span className="font-medium">社長:</span> <span className="ml-2">{companyData['社長']}</span></div>
                  <div className="flex items-center"><Users className="w-5 h-5 mr-2 text-gray-600" /><span className="font-medium">従業員数:</span> <span className="ml-2">{companyData['従業員数']}</span></div>
                  <div className="flex items-center"><DollarSign className="w-5 h-5 mr-2 text-gray-600" /><span className="font-medium">売上:</span> <span className="ml-2">{companyData['売上']}</span></div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50">
                <Button onClick={() => handleCopy(`本社住所: ${companyData['本社住所']}\n電話番号: ${companyData['電話番号']}\n社長: ${companyData['社長']}\n従業員数: ${companyData['従業員数']}\n売上: ${companyData['売上']}`)} className="ml-auto bg-purple-500 hover:bg-purple-600">
                  <Clipboard className="w-4 h-4 mr-2" />
                  コピー
                </Button>
              </CardFooter>
            </Card>
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-100">
                <CardTitle className="flex items-center text-2xl text-gray-800">
                  <Briefcase className="w-6 h-6 mr-2 text-blue-600" />
                  事業内容
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {['事業１', '事業２', '事業３'].map((business, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow">
                      <h3 className="font-medium text-lg text-blue-700 mb-2">{companyData[business]}</h3>
                      <p className="text-gray-600">{companyData[`${business}の説明`]}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50">
                <Button onClick={() => handleCopy(`事業１: ${companyData['事業１']}\n${companyData['事業１の説明']}\n\n事業２: ${companyData['事業２']}\n${companyData['事業２の説明']}\n\n事業３: ${companyData['事業３']}\n${companyData['事業３の説明']}`)} className="ml-auto bg-blue-500 hover:bg-blue-600">
                  <Clipboard className="w-4 h-4 mr-2" />
                  コピー
                </Button>
              </CardFooter>
            </Card>
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-green-100 to-teal-100">
                <CardTitle className="flex items-center text-2xl text-gray-800">
                  <Users2 className="w-6 h-6 mr-2 text-green-600" />
                  主要クライアント
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="list-disc list-inside space-y-2">
                  {Array.isArray(companyData['クライアント']) && companyData['クライアント'].map((client, index) => (
                    <li key={index} className="text-gray-700">{client}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="bg-gray-50">
                <Button onClick={() => handleCopy(Array.isArray(companyData['クライアント']) ? companyData['クライアント'].join('\n') : '')} className="ml-auto bg-green-500 hover:bg-green-600">
                  <Clipboard className="w-4 h-4 mr-2" />
                  コピー
                </Button>
              </CardFooter>
            </Card>
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-yellow-100 to-orange-100">
                <CardTitle className="flex items-center text-2xl text-gray-800">
                  <Newspaper className="w-6 h-6 mr-2 text-yellow-600" />
                  最近のニュース
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {Array.isArray(companyData['最近のニュース']) && companyData['最近のニュース'].map((news, index) => (
                    <li key={index} className="bg-white p-3 rounded-lg shadow text-gray-700">{news}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="bg-gray-50">
                <Button onClick={() => handleCopy(Array.isArray(companyData['最近のニュース']) ? companyData['最近のニュース'].join('\n') : '')} className="ml-auto bg-yellow-500 hover:bg-yellow-600">
                  <Clipboard className="w-4 h-4 mr-2" />
                  コピー
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}