import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../contexts/AuthContext'
import { getMe, login, register } from '../services/auth.service'

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO',
  'MA','MT','MS','MG','PA','PB','PR','PE','PI',
  'RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

const schema = z
  .object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('E-mail inválido'),
    cpf: z
      .string()
      .transform((v) => v.replace(/\D/g, ''))
      .refine((v) => v.length === 11, 'CPF deve ter 11 dígitos'),
    city: z.string().min(2, 'Cidade inválida'),
    state: z.string().refine((v) => STATES.includes(v), 'Selecione um estado'),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

function formatCPF(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [serverError, setServerError] = useState('')

  const {
    register: reg,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  const cpfValue = watch('cpf') || ''

  async function onSubmit(data) {
    setServerError('')
    try {
      // Formata o CPF antes de enviar
      const cpfRaw = data.cpf.replace(/\D/g, '')
      const cpfFormatted = `${cpfRaw.slice(0, 3)}.${cpfRaw.slice(3, 6)}.${cpfRaw.slice(6, 9)}-${cpfRaw.slice(9)}`

      await register({
        name: data.name,
        email: data.email,
        cpf: cpfFormatted,
        password: data.password,
        city: data.city,
        state: data.state,
      })

      // Faz login automaticamente após o cadastro
      const tokenData = await login(data.email, data.password)
      // Salva o token antes de chamar getMe para que o interceptor do Axios o inclua
      localStorage.setItem('access_token', tokenData.access_token)
      const userData = await getMe()
      signIn(tokenData.access_token, userData)

      navigate('/checklist')
    } catch (err) {
      const detail = err?.response?.data?.detail
      if (typeof detail === 'string') {
        setServerError(detail)
      } else {
        setServerError('Erro ao criar conta. Tente novamente.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-12">
      {/* Voltar para a landing page */}
      <div className="w-full max-w-md mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-150"
        >
          <span>←</span> Voltar ao início
        </Link>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl" aria-hidden="true">♻️</span>
        <span className="text-xl font-bold text-green-700">Sustentabilizar</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Crie sua conta</h1>
      <p className="text-sm text-gray-500 mb-8">Pessoa Física · Gratuito</p>

      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {serverError && (
          <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nome completo */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Nome completo
            </label>
            <input
              {...reg('name')}
              placeholder="Ana Beatriz Silva"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow duration-150"
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* E-mail */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <input
              {...reg('email')}
              type="email"
              placeholder="seu@email.com"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow duration-150"
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* CPF */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">CPF</label>
            <input
              {...reg('cpf')}
              placeholder="000.000.000-00"
              value={formatCPF(cpfValue)}
              onChange={(e) => {
                const formatted = formatCPF(e.target.value)
                setValue('cpf', formatted, { shouldValidate: true })
              }}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow duration-150"
            />
            {errors.cpf && (
              <p className="text-xs text-red-500">{errors.cpf.message}</p>
            )}
          </div>

          {/* Cidade + Estado */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Cidade
              </label>
              <input
                {...reg('city')}
                placeholder="São Paulo"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow duration-150"
              />
              {errors.city && (
                <p className="text-xs text-red-500">{errors.city.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <select
                {...reg('state')}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow duration-150"
              >
                <option value="">UF</option>
                {STATES.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="text-xs text-red-500">{errors.state.message}</p>
              )}
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              {...reg('password')}
              type="password"
              placeholder="Mínimo 8 caracteres"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow duration-150"
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirmar senha */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Confirmar senha
            </label>
            <input
              {...reg('confirmPassword')}
              type="password"
              placeholder="Repita a senha"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow duration-150"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-green-200 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? 'Criando conta...' : '🌿 Criar conta e começar'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        Já tem conta?{' '}
        <Link to="/login" className="text-green-700 font-medium hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
