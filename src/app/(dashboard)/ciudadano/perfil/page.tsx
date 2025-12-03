'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Save, Edit, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/providers/auth-provider'
import { supabase } from '@/lib/supabase/client'

interface PerfilData {
  ci: string
  nombres: string
  apellidos: string
  email: string
  telefono: string
  domicilio: string
  fecha_nacimiento: string | null
  estado_civil: string | null
  profesion: string | null
  foto_url: string | null
}

export default function PerfilPage() {
  const { user } = useAuth()
  const [perfil, setPerfil] = useState<PerfilData>({
    ci: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    domicilio: '',
    fecha_nacimiento: null,
    estado_civil: null,
    profesion: null,
    foto_url: null,
  })
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    fetchPerfil()
  }, [user])

  const fetchPerfil = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setPerfil({
        ci: data.ci || '',
        nombres: data.nombres || '',
        apellidos: data.apellidos || '',
        email: data.email || user.email || '',
        telefono: data.telefono || '',
        domicilio: data.domicilio || '',
        fecha_nacimiento: data.fecha_nacimiento,
        estado_civil: data.estado_civil,
        profesion: data.profesion,
        foto_url: data.foto_url,
      })
    } catch (error) {
      console.error('Error al cargar perfil:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          ci: perfil.ci,
          nombres: perfil.nombres,
          apellidos: perfil.apellidos,
          telefono: perfil.telefono,
          domicilio: perfil.domicilio,
          fecha_nacimiento: perfil.fecha_nacimiento,
          estado_civil: perfil.estado_civil,
          profesion: perfil.profesion,
        })
        .eq('id', user.id)

      if (error) throw error

      setEditMode(false)
      alert('Perfil actualizado exitosamente')
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      alert('Error al actualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden')
      return
    }

    if (passwordData.newPassword.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres')
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) throw error

      alert('Contraseña actualizada exitosamente')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      console.error('Error al cambiar contraseña:', error)
      alert('Error al cambiar contraseña')
    }
  }

  const getInitials = () => {
    return `${perfil.nombres.charAt(0)}${perfil.apellidos.charAt(0)}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Cargando perfil...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground">Gestiona tu información personal y configuración</p>
      </div>

      <Tabs defaultValue="informacion" className="space-y-6">
        <TabsList>
          <TabsTrigger value="informacion">Información Personal</TabsTrigger>
          <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="informacion">
          <div className="space-y-6">
            {/* Foto de perfil */}
            <Card>
              <CardHeader>
                <CardTitle>Foto de Perfil</CardTitle>
                <CardDescription>Actualiza tu foto de perfil</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={perfil.foto_url || ''} />
                    <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full"
                    variant="secondary"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <p className="font-medium">
                    {perfil.nombres} {perfil.apellidos}
                  </p>
                  <p className="text-sm text-muted-foreground">{perfil.email}</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Cambiar Foto
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Información personal */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>Tus datos personales registrados</CardDescription>
                  </div>
                  {!editMode ? (
                    <Button variant="outline" onClick={() => setEditMode(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditMode(false)
                          fetchPerfil()
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleSave} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? 'Guardando...' : 'Guardar'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ci">Cédula de Identidad</Label>
                    <Input
                      id="ci"
                      value={perfil.ci}
                      onChange={(e) => setPerfil({ ...perfil, ci: e.target.value })}
                      disabled={!editMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nombres">Nombres</Label>
                    <Input
                      id="nombres"
                      value={perfil.nombres}
                      onChange={(e) => setPerfil({ ...perfil, nombres: e.target.value })}
                      disabled={!editMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apellidos">Apellidos</Label>
                    <Input
                      id="apellidos"
                      value={perfil.apellidos}
                      onChange={(e) => setPerfil({ ...perfil, apellidos: e.target.value })}
                      disabled={!editMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={perfil.email} disabled />
                    <p className="text-xs text-muted-foreground">
                      El email no puede ser modificado
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      type="tel"
                      value={perfil.telefono}
                      onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })}
                      disabled={!editMode}
                      placeholder="+591 XXXXXXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                    <Input
                      id="fecha_nacimiento"
                      type="date"
                      value={perfil.fecha_nacimiento || ''}
                      onChange={(e) =>
                        setPerfil({ ...perfil, fecha_nacimiento: e.target.value })
                      }
                      disabled={!editMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado_civil">Estado Civil</Label>
                    <Input
                      id="estado_civil"
                      value={perfil.estado_civil || ''}
                      onChange={(e) => setPerfil({ ...perfil, estado_civil: e.target.value })}
                      disabled={!editMode}
                      placeholder="Soltero/a, Casado/a, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profesion">Profesión</Label>
                    <Input
                      id="profesion"
                      value={perfil.profesion || ''}
                      onChange={(e) => setPerfil({ ...perfil, profesion: e.target.value })}
                      disabled={!editMode}
                      placeholder="Tu profesión u ocupación"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="domicilio">Domicilio</Label>
                    <Textarea
                      id="domicilio"
                      value={perfil.domicilio}
                      onChange={(e) => setPerfil({ ...perfil, domicilio: e.target.value })}
                      disabled={!editMode}
                      rows={3}
                      placeholder="Dirección completa..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="seguridad">
          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>Actualiza tu contraseña de acceso al sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-md space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">Contraseña Actual</Label>
                  <Input
                    id="current"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new">Nueva Contraseña</Label>
                  <Input
                    id="new"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-muted-foreground">Mínimo 8 caracteres</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirmar Nueva Contraseña</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    placeholder="••••••••"
                  />
                </div>

                <Button onClick={handlePasswordChange} className="w-full">
                  Actualizar Contraseña
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificaciones">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificaciones</CardTitle>
              <CardDescription>
                Configura cómo quieres recibir notificaciones del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificaciones por Email</p>
                    <p className="text-sm text-muted-foreground">
                      Recibe actualizaciones por correo electrónico
                    </p>
                  </div>
                  <Button variant="outline">Activar</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificaciones de Citaciones</p>
                    <p className="text-sm text-muted-foreground">
                      Alertas de nuevas citaciones registradas
                    </p>
                  </div>
                  <Button variant="outline">Activar</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificaciones de Audiencias</p>
                    <p className="text-sm text-muted-foreground">
                      Recordatorios de audiencias programadas
                    </p>
                  </div>
                  <Button variant="outline">Activar</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificaciones de Plazos</p>
                    <p className="text-sm text-muted-foreground">Alertas de plazos próximos a vencer</p>
                  </div>
                  <Button variant="outline">Activar</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificaciones de Mensajes</p>
                    <p className="text-sm text-muted-foreground">
                      Nuevos mensajes de tu abogado
                    </p>
                  </div>
                  <Button variant="outline">Activar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
