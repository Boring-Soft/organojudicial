'use client'

import { useState } from 'react'
import { Upload, Download, AlertCircle, CheckCircle2, Loader2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { RolUsuario } from '@prisma/client'

interface CargaMasivaUsuariosProps {
  onSuccess: () => void
}

interface UsuarioCSV {
  ci: string
  nombres: string
  apellidos: string
  email: string
  telefono: string
  password: string
  juzgado?: string
  materia?: string
  registroAbogado?: string
}

/**
 * Componente para carga masiva de usuarios desde CSV
 */
export default function CargaMasivaUsuarios({ onSuccess }: CargaMasivaUsuariosProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [rol, setRol] = useState<RolUsuario | ''>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<{
    success: number
    errors: string[]
  } | null>(null)

  // Descargar plantilla CSV
  const downloadTemplate = () => {
    const templates: Record<RolUsuario, string[]> = {
      SECRETARIO: [
        'ci,nombres,apellidos,email,telefono,password,juzgado',
        '12345678-LP,Juan,Pérez,juan.perez@juzgado.gob.bo,+59170123456,Password123,Juzgado 1° Civil',
      ],
      JUEZ: [
        'ci,nombres,apellidos,email,telefono,password,juzgado,materia',
        '87654321-CB,María,López,maria.lopez@juzgado.gob.bo,+59171234567,Password123,Juzgado 2° Partido,Civil',
      ],
      ABOGADO: [
        'ci,nombres,apellidos,email,telefono,password,registroAbogado',
        '11223344-SC,Pedro,García,pedro.garcia@abogado.com,+59172345678,Password123,LP-12345',
      ],
      CIUDADANO: [
        'ci,nombres,apellidos,email,telefono,password',
        '99887766-LP,Ana,Martínez,ana.martinez@example.com,+59173456789,Password123',
      ],
    }

    if (!rol) return

    const csvContent = templates[rol as RolUsuario].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `plantilla_${rol.toLowerCase()}.csv`
    link.click()
  }

  // Manejar selección de archivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setError('Por favor selecciona un archivo CSV válido')
        return
      }
      setSelectedFile(file)
      setError(null)
      setResults(null)
    }
  }

  // Parsear CSV
  const parseCSV = (text: string): UsuarioCSV[] => {
    const lines = text.split('\n').filter((line) => line.trim())
    const headers = lines[0].split(',').map((h) => h.trim())
    const data: UsuarioCSV[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim())
      const usuario: any = {}

      headers.forEach((header, index) => {
        usuario[header] = values[index]
      })

      data.push(usuario as UsuarioCSV)
    }

    return data
  }

  // Procesar archivo
  const handleUpload = async () => {
    if (!selectedFile || !rol) {
      setError('Selecciona un archivo CSV y un rol')
      return
    }

    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      const text = await selectedFile.text()
      const usuarios = parseCSV(text)

      const supabase = createClient()
      const errors: string[] = []
      let successCount = 0

      for (let i = 0; i < usuarios.length; i++) {
        const usuario = usuarios[i]

        try {
          // Validar campos requeridos
          if (!usuario.email || !usuario.password || !usuario.nombres || !usuario.apellidos) {
            errors.push(`Fila ${i + 2}: Faltan campos obligatorios`)
            continue
          }

          // 1. Crear usuario en Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: usuario.email,
            password: usuario.password,
            options: {
              data: {
                nombres: usuario.nombres,
                apellidos: usuario.apellidos,
              },
            },
          })

          if (authError || !authData.user) {
            errors.push(`Fila ${i + 2}: Error en auth - ${authError?.message}`)
            continue
          }

          // 2. Crear registro en tabla usuarios
          const usuarioData: any = {
            userId: authData.user.id,
            email: usuario.email,
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            ci: usuario.ci || null,
            telefono: usuario.telefono || null,
            rol: rol,
            activo: true,
          }

          // Campos específicos por rol
          if (rol === 'SECRETARIO' || rol === 'JUEZ') {
            if (usuario.juzgado) {
              usuarioData.juzgado =
                rol === 'JUEZ' && usuario.materia
                  ? `${usuario.juzgado} - ${usuario.materia}`
                  : usuario.juzgado
            }
          }

          if (rol === 'ABOGADO' && usuario.registroAbogado) {
            usuarioData.registroAbogado = usuario.registroAbogado
          }

          const { error: dbError } = await supabase.from('usuarios').insert(usuarioData)

          if (dbError) {
            errors.push(`Fila ${i + 2}: Error en BD - ${dbError.message}`)
            continue
          }

          successCount++
        } catch (err) {
          errors.push(`Fila ${i + 2}: Error inesperado - ${err}`)
        }
      }

      setResults({
        success: successCount,
        errors,
      })

      if (successCount > 0) {
        // Esperar un poco antes de llamar onSuccess para que se vean los resultados
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }
    } catch (err) {
      console.error('Error processing CSV:', err)
      setError('Error al procesar el archivo CSV')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Instrucciones */}
      <div className="rounded-lg bg-blue-50 p-4 text-sm">
        <p className="font-semibold text-blue-900">Instrucciones:</p>
        <ol className="ml-4 mt-2 list-decimal space-y-1 text-blue-800">
          <li>Selecciona el rol de los usuarios a importar</li>
          <li>Descarga la plantilla CSV correspondiente</li>
          <li>Completa los datos en el archivo CSV</li>
          <li>Sube el archivo completado</li>
        </ol>
      </div>

      {/* Selección de rol */}
      <div className="space-y-2">
        <Label>
          Rol de los Usuarios <span className="text-destructive">*</span>
        </Label>
        <Select value={rol} onValueChange={(value) => setRol(value as RolUsuario)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SECRETARIO">Secretario</SelectItem>
            <SelectItem value="JUEZ">Juez</SelectItem>
            <SelectItem value="ABOGADO">Abogado</SelectItem>
            <SelectItem value="CIUDADANO">Ciudadano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Descargar plantilla */}
      {rol && (
        <Button onClick={downloadTemplate} variant="outline" className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Descargar Plantilla CSV para {rol}
        </Button>
      )}

      {/* Selección de archivo */}
      <div className="space-y-2">
        <Label htmlFor="csvFile">Archivo CSV</Label>
        <div className="flex items-center gap-2">
          <Input
            id="csvFile"
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            disabled={isLoading || !rol}
            className="cursor-pointer"
          />
          {selectedFile && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              {selectedFile.name}
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start space-x-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Resultados */}
      {results && (
        <div className="space-y-3">
          {results.success > 0 && (
            <div className="flex items-start space-x-2 rounded-md bg-green-50 p-3 text-sm text-green-800">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <p>
                ✓ {results.success} usuario(s) creado(s) exitosamente
              </p>
            </div>
          )}

          {results.errors.length > 0 && (
            <div className="rounded-md bg-destructive/10 p-3">
              <p className="mb-2 text-sm font-semibold text-destructive">
                Errores encontrados ({results.errors.length}):
              </p>
              <ul className="ml-4 list-disc space-y-1 text-xs text-destructive">
                {results.errors.slice(0, 10).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {results.errors.length > 10 && (
                  <li>... y {results.errors.length - 10} errores más</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Botón de carga */}
      <Button
        onClick={handleUpload}
        disabled={!selectedFile || !rol || isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? 'Procesando...' : 'Importar Usuarios'}
      </Button>

      {/* Notas adicionales */}
      <div className="rounded-lg bg-muted p-4 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">Notas importantes:</p>
        <ul className="ml-4 mt-2 list-disc space-y-1">
          <li>Todos los usuarios recibirán un email de verificación</li>
          <li>Las contraseñas deben cumplir con los requisitos de seguridad</li>
          <li>Los emails deben ser únicos en el sistema</li>
          <li>El proceso puede tardar varios segundos para archivos grandes</li>
        </ul>
      </div>
    </div>
  )
}
