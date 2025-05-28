import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Página no encontrada
          </CardTitle>
          <CardDescription className="text-gray-600">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-6xl font-bold text-gray-300 mb-4">
            404
          </div>
          
          <div className="space-y-3">
            <Link href="/" className="block">
              <Button className="w-full" variant="default">
                <Home className="w-4 h-4 mr-2" />
                Ir al inicio
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver atrás
            </Button>
          </div>
          
          <div className="text-sm text-gray-500 mt-6">
            Si crees que esto es un error, por favor{' '}
            <Link href="/contact" className="text-blue-600 hover:underline">
              contáctanos
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
