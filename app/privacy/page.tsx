
export const metadata = {
  title: 'Privacybeleid | Advies N Consultancy BV',
  description: 'Privacybeleid van Advies N Consultancy BV - Hoe wij uw persoonlijke gegevens beschermen en verwerken.'
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Privacybeleid</h1>
          <p className="text-xl text-muted-foreground">
            Hoe Advies N Consultancy BV uw persoonlijke gegevens beschermt en verwerkt
          </p>
        </div>

        <div className="space-y-8">
          <section className="bg-card p-6 rounded-lg border">
            <h2 className="text-2xl font-bold mb-4">1. Wie zijn wij?</h2>
            <p className="mb-4">
              Advies N Consultancy BV is een IT-consultancybedrijf gevestigd in Voorburg, Nederland. 
              Wij zijn verantwoordelijk voor de verwerking van uw persoonlijke gegevens zoals beschreven in dit privacybeleid.
            </p>
            <div className="bg-muted p-4 rounded">
              <h3 className="font-semibold mb-2">Contactgegevens:</h3>
              <p><strong>Bedrijfsnaam:</strong> Advies N Consultancy BV</p>
              <p><strong>E-mail:</strong> marc@adviesnconsultancy.nl</p>
              <p><strong>Website:</strong> adviesnconsultancy.nl</p>
            </div>
          </section>

          <section className="bg-card p-6 rounded-lg border">
            <h2 className="text-2xl font-bold mb-4">2. Welke gegevens verzamelen wij?</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Persoonlijke gegevens</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Naam en e-mailadres (bij QuickScan en contactformulieren)</li>
                  <li>Bedrijfsinformatie (bij vrijblijvende gesprekken)</li>
                  <li>Communicatiegegevens (bij contact via e-mail of telefoon)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Automatisch verzamelde gegevens</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>IP-adres (geanonimiseerd)</li>
                  <li>Browsertype en -versie</li>
                  <li>Paginabezoeken en navigatiepatronen</li>
                  <li>Tijd en datum van bezoek</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-card p-6 rounded-lg border">
            <h2 className="text-2xl font-bold mb-4">3. Uw rechten</h2>
            <p className="mb-4">
              Onder de AVG heeft u de volgende rechten met betrekking tot uw persoonlijke gegevens:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Recht van inzage</h3>
                <p className="text-sm">U kunt vragen welke gegevens wij van u verwerken</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Recht van rectificatie</h3>
                <p className="text-sm">U kunt vragen onjuiste gegevens te corrigeren</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Recht van vergetelheid</h3>
                <p className="text-sm">U kunt vragen uw gegevens te verwijderen</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Recht van overdraagbaarheid</h3>
                <p className="text-sm">U kunt vragen uw gegevens over te dragen</p>
              </div>
            </div>
          </section>

          <section className="bg-card p-6 rounded-lg border">
            <h2 className="text-2xl font-bold mb-4">4. Contact</h2>
            <p className="mb-4">
              Heeft u vragen over dit privacybeleid? Neem dan contact met ons op.
            </p>
            <div className="bg-muted p-4 rounded">
              <h3 className="font-semibold mb-2">Contactgegevens:</h3>
              <p><strong>E-mail:</strong> marc@adviesnconsultancy.nl</p>
              <p><strong>Reactietijd:</strong> Binnen 30 dagen</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-muted-foreground">
            © 2024 Advies N Consultancy BV. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
    </div>
  )
}
