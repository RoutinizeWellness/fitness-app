"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function DatabaseDebugPage() {
  const { user } = useAuth()
  const [dbStructure, setDbStructure] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [directCheckResult, setDirectCheckResult] = useState<any>(null)
  const [isDirectCheckLoading, setIsDirectCheckLoading] = useState(false)

  const checkDatabaseStructure = async () => {
    if (!user) {
      setDbStructure({
        error: 'No user found. Please log in first.'
      })
      return
    }

    try {
      setIsLoading(true)
      setDbStructure(null)

      const response = await fetch('/api/database/structure', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      console.log('Database structure check result:', result)
      setDbStructure(result)
    } catch (error) {
      console.error('Error checking database structure:', error)
      setDbStructure({
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setIsLoading(false)
    }
  }

  const performDirectCheck = async () => {
    if (!user) {
      setDirectCheckResult({
        error: 'No user found. Please log in first.'
      })
      return
    }

    try {
      setIsDirectCheckLoading(true)
      setDirectCheckResult(null)

      // Try to query the profiles table directly
      const response = await fetch('/api/profile/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          profile: {
            fullName: 'Database Test User',
            level: 'beginner',
            onboardingCompleted: false,
            experienceLevel: 'beginner',
            interfaceMode: 'beginner'
          }
        }),
      })

      const result = await response.json()
      console.log('Direct check result:', result)
      setDirectCheckResult({
        success: response.ok,
        status: response.status,
        data: result
      })
    } catch (error) {
      console.error('Error performing direct check:', error)
      setDirectCheckResult({
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setIsDirectCheckLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Database Structure Debug</h1>

      <Card className="w-full max-w-4xl mx-auto mb-8">
        <CardHeader>
          <CardTitle>Database Structure Check</CardTitle>
          <CardDescription>
            Herramienta para verificar la estructura de la base de datos y diagnosticar problemas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Estado Actual</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Usuario:</span>{" "}
                  {user ? (
                    <span className="text-green-600">{user.id} ({user.email})</span>
                  ) : (
                    <span className="text-red-600">No autenticado</span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Acciones</h3>
              <div className="space-y-2">
                <Button
                  onClick={checkDatabaseStructure}
                  variant="default"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando estructura...
                    </>
                  ) : (
                    "Verificar Estructura de BD"
                  )}
                </Button>
                <Button
                  onClick={performDirectCheck}
                  variant="outline"
                  className="w-full"
                  disabled={isDirectCheckLoading}
                >
                  {isDirectCheckLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Realizando prueba directa...
                    </>
                  ) : (
                    "Realizar Prueba Directa"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {dbStructure && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Resultados de la Verificación</h3>

              {dbStructure.error ? (
                <Alert variant="destructive">
                  <AlertTitle className="flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Error
                  </AlertTitle>
                  <AlertDescription>
                    {dbStructure.error}
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <Alert variant={dbStructure.profilesTable?.exists ? "default" : "destructive"}>
                    <AlertTitle className="flex items-center">
                      {dbStructure.profilesTable?.exists ? (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 mr-2" />
                      )}
                      Tabla de Perfiles
                    </AlertTitle>
                    <AlertDescription>
                      {dbStructure.profilesTable?.exists
                        ? "La tabla de perfiles existe en la base de datos"
                        : "La tabla de perfiles no existe en la base de datos"}
                    </AlertDescription>
                  </Alert>

                  {dbStructure.profilesTable?.exists && dbStructure.columns?.data && (
                    <div>
                      <h4 className="text-md font-medium mb-2">Columnas de la Tabla</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Tipo de Dato</TableHead>
                            <TableHead>Nullable</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dbStructure.columns.data.map((column, index) => (
                            <TableRow key={index}>
                              <TableCell>{column.column_name}</TableCell>
                              <TableCell>{column.data_type}</TableCell>
                              <TableCell>{column.is_nullable ? "Sí" : "No"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {dbStructure.profilesTable?.exists && dbStructure.policies?.data && (
                    <div>
                      <h4 className="text-md font-medium mb-2">Políticas RLS</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Comando</TableHead>
                            <TableHead>Roles</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dbStructure.policies.data.map((policy, index) => (
                            <TableRow key={index}>
                              <TableCell>{policy.policyname}</TableCell>
                              <TableCell>{policy.cmd}</TableCell>
                              <TableCell>{policy.roles.join(', ')}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </>
              )}

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="details">
                  <AccordionTrigger>Detalles Técnicos</AccordionTrigger>
                  <AccordionContent>
                    <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-xs">
                      {JSON.stringify(dbStructure, null, 2)}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {directCheckResult && (
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-medium">Resultado de Prueba Directa</h3>

              <Alert variant={directCheckResult.success ? "default" : "destructive"}>
                <AlertTitle className="flex items-center">
                  {directCheckResult.success ? (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  )}
                  Prueba Directa
                </AlertTitle>
                <AlertDescription>
                  {directCheckResult.success
                    ? "La prueba directa fue exitosa"
                    : directCheckResult.error || "La prueba directa falló"}
                </AlertDescription>
              </Alert>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="direct-details">
                  <AccordionTrigger>Detalles Técnicos</AccordionTrigger>
                  <AccordionContent>
                    <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-xs">
                      {JSON.stringify(directCheckResult, null, 2)}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-gray-500">
          Esta herramienta es solo para depuración y no debe estar disponible en producción.
        </CardFooter>
      </Card>
    </div>
  )
}
