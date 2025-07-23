
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function MicrosoftBookingsEmbed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Online Afspraak Plannen</CardTitle>
        <CardDescription>
          Selecteer een tijdstip dat u uitkomt voor een persoonlijk gesprek.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[600px] border rounded-lg overflow-hidden">
          <iframe
            src="https://outlook.office.com/bookwithme/user/d7de4a87e4164eed9a6ab6612a0cbc1a@adviesnconsultancy.nl?anonymous&ismsaljsauthenabled&ep=plink"
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title="Microsoft Bookings - Plan Afspraak"
          />
        </div>
      </CardContent>
    </Card>
  )
}
