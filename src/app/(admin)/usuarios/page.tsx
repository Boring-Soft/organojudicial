'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { RolUsuario } from '@prisma/client'
import CrearSecretarioForm from '@/components/admin/crear-secretario-form'
import CrearJuezForm from '@/components/admin/crear-juez-form'
import CargaMasivaUsuarios from '@/components/admin/carga-masiva-usuarios'

interface Usuario {
  id: string
  ci: string | null
  nombres: string
  apellidos: string
  email: string
  telefono: string | null
  rol: RolUsuario
  juzgado: string | null
  registroAbogado: string | null
  activo: boolean
  createdAt: string
}

/**
 * Página de administración de usuarios
 * Solo accesible por administradores (en este caso, usuarios con rol JUEZ para propósitos iniciales)
 */
export default function AdminUsuariosPage() {
  const router = useRouter()
  const { user, getUserRole } = useAuth()
  const [loading, setLoading] = useState(true)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRol, setFilterRol] = useState<string>('TODOS')
  const [filterEstado, setFilterEstado] = useState<string>('TODOS')
  const [openCrearSecretario, setOpenCrearSecretario] = useState(false)
  const [openCrearJuez, setOpenCrearJuez] = useState(false)
  const [openCargaMasiva, setOpenCargaMasiva] = useState(false)

  // Verificar acceso de administrador
  useEffect(() => {
    const checkAccess = async () => {
      const rol = getUserRole()
      // Por ahora, solo JUEZ puede acceder (en producción, sería un rol ADMIN)
      if (rol !== 'JUEZ') {
        router.push('/403')
        return
      }
      await fetchUsuarios()
      setLoading(false)
    }

    checkAccess()
  }, [getUserRole, router])

  // Obtener lista de usuarios
  const fetchUsuarios = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('createdAt', { ascending: false })

      if (error) {
        console.error('Error fetching usuarios:', error)
        return
      }

      setUsuarios(data as Usuario[])
      setFilteredUsuarios(data as Usuario[])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...usuarios]

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.ci?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por rol
    if (filterRol !== 'TODOS') {
      filtered = filtered.filter((u) => u.rol === filterRol)
    }

    // Filtro por estado
    if (filterEstado !== 'TODOS') {
      const isActivo = filterEstado === 'ACTIVO'
      filtered = filtered.filter((u) => u.activo === isActivo)
    }

    setFilteredUsuarios(filtered)
  }, [searchTerm, filterRol, filterEstado, usuarios])

  // Activar/Desactivar usuario
  const toggleUsuarioEstado = async (usuarioId: string, currentState: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('usuarios')
        .update({ activo: !currentState })
        .eq('id', usuarioId)

      if (error) {
        console.error('Error updating usuario:', error)
        return
      }

      await fetchUsuarios()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Eliminar usuario
  const deleteUsuario = async (usuarioId: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.from('usuarios').delete().eq('id', usuarioId)

      if (error) {
        console.error('Error deleting usuario:', error)
        return
      }

      await fetchUsuarios()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Exportar a CSV
  const exportToCSV = () => {
    const headers = ['CI', 'Nombres', 'Apellidos', 'Email', 'Teléfono', 'Rol', 'Juzgado', 'Estado']
    const rows = filteredUsuarios.map((u) => [
      u.ci || '',
      u.nombres,
      u.apellidos,
      u.email,
      u.telefono || '',
      u.rol,
      u.juzgado || '',
      u.activo ? 'Activo' : 'Inactivo',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const getRolBadgeVariant = (rol: RolUsuario) => {
    const variants: Record<RolUsuario, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      CIUDADANO: 'default',
      ABOGADO: 'secondary',
      SECRETARIO: 'outline',
      JUEZ: 'destructive',
    }
    return variants[rol]
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Administración de Usuarios</h1>
        <p className="text-muted-foreground">
          Gestiona usuarios del sistema: Secretarios, Jueces, Abogados y Ciudadanos
        </p>
      </div>

      {/* Acciones principales */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Dialog open={openCrearSecretario} onOpenChange={setOpenCrearSecretario}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Crear Secretario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Secretario</DialogTitle>
              <DialogDescription>
                Completa el formulario para crear un nuevo secretario en el sistema
              </DialogDescription>
            </DialogHeader>
            <CrearSecretarioForm
              onSuccess={() => {
                setOpenCrearSecretario(false)
                fetchUsuarios()
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={openCrearJuez} onOpenChange={setOpenCrearJuez}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Crear Juez
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Juez</DialogTitle>
              <DialogDescription>
                Completa el formulario para crear un nuevo juez en el sistema
              </DialogDescription>
            </DialogHeader>
            <CrearJuezForm
              onSuccess={() => {
                setOpenCrearJuez(false)
                fetchUsuarios()
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={openCargaMasiva} onOpenChange={setOpenCargaMasiva}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Carga Masiva CSV
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Carga Masiva de Usuarios</DialogTitle>
              <DialogDescription>
                Importa múltiples usuarios desde un archivo CSV
              </DialogDescription>
            </DialogHeader>
            <CargaMasivaUsuarios
              onSuccess={() => {
                setOpenCargaMasiva(false)
                fetchUsuarios()
              }}
            />
          </DialogContent>
        </Dialog>

        <Button variant="outline" onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Búsqueda */}
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nombre, email, CI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro por rol */}
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={filterRol} onValueChange={setFilterRol}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos los roles</SelectItem>
                  <SelectItem value="JUEZ">Juez</SelectItem>
                  <SelectItem value="SECRETARIO">Secretario</SelectItem>
                  <SelectItem value="ABOGADO">Abogado</SelectItem>
                  <SelectItem value="CIUDADANO">Ciudadano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por estado */}
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="ACTIVO">Activos</SelectItem>
                  <SelectItem value="INACTIVO">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>
            Usuarios ({filteredUsuarios.length})
          </CardTitle>
          <CardDescription>
            Lista de todos los usuarios registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CI</TableHead>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Juzgado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-mono text-sm">
                        {usuario.ci || '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {usuario.nombres} {usuario.apellidos}
                      </TableCell>
                      <TableCell className="text-sm">{usuario.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRolBadgeVariant(usuario.rol)}>
                          {usuario.rol}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {usuario.juzgado || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={usuario.activo ? 'default' : 'secondary'}>
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              toggleUsuarioEstado(usuario.id, usuario.activo)
                            }
                            title={
                              usuario.activo ? 'Desactivar usuario' : 'Activar usuario'
                            }
                          >
                            {usuario.activo ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteUsuario(usuario.id)}
                            title="Eliminar usuario"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
