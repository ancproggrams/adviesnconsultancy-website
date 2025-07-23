
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    if (!resend) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { email, name, sendCopyToAdmin, results, recommendations } = body

    // Create HTML email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; margin-bottom: 10px;">Uw Compliance Readiness Rapport</h1>
          <p style="color: #666; font-size: 16px;">Advies N Consultancy BV</p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #1e40af; text-align: center; margin-bottom: 20px;">Uw Resultaten</h2>
          
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 48px; font-weight: bold; color: #3b82f6; margin-bottom: 10px;">
              ${results.totalPercentage}%
            </div>
            <div style="margin-bottom: 10px;">
              <div style="font-size: 28px; font-weight: bold; color: #374151;">
                Niveau ${results.maturityLevelNumber}/5
              </div>
              <div style="font-size: 16px; color: #6b7280;">
                ${results.maturityLevelDescription}
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #1e40af; margin-bottom: 15px;">Scores per Categorie</h3>
            ${Object.entries(results.categoryScores).map(([category, score]: [string, any]) => `
              <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                  <span style="font-weight: 500;">${category}</span>
                  <span style="color: #3b82f6; font-weight: 600;">${score.percentage}%</span>
                </div>
                <div style="background: #e5e7eb; height: 8px; border-radius: 4px;">
                  <div style="background: #3b82f6; height: 100%; width: ${score.percentage}%; border-radius: 4px;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1e40af; margin-bottom: 15px;">Persoonlijke Aanbevelingen</h3>
          <ul style="color: #374151; line-height: 1.6;">
            ${recommendations.map((rec: string) => `<li style="margin-bottom: 8px;">${rec}</li>`).join('')}
          </ul>
        </div>
        
        <div style="background: #3b82f6; color: white; padding: 20px; border-radius: 8px; text-align: center;">
          <h3 style="margin-bottom: 10px;">Wilt u meer weten?</h3>
          <p style="margin-bottom: 15px;">Plan een gratis adviesgesprek met onze experts.</p>
          <a href="https://outlook.office.com/bookwithme/user/d7de4a87e4164eed9a6ab6612a0cbc1a@adviesnconsultancy.nl?anonymous&ismsaljsauthenabled&ep=plink" 
             style="display: inline-block; background: white; color: #3b82f6; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: 600;">
            Plan Adviesgesprek
          </a>
        </div>
        
        <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
          <p>Advies N Consultancy BV</p>
          <p>info@adviesnconsultancy.nl | +31 (0) 20 123 4567</p>
        </div>
      </div>
    `

    // Send email to user
    await resend.emails.send({
      from: 'Advies N Consultancy BV <noreply@adviesnconsultancy.nl>',
      to: [email],
      subject: 'Uw Compliance Readiness Rapport',
      html: htmlContent
    })

    // Send copy to admin if requested
    if (sendCopyToAdmin) {
      await resend.emails.send({
        from: 'Advies N Consultancy BV <noreply@adviesnconsultancy.nl>',
        to: ['marc@adviesnconsultancy.nl'],
        subject: `Quick Scan Resultaat - ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Nieuwe Quick Scan Resultaat</h2>
            <p><strong>Naam:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Score:</strong> ${results.totalPercentage}%</p>
            <p><strong>Volwassenheidsniveau:</strong> Niveau ${results.maturityLevelNumber}/5 - ${results.maturityLevelDescription}</p>
            <hr>
            ${htmlContent}
          </div>
        `
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
