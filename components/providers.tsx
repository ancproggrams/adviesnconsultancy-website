

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // SERVER COMPONENT - NO CLIENT FUNCTIONALITY
  return (
    <div>
      {children}
    </div>
  )
}
