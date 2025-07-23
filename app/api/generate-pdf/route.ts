
import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { results, recommendations, userName, userEmail } = body

    // Create HTML template with professional layout inspired by the uploaded design
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 297mm;
            position: relative;
          }
          
          /* Geometric decorative elements */
          .geometric-decoration {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            overflow: hidden;
          }
          
          .geometric-decoration::before {
            content: '';
            position: absolute;
            top: -50px;
            right: -50px;
            width: 300px;
            height: 300px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            transform: rotate(45deg);
          }
          
          .geometric-decoration::after {
            content: '';
            position: absolute;
            bottom: -50px;
            left: -50px;
            width: 200px;
            height: 200px;
            background: rgba(255, 255, 255, 0.05);
            clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          }
          
          .container {
            background: white;
            margin: 20mm;
            padding: 30mm;
            min-height: 250mm;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            position: relative;
            z-index: 1;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
          }
          
          .header h1 {
            color: #1e40af;
            font-size: 36px;
            margin: 0 0 10px 0;
            font-weight: 700;
          }
          
          .header h2 {
            color: #3b82f6;
            font-size: 18px;
            margin: 0;
            font-weight: 400;
          }
          
          .company-info {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 30px;
          }
          
          .score-section {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 40px;
            border: 2px solid #e2e8f0;
          }
          
          .main-score {
            font-size: 72px;
            font-weight: 700;
            color: #3b82f6;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(59, 130, 246, 0.1);
          }
          
          .maturity-level {
            font-size: 32px;
            font-weight: 600;
            color: #1e40af;
            margin: 10px 0;
          }
          
          .maturity-description {
            font-size: 16px;
            color: #6b7280;
            margin: 0;
          }
          
          .categories-section {
            margin-bottom: 40px;
          }
          
          .section-title {
            font-size: 24px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 20px;
            border-left: 4px solid #3b82f6;
            padding-left: 15px;
          }
          
          .category-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            margin-bottom: 12px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }
          
          .category-name {
            font-weight: 600;
            color: #374151;
            font-size: 16px;
          }
          
          .category-score {
            font-weight: 700;
            color: #3b82f6;
            font-size: 18px;
          }
          
          .progress-bar {
            width: 100%;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            margin-top: 8px;
            overflow: hidden;
          }
          
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #1d4ed8);
            border-radius: 4px;
            transition: width 0.3s ease;
          }
          
          .recommendations-section {
            margin-bottom: 40px;
          }
          
          .recommendation-item {
            display: flex;
            align-items: flex-start;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .recommendation-item:last-child {
            border-bottom: none;
          }
          
          .check-icon {
            width: 20px;
            height: 20px;
            background: #3b82f6;
            border-radius: 50%;
            margin-right: 12px;
            margin-top: 2px;
            flex-shrink: 0;
            position: relative;
          }
          
          .check-icon::after {
            content: '✓';
            color: white;
            font-size: 12px;
            font-weight: bold;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
          
          .recommendation-text {
            color: #374151;
            line-height: 1.6;
            font-size: 14px;
          }
          
          .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
          }
          
          .cta-section {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            margin: 30px 0;
          }
          
          .cta-section h3 {
            margin: 0 0 10px 0;
            font-size: 20px;
          }
          
          .cta-section p {
            margin: 0 0 15px 0;
            font-size: 14px;
            opacity: 0.9;
          }
          
          .cta-button {
            background: white;
            color: #3b82f6;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
            font-size: 14px;
          }
          
          .user-info {
            background: #f1f5f9;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #3b82f6;
          }
          
          .user-info h3 {
            margin: 0 0 10px 0;
            color: #1e40af;
            font-size: 18px;
          }
          
          .user-details {
            color: #374151;
            font-size: 14px;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="geometric-decoration"></div>
        <div class="container">
          <div class="header">
            <h1>Compliance Readiness Rapport</h1>
            <h2>Quick Scan Resultaten</h2>
          </div>
          
          <div class="company-info">
            <strong>Advies N Consultancy BV</strong><br>
            Professionele compliance consultancy
          </div>
          
          <div class="user-info">
            <h3>Rapport voor:</h3>
            <div class="user-details">
              <strong>Naam:</strong> ${userName}<br>
              <strong>E-mail:</strong> ${userEmail}<br>
              <strong>Datum:</strong> ${new Date().toLocaleDateString('nl-NL')}
            </div>
          </div>
          
          <div class="score-section">
            <div class="main-score">${results.totalPercentage}%</div>
            <div class="maturity-level">Niveau ${results.maturityLevelNumber}/5</div>
            <div class="maturity-description">${results.maturityLevelDescription}</div>
          </div>
          
          <div class="categories-section">
            <h3 class="section-title">Scores per Categorie</h3>
            ${Object.entries(results.categoryScores).map(([category, score]: [string, any]) => `
              <div class="category-item">
                <div>
                  <div class="category-name">${category}</div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${score.percentage}%"></div>
                  </div>
                </div>
                <div class="category-score">${score.percentage}%</div>
              </div>
            `).join('')}
          </div>
          
          <div class="recommendations-section">
            <h3 class="section-title">Persoonlijke Aanbevelingen</h3>
            ${recommendations.map((rec: string) => `
              <div class="recommendation-item">
                <div class="check-icon"></div>
                <div class="recommendation-text">${rec}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="cta-section">
            <h3>Wilt u meer weten?</h3>
            <p>Plan een gratis adviesgesprek met onze experts voor gepersonaliseerd advies.</p>
            <div class="cta-button">
              Bezoek: outlook.office.com/bookwithme/user/d7de4a87e4164eed9a6ab6612a0cbc1a@adviesnconsultancy.nl
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Advies N Consultancy BV</strong></p>
            <p>info@adviesnconsultancy.nl | +31 (0) 20 123 4567</p>
            <p>© ${new Date().getFullYear()} Advies N Consultancy BV. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    await page.setContent(htmlContent)
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        bottom: '0mm',
        left: '0mm',
        right: '0mm'
      }
    })
    
    await browser.close()

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="QuickScan-Rapport.pdf"'
      }
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
