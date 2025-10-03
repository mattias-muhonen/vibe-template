# Frontend Specification: Authentication System

## 1. Overview

This document defines the complete frontend implementation for the authentication system using Next.js 14+ with TypeScript. Supports both email/password authentication and Google OAuth with a modern, accessible UI built using atomic design principles and Radix UI components.

**Framework:** Next.js 14+ (App Router)  
**Language:** TypeScript 5.8  
**Routing:** Built-in Next.js App Router  
**Styling:** Tailwind CSS v4  
**Component Library:** Radix UI (unstyled primitives)  
**State Management:** React Context + Server Components  
**HTTP Client:** fetch API (native) with React Query

## 2. Architecture

### 2.1 Authentication Flow

**Email/Password Registration:**
1. User fills registration form (Client Component)
2. Frontend validates input client-side (Zod)
3. POST `/api/auth/register` to backend
4. Display success message + email verification prompt
5. User clicks email verification link
6. Next.js catches `/verify-email?token=xxx` route
7. GET `/api/auth/verify-email?token=xxx`
8. Redirect to login page

**Email/Password Login:**
1. User fills login form
2. POST `/api/auth/login` to backend
3. Store JWT token in httpOnly cookie (via Next.js API route)
4. Set auth context state
5. `router.push('/dashboard')`

**Google OAuth Login:**
1. User clicks "Sign in with Google" button
2. Google Sign-In library shows OAuth popup
3. User authenticates with Google
4. Google returns ID token to frontend
5. POST `/api/auth/google` to backend
6. Store JWT token in httpOnly cookie
7. `router.push('/dashboard')`

**Logout:**
1. User clicks logout button
2. POST `/api/auth/logout` to backend
3. Remove JWT cookie
4. Clear auth context
5. `router.push('/login')`

### 2.2 Next.js App Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/                     # Auth route group (public)
│   │   │   ├── login/
│   │   │   │   └── page.tsx            # Login page
│   │   │   ├── register/
│   │   │   │   └── page.tsx            # Register page
│   │   │   ├── verify-email/
│   │   │   │   └── page.tsx            # Email verification
│   │   │   └── layout.tsx              # Auth layout (centered, card)
│   │   ├── (dashboard)/                # Protected route group
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx            # Dashboard
│   │   │   └── layout.tsx              # Dashboard layout (with header)
│   │   ├── api/                        # Next.js API routes (optional proxy)
│   │   │   └── auth/
│   │   │       └── [...auth]/route.ts  # Cookie management
│   │   ├── layout.tsx                  # Root layout
│   │   ├── page.tsx                    # Home page (redirects to login/dashboard)
│   │   └── error.tsx                   # Global error boundary
│   ├── components/
│   │   ├── ui/                         # Radix UI components (atoms/molecules)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── card.tsx
│   │   │   ├── avatar.tsx
│   │   │   └── separator.tsx
│   │   └── features/                   # Feature components (organisms)
│   │       ├── auth/
│   │       │   ├── RegisterForm.tsx
│   │       │   ├── LoginForm.tsx
│   │       │   ├── GoogleSignInButton.tsx
│   │       │   └── AuthGuard.tsx
│   │       └── layout/
│   │           ├── Header.tsx
│   │           └── UserMenu.tsx
│   ├── lib/
│   │   ├── api.ts                      # Backend API client
│   │   ├── auth.ts                     # Auth utilities (getUser, etc.)
│   │   ├── utils.ts                    # Utility functions
│   │   └── validations.ts              # Zod schemas
│   ├── contexts/
│   │   └── AuthContext.tsx             # Auth state management
│   ├── types/
│   │   └── auth.ts                     # TypeScript types
│   └── middleware.ts                   # Next.js middleware (auth check)
├── public/
│   └── google-logo.svg
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── package.json
```

## 3. Component Specifications

### 3.1 Atoms (UI Primitives)

#### Button Component

```tsx
// src/components/ui/button.tsx
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        outline: 'border border-gray-300 hover:bg-gray-100',
        ghost: 'hover:bg-gray-100',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

#### Input Component

```tsx
// src/components/ui/input.tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
```

### 3.2 Feature Components (Organisms)

#### RegisterForm Component

```tsx
// src/components/features/auth/RegisterForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true)
      const response = await api.post('/auth/register', {
        email: data.email,
        fullName: data.fullName,
        password: data.password,
      })
      
      setSuccessMessage(response.message)
      // Optionally redirect to login after 3 seconds
      setTimeout(() => router.push('/login'), 3000)
    } catch (error: any) {
      alert(error.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (successMessage) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold text-green-600 mb-2">
          Registration Successful!
        </h2>
        <p className="text-gray-600">{successMessage}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          {...register('fullName')}
          disabled={isLoading}
        />
        {errors.fullName && (
          <p className="text-sm text-red-600 mt-1">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword')}
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-600 mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating Account...' : 'Sign Up'}
      </Button>
    </form>
  )
}
```

