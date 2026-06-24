import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { updateMe } from '../services/auth.service'
import { getMyCertification } from '../services/certification.service'
import { listRecords } from '../services/waste.service'

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO',
  'MA','MT','MS','MG','PA','PB','PR','PE','PI',
  'RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

const LEVEL_INFO = {
  sem_nivel: { label: 'Sem certificação', icon: '🌱', textColor: 'text-gray-400', badgeBg: 'bg-gray-50', badgeBorder: 'border-gray-200' },
  bronze: { label: 'Bronze', icon: '🥉', textColor: 'text-orange-700', badgeBg: 'bg-orange-50', badgeBorder: 'border-orange-400' },
  prata: { label: 'Prata', icon: '🥈', textColor: 'text-slate-500', badgeBg: 'bg-slate-100', badgeBorder: 'border-slate-400' },
  ouro: { label: 'Ouro', icon: '🥇', textColor: 'text-amber-600', badgeBg: 'bg-amber-50', badgeBorder: 'border-amber-400' },
}

const WASTE_TYPE_LABELS = {
  papel: 'Papel',
  plastico: 'Plástico',
  vidro: 'Vidro',
  metal: 'Metal',
  organico: 'Orgânico',
  eletronico: 'Eletrônico',
  perigoso: 'Perigoso',
  outro: 'Outro',
}

const WASTE_TYPE_COLORS = {
  papel: 'bg-blue-50 text-blue-700',
  plastico: 'bg-yellow-50 text-yellow-700',
  vidro: 'bg-cyan-50 text-cyan-700',
  metal: 'bg-gray-100 text-gray-700',
  organico: 'bg-green-50 text-green-700',
  eletronico: 'bg-purple-50 text-purple-700',
  perigoso: 'bg-red-50 text-red-700',
  outro: 'bg-orange-50 text-orange-700',
}

export default function PerfilPage() {
  const { user, signOut, signIn } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', city: '', state: '' })
  const [saveError, setSaveError] = useState(null)

  const { data: cert } = useQuery({
    queryKey: ['certification', user?.id],
    queryFn: getMyCertification,
  })

  const { data: records = [] } = useQuery({
    queryKey: ['waste-records', user?.id],
    queryFn: listRecords,
  })

  const updateMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: (updatedUser) => {
      // Atualiza o token com os dados novos do usuário
      const token = localStorage.getItem('access_token')
      signIn(token, updatedUser)
      queryClient.invalidateQueries({ queryKey: ['waste-records'] })
      setEditing(false)
      setSaveError(null)
    },
    onError: () => {
      setSaveError('Erro ao salvar. Tente novamente.')
    },
  })

  const handleEditStart = () => {
    setForm({ name: user?.name || '', city: user?.city || '', state: user?.state || '' })
    setSaveError(null)
    setEditing(true)
  }

  const handleSave = () => {
    const payload = {}
    if (form.name.trim() && form.name.trim() !== user?.name) payload.name = form.name.trim()
    if (form.city.trim() && form.city.trim() !== user?.city) payload.city = form.city.trim()
    if (form.state && form.state !== user?.state) payload.state = form.state
    if (Object.keys(payload).length === 0) {
      setEditing(false)
      return
    }
    updateMutation.mutate(payload)
  }

  const handleLogout = () => {
    signOut()
    navigate('/')
  }

  // Estatísticas
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  const records30d = records.filter((r) => new Date(r.created_at) >= cutoff)
  const totalWeight = records.reduce((sum, r) => sum + parseFloat(r.weight_kg || 0), 0)
  const recordsWithEvidence = records.filter((r) => (r.evidences?.length || 0) > 0)
  const uniqueTypes = [...new Set(records.map((r) => r.waste_type))]

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : '—'

  const level = cert?.level || 'sem_nivel'
  const levelInfo = LEVEL_INFO[level] || LEVEL_INFO.sem_nivel

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-sm text-gray-500 mt-1">Seus dados e estatísticas de uso</p>
      </div>

      {/* Card principal do usuário */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {!editing ? (
          <div>
            {/* Avatar + info */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-green-700">
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 truncate">{user?.name}</h2>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                {/* Badge nível */}
                <div className={`inline-flex items-center gap-1 mt-2 text-xs font-medium px-2 py-1 rounded-full border ${levelInfo.badgeBg} ${levelInfo.badgeBorder} ${levelInfo.textColor}`}>
                  {levelInfo.icon} {levelInfo.label}
                </div>
              </div>
            </div>

            {/* Dados adicionais */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex gap-2">
                <span className="text-gray-400 w-20 flex-shrink-0">CPF</span>
                <span className="font-medium text-gray-700">{user?.cpf || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400 w-20 flex-shrink-0">Cidade</span>
                <span className="font-medium text-gray-700">{user?.city || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400 w-20 flex-shrink-0">Estado</span>
                <span className="font-medium text-gray-700">{user?.state || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400 w-20 flex-shrink-0">Tipo</span>
                <span className="font-medium text-gray-700">Pessoa Física</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400 w-20 flex-shrink-0">Membro desde</span>
                <span className="font-medium text-gray-700 capitalize">{memberSince}</span>
              </div>
            </div>

            <button
              onClick={handleEditStart}
              className="mt-4 w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-300 text-sm transition-colors duration-200"
            >
              ✏️ Editar dados
            </button>
          </div>
        ) : (
          /* Formulário de edição */
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Editar dados</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={form.state}
                  onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  <option value="">Selecione</option>
                  {STATES.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
              {/* E-mail e CPF como somente leitura */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">E-mail (não editável)</label>
                <input
                  type="text"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">CPF (não editável)</label>
                <input
                  type="text"
                  value={user?.cpf || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>

            {saveError && (
              <p className="text-xs text-red-500 mt-2">{saveError}</p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-300 text-sm transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="flex-1 bg-green-700 hover:bg-green-800 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors duration-200 disabled:bg-green-200 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Estatísticas */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Minhas estatísticas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard icon="🏆" label="Pontuação total" value={cert?.total_score ?? 0} />
          <StatCard icon="📦" label="Total de registros" value={records.length} />
          <StatCard icon="⚖️" label="Peso registrado" value={`${totalWeight.toFixed(1)} kg`} />
          <StatCard icon="📷" label="Com evidências" value={recordsWithEvidence.length} />
          <StatCard icon="♻️" label="Tipos de resíduo" value={uniqueTypes.length} />
          <StatCard icon="📅" label="Registros (30d)" value={records30d.length} />
        </div>
      </div>

      {/* Tipos de resíduo registrados */}
      {uniqueTypes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Tipos de resíduo registrados</h2>
          <div className="flex flex-wrap gap-2">
            {uniqueTypes.map((type) => (
              <span
                key={type}
                className={`text-xs font-medium px-3 py-1 rounded-full ${WASTE_TYPE_COLORS[type] || 'bg-gray-100 text-gray-600'}`}
              >
                {WASTE_TYPE_LABELS[type] || type}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Botões de ação */}
      <div className="space-y-3">
        <Link
          to="/certificado"
          className="flex items-center justify-between w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-300 text-sm transition-colors duration-200"
        >
          <span>🏅 Ver meu certificado completo</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          to="/checklist"
          className="flex items-center justify-between w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-300 text-sm transition-colors duration-200"
        >
          <span>📋 Refazer diagnóstico</span>
          <span className="text-gray-400">→</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-3 px-4 rounded-lg border border-red-200 text-sm transition-colors duration-200"
        >
          Sair da conta
        </button>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</p>
    </div>
  )
}
