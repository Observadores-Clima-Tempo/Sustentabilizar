import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../contexts/AuthContext'
import { getMe, login } from '../services/auth.service'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  async function onSubmit(data) {
    setServerError('')
    try {
      const tokenData = await login(data.email, data.password)
      // Salva o token antes de chamar getMe para que o interceptor do Axios o inclua
      localStorage.setItem('access_token', tokenData.access_token)
      const userData = await getMe()
      signIn(tokenData.access_token, userData)
      // Admins vão para o painel administrativo; usuários comuns para o dashboard
      navigate(userData.is_admin ? '/admin' : '/dashboard')
    } catch (err) {
      const detail = err?.response?.data?.detail
      if (typeof detail === 'string') {
        setServerError(detail)
      } else {
        setServerError('Erro ao entrar. Verifique suas credenciais.')
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

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Entrar</h1>
      <p className="text-sm text-gray-500 mb-8">Bem-vindo de volta</p>

      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {serverError && (
          <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* E-mail */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="seu@email.com"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow duration-150"
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              {...register('password')}
              type="password"
              placeholder="Sua senha"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow duration-150"
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-green-200 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        Não tem conta?{' '}
        <Link
          to="/register"
          className="text-green-700 font-medium hover:underline"
        >
          Cadastrar-se
        </Link>
      </p>
    </div>
  )
}
