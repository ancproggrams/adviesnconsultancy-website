
'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { ChevronLeft, ChevronRight, Download, Mail, CheckCircle, RotateCcw, AlertCircle, Zap, TrendingUp } from 'lucide-react'
import { quickScanQuestions } from '@/lib/quick-scan-questions'
import analytics from '@/lib/analytics'
import abTesting from '@/lib/ab-testing'
import leadScoring from '@/lib/lead-scoring'

interface Answer {
  questionId: number
  value: string | number
  score: number
}

interface CategoryScore {
  [key: string]: {
    score: number
    maxScore: number
    percentage: number
  }
}

interface QuickScanProgress {
  currentQuestion: number
  answers: Answer[]
  isCompleted: boolean
  userEmail: string
  userName: string
  sendCopyToAdmin: boolean
  timestamp: number
}

// localStorage utilities
const STORAGE_KEY = 'quickscan_progress'

const saveProgress = (data: QuickScanProgress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn('Could not save progress to localStorage:', error)
  }
}

const loadProgress = (): QuickScanProgress | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      // Verify the data structure is valid
      if (data && typeof data.currentQuestion === 'number' && Array.isArray(data.answers)) {
        return data
      }
    }
  } catch (error) {
    console.warn('Could not load progress from localStorage:', error)
  }
  return null
}

const clearProgress = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Could not clear progress from localStorage:', error)
  }
}

