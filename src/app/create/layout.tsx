import { Header } from '@/components/layout'

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {children}
    </div>
  )
}