#### LoginForm Component

```tsx
// src/components/features/auth/LoginForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const { setUser, setToken } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      const response = await api.post('/auth/login', data)
      
      // Store token and user
      setToken(response.token)
      setUser(response.user)
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error: any) {
      alert(error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Log In'}
      </Button>
    </form>
  )
}
```

#### GoogleSignInButton Component

```tsx
// src/components/features/auth/GoogleSignInButton.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

// Load Google Sign-In script
declare global {
  interface Window {
    google: any
  }
}

export function GoogleSignInButton() {
  const router = useRouter()
  const { setUser, setToken } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = () => {
    setIsLoading(true)
    
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    })
    
    window.google.accounts.id.prompt()
  }

  const handleCredentialResponse = async (response: any) => {
    try {
      const result = await api.post('/auth/google', {
        idToken: response.credential,
      })
      
      // Store token and user
      setToken(result.token)
      setUser(result.user)
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error: any) {
      alert(error.message || 'Google sign-in failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        {/* Google logo SVG */}
      </svg>
      {isLoading ? 'Signing in...' : 'Continue with Google'}
    </Button>
  )
}
```

## 4. Authentication Context

```tsx
// src/contexts/AuthContext.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  email: string
  fullName: string
  avatarUrl?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Load auth state from localStorage on mount
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Persist auth state to localStorage
    if (token && user) {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }, [token, user])

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setToken(null)
      router.push('/login')
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, token, setUser, setToken, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

## 5. API Client

```ts
// src/lib/api.ts

class ApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken()
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseURL}/api${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Request failed',
      }))
      throw new Error(error.message)
    }

    return response.json()
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const api = new ApiClient()
```

## 6. Next.js Pages

### 6.1 Register Page

```tsx
// src/app/(auth)/register/page.tsx
import Link from 'next/link'
import { RegisterForm } from '@/components/features/auth/RegisterForm'
import { GoogleSignInButton } from '@/components/features/auth/GoogleSignInButton'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-gray-600 mt-2">
            Sign up to start collaborating with your team
          </p>
        </div>

        <GoogleSignInButton />

        <Separator className="my-6" />

        <RegisterForm />

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  )
}
```

### 6.2 Login Page

```tsx
// src/app/(auth)/login/page.tsx
import Link from 'next/link'
import { LoginForm } from '@/components/features/auth/LoginForm'
import { GoogleSignInButton } from '@/components/features/auth/GoogleSignInButton'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-gray-600 mt-2">
            Sign in to your account to continue
          </p>
        </div>

        <GoogleSignInButton />

        <Separator className="my-6" />

        <LoginForm />

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  )
}
```

### 6.3 Dashboard Page (Protected)

```tsx
// src/app/(dashboard)/dashboard/page.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Welcome, {user.fullName}!</h1>
      <p className="text-gray-600 mt-2">
        This is your protected dashboard.
      </p>
    </div>
  )
}
```

## 7. Middleware (Route Protection)

```ts
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Public routes
  const publicRoutes = ['/login', '/register', '/verify-email']
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // If trying to access protected route without token
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If logged in trying to access auth pages
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

## 8. Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## 9. Dependencies

```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "react-hook-form": "^7.49.0",
    "@hookform/resolvers": "^3.3.4",
    "zod": "^3.22.4",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5.8",
    "tailwindcss": "^4.0.0",
    "postcss": "^8",
    "autoprefixer": "^10"
  }
}
```

## 10. Key Differences from React + Vite

| Aspect | React + Vite | Next.js 14 |
|--------|--------------|------------|
| **Routing** | React Router | App Router (file-based) |
| **Rendering** | CSR only | SSR + CSR + SSG |
| **API Routes** | Separate backend | Optional Next.js API routes |
| **Auth** | Client-side only | Can use server components |
| **State** | Context/Redux | Context + Server components |
| **Build** | Vite | Next.js compiler |
| **Deployment** | Static host | Vercel / Node server |

## 11. Implementation Checklist

- [ ] Initialize Next.js project with App Router
- [ ] Install Radix UI and Tailwind CSS
- [ ] Create UI components (button, input, label, card)
- [ ] Implement AuthContext provider
- [ ] Build RegisterForm and LoginForm
- [ ] Implement GoogleSignInButton
- [ ] Create auth pages (login, register, verify-email)
- [ ] Set up API client with token management
- [ ] Implement middleware for route protection
- [ ] Create protected dashboard page
- [ ] Test authentication flows
- [ ] Add error handling and loading states

---

**Document Version:** 2.0  
**Last Updated:** Oct 2025  
**Framework:** Next.js 14+ with App Router
