


'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  CheckCircle, 
  ArrowRight, 
  Shield, 
  BarChart, 
  AlertTriangle, 
  Settings,
  Download,
  Calendar,
  ExternalLink,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { quickScanQuestions, controlAreas, maturityLevels } from '@/lib/quick-scan-questions'

interface UserInfo {
  name: string
  email: string
  company: string
  phone: string
  position: string
}

interface QuestionResponse {
  questionId: number
  score: number
  value: string | boolean
  controlArea: string
}

export default function ComplianceAutomationPage() {
  const [step, setStep] = useState<'intro' | 'userInfo' | 'questions' | 'results'>('intro')
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    email: '',
    company: '',
    phone: '',
    position: ''
  })
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<QuestionResponse[]>([])
  const [results, setResults] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const features = [
    {
      icon: Shield,
      title: "ISO 22301 Compliance",
      description: "Volledig geautomatiseerde compliance monitoring volgens ISO 22301 standaarden."
    },
    {
      icon: BarChart,
      title: "Real-time Dashboard",
      description: "Live dashboards met KPI's en compliance status voor management rapportages."
    },
    {
      icon: AlertTriangle,
      title: "Risk Assessment",
      description: "Geautomatiseerde risicoanalyses en business impact assessments."
    },
    {
      icon: Settings,
      title: "Process Automation",
      description: "Automatiseer uw BCM processen en documentatie voor maximale efficiency."
    }
  ]

  const handleUserInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (userInfo.name && userInfo.email && userInfo.company) {
      setStep('questions')
    }
  }

  const handleAnswer = (answer: string | boolean, score: number) => {
    const currentQ = quickScanQuestions[currentQuestion]
    const response: QuestionResponse = {
      questionId: currentQ.id,
      score,
      value: answer,
      controlArea: currentQ.controlArea
    }

    const newResponses = [...responses, response]
    setResponses(newResponses)

    if (currentQuestion < quickScanQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      submitQuickScan(newResponses)
    }
  }

  const submitQuickScan = async (finalResponses: QuestionResponse[]) => {
    setIsSubmitting(true)
    
    try {
      // Get required answers
      const bcmOfficerResponse = finalResponses.find(r => r.questionId === 4)
      const crisisTeamResponse = finalResponses.find(r => r.questionId === 13)

      const response = await fetch('/api/quickscan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userInfo,
          hasBcmOfficer: bcmOfficerResponse?.value || false,
          hasCrisisTeam: crisisTeamResponse?.value || false,
          responses: finalResponses
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setResults(data.data)
        setStep('results')
      } else {
        alert('Er is een fout opgetreden. Probeer het opnieuw.')
      }
    } catch (error) {
      alert('Er is een fout opgetreden. Probeer het opnieuw.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const generatePDFReport = () => {
    // This would generate a PDF report - for now we'll show a placeholder
    alert('PDF rapport wordt gegenereerd en naar uw e-mail verzonden.')
  }

  const getMaturityDescription = (level: string) => {
    const maturity = Object.values(maturityLevels).find(m => m.level === level)
    return maturity?.description || 'Onbekend niveau'
  }

  if (step === 'intro') {
    return (
      <div className="min-h-screen py-12">
        <div className="container max-w-4xl">
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Compliance Automation Platform
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Automatiseer uw compliance processen en krijg real-time inzicht in uw 
              business continuity status met onze geavanceerde platform gebaseerd op ISO 22301.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Scan Section */}
          <div id="quickscan" className="bg-primary text-primary-foreground rounded-lg p-12 text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold">BCM Quick Scan</h2>
              <p className="text-lg opacity-90">
                Ontdek in 10 minuten waar uw organisatie staat op het gebied van 
                business continuity volgens ISO 22301. Inclusief persoonlijk rapport.
              </p>
              <div className="grid grid-cols-3 gap-8 my-8">
                <div className="space-y-2">
                  <div className="text-2xl font-bold">10</div>
                  <div className="text-sm opacity-90">Minuten</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">20</div>
                  <div className="text-sm opacity-90">Vragen</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm opacity-90">Gratis</div>
                </div>
              </div>
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-lg px-8 py-6"
                onClick={() => setStep('userInfo')}
              >
                Start BCM Quick Scan
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'userInfo') {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="container max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Uw Gegevens</CardTitle>
              <CardDescription>
                Om u een persoonlijk rapport te kunnen sturen, hebben we enkele gegevens nodig.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUserInfoSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Naam *</Label>
                    <Input
                      id="name"
                      required
                      value={userInfo.name}
                      onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                      placeholder="Uw volledige naam"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                      placeholder="uw.email@bedrijf.nl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Bedrijf *</Label>
                  <Input
                    id="company"
                    required
                    value={userInfo.company}
                    onChange={(e) => setUserInfo({ ...userInfo, company: e.target.value })}
                    placeholder="Uw bedrijfsnaam"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefoon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={userInfo.phone}
                      onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                      placeholder="+31 6 12345678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Functie</Label>
                    <Input
                      id="position"
                      value={userInfo.position}
                      onChange={(e) => setUserInfo({ ...userInfo, position: e.target.value })}
                      placeholder="Uw functietitel"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setStep('intro')}>
                    Terug
                  </Button>
                  <Button type="submit" className="flex-1 btn-primary">
                    Start Quick Scan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (step === 'questions') {
    const currentQ = quickScanQuestions[currentQuestion]
    const progress = ((currentQuestion + 1) / quickScanQuestions.length) * 100

    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="container max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline">
                  Vraag {currentQuestion + 1} van {quickScanQuestions.length}
                </Badge>
                <Badge variant="secondary">
                  {controlAreas[currentQ.controlArea as keyof typeof controlAreas]}
                </Badge>
              </div>
              <Progress value={progress} className="w-full mb-4" />
              <CardTitle className="text-xl flex items-center gap-2">
                {currentQ.isRequired && <span className="text-red-500">*</span>}
                {currentQ.text}
              </CardTitle>
              {currentQ.isRequired && (
                <CardDescription className="text-red-600">
                  Dit is een verplichte vraag voor de BCM Quick Scan
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {currentQ.type === 'boolean' ? (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full text-left justify-start h-auto p-4"
                    onClick={() => handleAnswer(true, 3)}
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Ja</span>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-left justify-start h-auto p-4"
                    onClick={() => handleAnswer(false, 1)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full border-2 border-red-600"></div>
                      <span>Nee</span>
                    </div>
                  </Button>
                </div>
              ) : (
                currentQ.options?.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full text-left justify-start h-auto p-4"
                    onClick={() => handleAnswer(option.value, option.score)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground mt-1 flex-shrink-0"></div>
                      <span>{option.text}</span>
                    </div>
                  </Button>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (step === 'results' && results) {
    return (
      <div className="min-h-screen py-12">
        <div className="container max-w-4xl">
          <div className="space-y-8">
            {/* Overall Results */}
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-3xl">Uw BCM Quick Scan Resultaten</CardTitle>
                <CardDescription className="text-lg">
                  Gebaseerd op ISO 22301 Business Continuity Management standaarden
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <div className="text-6xl font-bold text-primary">
                    {results.overallScore}/5
                  </div>
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {results.maturityLevel}
                    </Badge>
                    <p className="text-muted-foreground">
                      {getMaturityDescription(results.maturityLevel)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Scores per Control Area */}
            <Card>
              <CardHeader>
                <CardTitle>Scores per Controlegebied</CardTitle>
                <CardDescription>
                  Uw prestatie op elk van de 7 ISO 22301 controlegebieden
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(results.scores).map(([key, score]) => (
                    <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{controlAreas[key as keyof typeof controlAreas]}</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{score as number}/5</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-6 space-y-4">
                  <Download className="h-8 w-8 text-primary mx-auto" />
                  <div>
                    <h3 className="font-semibold">Download Rapport</h3>
                    <p className="text-sm text-muted-foreground">
                      Krijg een uitgebreid PDF rapport
                    </p>
                  </div>
                  <Button onClick={generatePDFReport} className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6 space-y-4">
                  <Calendar className="h-8 w-8 text-primary mx-auto" />
                  <div>
                    <h3 className="font-semibold">Plan Gesprek</h3>
                    <p className="text-sm text-muted-foreground">
                      Bespreek uw resultaten met expert
                    </p>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <a 
                      href="https://outlook.office.com/bookwithme/user/d7de4a87e4164eed9a6ab6612a0cbc1a@adviesnconsultancy.nl?anonymous&ismsaljsauthenabled&ep=plink"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Maak afspraak
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6 space-y-4">
                  <Shield className="h-8 w-8 text-primary mx-auto" />
                  <div>
                    <h3 className="font-semibold">Bekijk Diensten</h3>
                    <p className="text-sm text-muted-foreground">
                      Ontdek onze compliance oplossingen
                    </p>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/diensten">
                      Bekijk Diensten
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Additional Info */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold">Volgende Stappen</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Op basis van uw resultaten kunnen wij u helpen met het verbeteren van uw 
                    business continuity management. Plan een gratis adviesgesprek om te bespreken 
                    hoe u tot een hoger niveau kunt komen.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="btn-primary">
                      <Link href="/adviesgesprek">
                        Plan Adviesgesprek
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                      <Link href="/">
                        Terug naar Home
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (isSubmitting) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h3 className="text-lg font-semibold">Uw resultaten worden berekend...</h3>
          <p className="text-muted-foreground">Even geduld, wij analyseren uw antwoorden.</p>
        </div>
      </div>
    )
  }

  return null
}
