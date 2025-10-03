'use client'

import { useEffect, useState } from 'react'

export default function HomePage() {
  const [message, setMessage] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchHello = async () => {
      try {
        setLoading(true)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
        const response = await fetch(`${apiUrl}/api/hello`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setMessage(data.message)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch')
      } finally {
        setLoading(false)
      }
    }

    fetchHello()
  }, [])

  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem',
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        Todo App
      </h1>
      
      <div style={{
        padding: '2rem',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        minWidth: '300px',
        textAlign: 'center',
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Backend Connection Test</h2>
        
        {loading && <p>Loading...</p>}
        
        {error && (
          <div style={{ color: 'red', padding: '1rem', backgroundColor: '#fee' }}>
            <strong>Error:</strong> {error}
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Make sure the backend is running at http://localhost:8080
            </p>
          </div>
        )}
        
        {message && (
          <div style={{ color: 'green', padding: '1rem', backgroundColor: '#efe' }}>
            <strong>✓ Success!</strong>
            <p style={{ marginTop: '0.5rem' }}>{message}</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center', color: '#666' }}>
        <p>Frontend: Next.js (http://localhost:3000)</p>
        <p>Backend: Quarkus + Kotlin (http://localhost:8080)</p>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
          See <code>docs/CONTEXT.md</code> for architecture details
        </p>
      </div>
    </main>
  )
}