export function QuickScanComponent() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [sendCopyToAdmin, setSendCopyToAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false)
  const [showProgressNotification, setShowProgressNotification] = useState(false)
  const [abTestVariant, setAbTestVariant] = useState<string>('control')
  const [abTestConfig, setAbTestConfig] = useState<any>({})
  const [scanStartTime, setScanStartTime] = useState<number>(0)
  const { toast } = useToast()
  const reportRef = useRef<HTMLDivElement>(null)

  const totalQuestions = quickScanQuestions.length
  const progress = ((currentQuestion + 1) / totalQuestions) * 100

  // Load saved progress and initialize A/B testing on component mount
  useEffect(() => {
    // Initialize A/B testing
    const variant = abTesting.getQuickScanVariant()
    const config = abTesting.getQuickScanConfig()
    setAbTestVariant(variant)
    setAbTestConfig(config)
    
    // Track scan start
    setScanStartTime(Date.now())
    analytics.trackQuickScanStart(variant)
    leadScoring.processActivity('quick_scan_start', undefined, {
      variant,
      timestamp: new Date().toISOString()
    })
    
    const savedProgress = loadProgress()
    if (savedProgress) {
      const timeDiff = Date.now() - savedProgress.timestamp
      // Only load progress if saved within last 24 hours
      if (timeDiff < 24 * 60 * 60 * 1000) {
        setCurrentQuestion(savedProgress.currentQuestion)
        setAnswers(savedProgress.answers)
        setIsCompleted(savedProgress.isCompleted)
        setUserEmail(savedProgress.userEmail || '')
        setUserName(savedProgress.userName || '')
        setSendCopyToAdmin(savedProgress.sendCopyToAdmin || false)
        setHasLoadedProgress(true)
        setShowProgressNotification(!savedProgress.isCompleted)
        
        if (!savedProgress.isCompleted) {
          toast({
            title: 'Voortgang geladen',
            description: `U bent verder gegaan bij vraag ${savedProgress.currentQuestion + 1} van ${totalQuestions}.`,
          })
        }
      } else {
        // Clear old progress
        clearProgress()
      }
    }
  }, [])

  // Auto-save progress whenever state changes
  useEffect(() => {
    if (hasLoadedProgress || currentQuestion > 0 || answers.length > 0) {
      const progressData: QuickScanProgress = {
        currentQuestion,
        answers,
        isCompleted,
        userEmail,
        userName,
        sendCopyToAdmin,
        timestamp: Date.now()
      }
      saveProgress(progressData)
    }
  }, [currentQuestion, answers, isCompleted, userEmail, userName, sendCopyToAdmin, hasLoadedProgress])

  const handleAnswer = (value: string | number) => {
    const question = quickScanQuestions[currentQuestion]
    let score = 0

    if (question.type === 'multiple-choice') {
      const option = question.options?.find(opt => opt.value === value)
      score = option?.score || 0
    } else if (question.type === 'number') {
      const numValue = Number(value)
      const scoring = question.scoring?.find(s => numValue >= s.threshold)
      score = scoring?.score || 0
    }

    const newAnswer: Answer = {
      questionId: question.id,
      value,
      score
    }

    setAnswers(prev => {
      const existingIndex = prev.findIndex(a => a.questionId === question.id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = newAnswer
        return updated
      }
      return [...prev, newAnswer]
    })
  }

  const getCurrentAnswer = () => {
    return answers.find(a => a.questionId === quickScanQuestions[currentQuestion]?.id)
  }

  const nextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      const newQuestion = currentQuestion + 1
      setCurrentQuestion(newQuestion)
      
      // Track progress
      analytics.trackQuickScanProgress(newQuestion + 1, totalQuestions)
      leadScoring.processActivity('quick_scan_progress', undefined, {
        questionNumber: newQuestion + 1,
        totalQuestions,
        progress: Math.round(((newQuestion + 1) / totalQuestions) * 100),
        variant: abTestVariant
      })
    } else {
      completeQuiz()
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const completeQuiz = () => {
    setIsCompleted(true)
    
    // Calculate completion time
    const completionTime = scanStartTime > 0 ? Date.now() - scanStartTime : 0
    
    // Calculate results for tracking
    const results = calculateResults()
    
    // Track completion
    analytics.trackQuickScanComplete(results)
    leadScoring.processActivity('quick_scan_complete', undefined, {
      totalScore: results.totalPercentage,
      maturityLevel: results.maturityLevelNumber,
      completionTime,
      variant: abTestVariant,
      categoryScores: results.categoryScores
    })
    
    // Record A/B test conversion
    abTesting.recordQuickScanConversion(undefined, results)
    
    // Clear saved progress when quiz is completed
    setTimeout(() => {
      clearProgress()
    }, 1000)
  }

  const restartScan = () => {
    setCurrentQuestion(0)
    setAnswers([])
    setIsCompleted(false)
    setUserEmail('')
    setUserName('')
    setSendCopyToAdmin(false)
    setShowProgressNotification(false)
    clearProgress()
    toast({
      title: 'Scan opnieuw gestart',
      description: 'Alle voortgang is gewist. U kunt opnieuw beginnen.',
    })
  }

  const calculateResults = () => {
    const categoryScores: CategoryScore = {}
    let totalScore = 0
    let maxTotalScore = 0

    quickScanQuestions.forEach(question => {
      const answer = answers.find(a => a.questionId === question.id)
      const score = answer?.score || 0
      const maxScore = question.type === 'multiple-choice' 
        ? Math.max(...(question.options?.map(opt => opt.score) || [0]))
        : Math.max(...(question.scoring?.map(s => s.score) || [0]))

      totalScore += score
      maxTotalScore += maxScore

      if (!categoryScores[question.category]) {
        categoryScores[question.category] = {
          score: 0,
          maxScore: 0,
          percentage: 0
        }
      }

      categoryScores[question.category].score += score
      categoryScores[question.category].maxScore += maxScore
    })

    // Calculate percentages
    Object.keys(categoryScores).forEach(category => {
      const cat = categoryScores[category]
      cat.percentage = Math.round((cat.score / cat.maxScore) * 100)
    })

    const totalPercentage = Math.round((totalScore / maxTotalScore) * 100)
    
    // Calculate maturity level from 1 to 5
    let maturityLevelNumber = 1
    let maturityLevelDescription = 'Zeer laag volwassenheidsniveau'
    
    if (totalPercentage >= 81) {
      maturityLevelNumber = 5
      maturityLevelDescription = 'Zeer hoog volwassenheidsniveau'
    } else if (totalPercentage >= 61) {
      maturityLevelNumber = 4
      maturityLevelDescription = 'Hoog volwassenheidsniveau'
    } else if (totalPercentage >= 41) {
      maturityLevelNumber = 3
      maturityLevelDescription = 'Gemiddeld volwassenheidsniveau'
    } else if (totalPercentage >= 21) {
      maturityLevelNumber = 2
      maturityLevelDescription = 'Laag volwassenheidsniveau'
    }

    return {
      totalScore,
      maxTotalScore,
      totalPercentage,
      maturityLevelNumber,
      maturityLevelDescription,
      categoryScores
    }
  }

  const getRecommendations = (results: ReturnType<typeof calculateResults>) => {
    const recommendations = []

    if (results.totalPercentage < 30) {
      recommendations.push('Start met het ontwikkelen van een basis business continuity plan')
      recommendations.push('Implementeer basisprocessen voor risk management')
      recommendations.push('Zorg voor documentatie van kritieke bedrijfsprocessen')
    } else if (results.totalPercentage < 60) {
      recommendations.push('Verbeter incident response procedures')
      recommendations.push('Implementeer regelmatige backup tests')
      recommendations.push('Ontwikkel communicatieplannen voor crisis situaties')
    } else if (results.totalPercentage < 80) {
      recommendations.push('Optimaliseer recovery time objectives (RTO)')
      recommendations.push('Implementeer geautomatiseerde monitoring')
      recommendations.push('Voer regelmatige BCP oefeningen uit')
    } else {
      recommendations.push('Blijf innoveren met nieuwe technologieën')
      recommendations.push('Deel best practices met de industrie')
      recommendations.push('Mentor andere organisaties in BC excellence')
    }

    return recommendations
  }

  const handleDownloadPDF = async () => {
    if (!userEmail || !userName) {
      toast({
        title: 'Ontbrekende gegevens',
        description: 'Vul uw naam en e-mailadres in om de PDF te downloaden.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const results = calculateResults()
      const recommendations = getRecommendations(results)

      // Track lead capture
      analytics.trackLeadCapture(userEmail, userName, 'quickscan_pdf')
      leadScoring.processActivity('email_capture', undefined, {
        email: userEmail,
        name: userName,
        source: 'quickscan_pdf'
      })

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          results,
          recommendations,
          userName,
          userEmail
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'QuickScan-Rapport.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      // Track download
      analytics.trackDownload('QuickScan-Rapport.pdf', 'pdf')
      leadScoring.processActivity('file_download', undefined, {
        fileName: 'QuickScan-Rapport.pdf',
        fileType: 'pdf',
        source: 'quickscan'
      })
      
      toast({
        title: 'PDF Downloaded!',
        description: 'Uw professionele rapport is succesvol gedownload.',
      })
    } catch (error) {
      toast({
        title: 'Download Error',
        description: 'Er ging iets mis bij het downloaden van het rapport.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!userEmail || !userName) {
      toast({
        title: 'Ontbrekende gegevens',
        description: 'Vul uw naam en e-mailadres in om het rapport te versturen.',
        variant: 'destructive',
      })
      return
    }

    if (!reportRef.current) return

    setIsLoading(true)
    try {
      const results = calculateResults()
      const recommendations = getRecommendations(results)

      // Track lead capture
      analytics.trackLeadCapture(userEmail, userName, 'quickscan_email')
      leadScoring.processActivity('email_capture', undefined, {
        email: userEmail,
        name: userName,
        source: 'quickscan_email'
      })

      // Send email directly
      const emailResponse = await fetch('/api/send-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          name: userName,
          sendCopyToAdmin,
          results: results,
          recommendations: recommendations
        }),
      })

      if (emailResponse.ok) {
        // Track form submission
        analytics.trackFormSubmission('quickscan_email', {
          email: userEmail,
          name: userName,
          sendCopyToAdmin
        })
        leadScoring.processActivity('form_submit', undefined, {
          formType: 'quickscan_email',
          email: userEmail,
          name: userName
        })
        
        toast({
          title: 'E-mail verzonden!',
          description: 'Uw rapport is succesvol verstuurd naar uw e-mailadres.',
        })
      } else {
        throw new Error('Failed to send email')
      }
    } catch (error) {
      toast({
        title: 'Verzending mislukt',
        description: 'Er ging iets mis bij het versturen van het rapport.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isCompleted) {
    const results = calculateResults()
    const recommendations = getRecommendations(results)

    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              <span>Quick Scan Voltooid!</span>
            </CardTitle>
            <CardDescription>
              Hieronder vindt u uw persoonlijke compliance rapport.
            </CardDescription>
          </CardHeader>
        </Card>

        <div ref={reportRef} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Uw Compliance Readiness Rapport</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold text-primary">{results.totalPercentage}%</div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-foreground">
                    Niveau {results.maturityLevelNumber}/5
                  </div>
                  <div className="text-lg text-muted-foreground">
                    {results.maturityLevelDescription}
                  </div>
                </div>
                <Progress value={results.totalPercentage} className="w-full max-w-md mx-auto" />
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Scores per Categorie</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(results.categoryScores).map(([category, score]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{category}</span>
                        <span className="text-primary font-semibold">{score.percentage}%</span>
                      </div>
                      <Progress value={score.percentage} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Persoonlijke Aanbevelingen</h3>
                <ul className="space-y-2">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rapport Acties</CardTitle>
            <CardDescription>
              Download of verstuur uw rapport per e-mail.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userName">Naam *</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Uw naam"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userEmail">E-mail *</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="uw@email.nl"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendCopy"
                checked={sendCopyToAdmin}
                onCheckedChange={(checked) => setSendCopyToAdmin(checked as boolean)}
              />
              <Label htmlFor="sendCopy" className="text-sm">
                Ik ga ermee akkoord dat een kopie van dit rapport naar Advies N Consultancy BV wordt gestuurd.
              </Label>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleDownloadPDF}
                disabled={isLoading}
                className="btn-primary flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                {isLoading ? 'Bezig...' : 'Download als PDF'}
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={isLoading || !userEmail || !userName}
                variant="outline"
                className="flex-1"
              >
                <Mail className="mr-2 h-4 w-4" />
                {isLoading ? 'Verzenden...' : 'Verstuur per E-mail'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const question = quickScanQuestions[currentQuestion]
  const currentAnswer = getCurrentAnswer()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {showProgressNotification && !isCompleted && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="font-medium text-primary">
                  Voortgang hersteld
                </p>
                <p className="text-sm text-muted-foreground">
                  We hebben uw vorige voortgang hersteld. U kunt verder gaan waar u gebleven was of opnieuw beginnen.
                </p>
                <Button
                  onClick={restartScan}
                  variant="outline"
                  size="sm"
                  className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <RotateCcw className="mr-2 h-3 w-3" />
                  Opnieuw beginnen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              Vraag {currentQuestion + 1} van {totalQuestions}
            </CardTitle>
            <div className="text-right">
              {abTestConfig.showCategoryLabels !== false && (
                <span className="text-sm text-muted-foreground block">
                  {question?.category}
                </span>
              )}
              {(hasLoadedProgress || answers.length > 0) && (
                <span className="text-xs text-primary/70">
                  ● Automatisch opgeslagen
                </span>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {abTestConfig.progressIndicator === 'step_indicator' ? (
              <div className="flex justify-between items-center mb-2">
                {Array.from({ length: totalQuestions }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i <= currentQuestion ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            ) : (
              <Progress value={progress} className="w-full" />
            )}
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Voortgang: {Math.round(progress)}%
              </span>
              {currentQuestion > 0 && (
                <Button
                  onClick={restartScan}
                  variant="ghost"
                  size="sm"
                  className="text-xs h-auto p-1 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="mr-1 h-3 w-3" />
                  Opnieuw beginnen
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">{question?.text}</h3>
            
            {question?.type === 'multiple-choice' && (
              <RadioGroup
                value={currentAnswer?.value?.toString() || ''}
                onValueChange={(value) => handleAnswer(value)}
              >
                {question.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {question?.type === 'number' && (
              <div className="space-y-2">
                <Label htmlFor="numberInput">Uw antwoord</Label>
                <Input
                  id="numberInput"
                  type="number"
                  value={currentAnswer?.value?.toString() || ''}
                  onChange={(e) => handleAnswer(Number(e.target.value))}
                  placeholder="Voer een getal in"
                />
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              variant="outline"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Vorige
            </Button>
            <Button
              onClick={nextQuestion}
              disabled={!currentAnswer}
              className={`btn-primary ${abTestConfig.style === 'enhanced' ? 'shadow-lg transform hover:scale-105 transition-all duration-200' : ''}`}
            >
              {currentQuestion === totalQuestions - 1 ? 'Voltooi Scan' : (abTestConfig.ctaText || 'Volgende')}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
