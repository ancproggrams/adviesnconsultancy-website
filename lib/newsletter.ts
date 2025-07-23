

import { Resend } from 'resend'
import { NewsletterSubscriber, NewsletterSignupData } from './types'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export class NewsletterService {
  private static instance: NewsletterService
  
  public static getInstance(): NewsletterService {
    if (!NewsletterService.instance) {
      NewsletterService.instance = new NewsletterService()
    }
    return NewsletterService.instance
  }

  async subscribe(data: NewsletterSignupData): Promise<boolean> {
    try {
      if (!resend) {
        console.warn('Email service not configured, skipping email subscription')
        return false
      }
      // Add to Resend audience
      await resend.contacts.create({
        email: data.email,
        firstName: data.name || '',
        unsubscribed: false,
        audienceId: process.env.RESEND_AUDIENCE_ID || ''
      })

      return true
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      return false
    }
  }

  async unsubscribe(email: string): Promise<boolean> {
    try {
      if (!resend) return false
      await resend.contacts.remove({
        email,
        audienceId: process.env.RESEND_AUDIENCE_ID || ''
      })

      return true
    } catch (error) {
      console.error('Newsletter unsubscribe error:', error)
      return false
    }
  }

  async sendWelcomeEmail(subscriber: NewsletterSubscriber): Promise<boolean> {
    try {
      if (!resend) return false
      await resend.emails.send({
        from: 'Marc van der Meer <marc@adviesnconsultancy.nl>',
        to: [subscriber.email],
        subject: 'Welkom bij Advies N Consultancy - IT Expertise Newsletter',
        html: this.getWelcomeEmailTemplate(subscriber)
      })

      return true
    } catch (error) {
      console.error('Welcome email send error:', error)
      return false
    }
  }

  async sendNewsletter(
    subject: string,
    content: string,
    subscribers: NewsletterSubscriber[]
  ): Promise<boolean> {
    try {
      if (!resend) return false
      const emailPromises = subscribers.map(subscriber =>
        resend.emails.send({
          from: 'Marc van der Meer <marc@adviesnconsultancy.nl>',
          to: [subscriber.email],
          subject,
          html: this.getNewsletterTemplate(content, subscriber)
        })
      )

      await Promise.all(emailPromises)
      return true
    } catch (error) {
      console.error('Newsletter send error:', error)
      return false
    }
  }

  private getWelcomeEmailTemplate(subscriber: NewsletterSubscriber): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welkom bij Advies N Consultancy</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #60B5FF, #FF9149); color: white; padding: 30px; text-align: center; border-radius: 10px; }
            .content { background: white; padding: 30px; border-radius: 10px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; }
            .button { display: inline-block; background: #60B5FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welkom bij Advies N Consultancy!</h1>
              <p>Bedankt voor je inschrijving op onze IT expertise newsletter</p>
            </div>
            
            <div class="content">
              <p>Hallo ${subscriber.name || 'IT Professional'},</p>
              
              <p>Wat geweldig dat je je hebt ingeschreven voor onze maandelijkse newsletter! Je ontvangt nu:</p>
              
              <ul>
                <li>🔍 <strong>IT Trends & Inzichten</strong> - De laatste ontwikkelingen in IT landschap</li>
                <li>🛡️ <strong>Compliance Tips</strong> - Praktische adviezen voor AVG, NIS2, en meer</li>
                <li>📊 <strong>Case Studies</strong> - Real-world voorbeelden van IT transformaties</li>
                <li>🤖 <strong>AI & Automatisering</strong> - Hoe je AI effectief inzet in je organisatie</li>
                <li>📈 <strong>Business Continuity</strong> - Strategieën voor robuuste IT infrastructuur</li>
              </ul>
              
              <p>Als je vragen hebt over IT strategie, compliance, of business continuity, aarzel dan niet om contact op te nemen.</p>
              
              <a href="https://adviesnconsultancy.nl/kenniscentrum" class="button">Bezoek ons Kenniscentrum</a>
              
              <p>Met vriendelijke groet,<br>
              <strong>Marc van der Meer</strong><br>
              Advies N Consultancy BV</p>
            </div>
            
            <div class="footer">
              <p>Je kunt je op elk moment <a href="https://adviesnconsultancy.nl/unsubscribe?email=${subscriber.email}">uitschrijven</a></p>
              <p>Advies N Consultancy BV | marc@adviesnconsultancy.nl</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private getNewsletterTemplate(content: string, subscriber: NewsletterSubscriber): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Advies N Consultancy Newsletter</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #60B5FF, #FF9149); color: white; padding: 30px; text-align: center; border-radius: 10px; }
            .content { background: white; padding: 30px; border-radius: 10px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Advies N Consultancy Newsletter</h1>
              <p>IT Expertise & Compliance Inzichten</p>
            </div>
            
            <div class="content">
              <p>Hallo ${subscriber.name || 'IT Professional'},</p>
              
              ${content}
              
              <p>Met vriendelijke groet,<br>
              <strong>Marc van der Meer</strong><br>
              Advies N Consultancy BV</p>
            </div>
            
            <div class="footer">
              <p>Je kunt je op elk moment <a href="https://adviesnconsultancy.nl/unsubscribe?email=${subscriber.email}">uitschrijven</a></p>
              <p>Advies N Consultancy BV | marc@adviesnconsultancy.nl</p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}
