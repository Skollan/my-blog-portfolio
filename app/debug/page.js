"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function DebugPage() {
  const [logs, setLogs] = useState([])
  const [email, setEmail] = useState("admin@example.com")
  const [password, setPassword] = useState("password123")

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { message, type, timestamp }])
  }

  const testConnection = async () => {
    addLog("Testing Supabase connection...")
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        addLog(`Connection error: ${error.message}`, 'error')
      } else {
        addLog("✓ Supabase connection successful", 'success')
        addLog(`Current session: ${data.session ? 'Active' : 'None'}`)
      }
    } catch (error) {
      addLog(`Connection exception: ${error.message}`, 'error')
    }
  }

  const testSignUp = async () => {
    addLog(`Testing signup with: ${email}`)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) {
        addLog(`Signup failed: ${error.message}`, 'error')
        addLog(`Error status: ${error.status}`, 'error')
      } else {
        addLog("✓ Signup successful!", 'success')
        addLog(`User ID: ${data.user?.id}`)
        addLog(`Email confirmed: ${data.user?.email_confirmed_at ? 'Yes' : 'No'}`)
      }
    } catch (error) {
      addLog(`Signup exception: ${error.message}`, 'error')
    }
  }

  const testSignIn = async () => {
    addLog(`Testing signin with: ${email}`)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        addLog(`Signin failed: ${error.message}`, 'error')
        addLog(`Error status: ${error.status}`, 'error')
        
        // Provide helpful hints
        if (error.message.includes('Invalid login credentials')) {
          addLog("💡 This usually means:", 'info')
          addLog("- User doesn't exist", 'info')
          addLog("- Wrong password", 'info')
          addLog("- Email not confirmed", 'info')
        }
      } else {
        addLog("✓ Signin successful!", 'success')
        addLog(`User ID: ${data.user?.id}`)
        addLog(`User Email: ${data.user?.email}`)
        addLog(`Session: ${data.session ? 'Created' : 'None'}`)
      }
    } catch (error) {
      addLog(`Signin exception: ${error.message}`, 'error')
    }
  }

  const testGetUser = async () => {
    addLog("Testing getUser...")
    try {
      const { data, error } = await supabase.auth.getUser()
      
      if (error) {
        addLog(`GetUser failed: ${error.message}`, 'error')
      } else {
        addLog(`Current user: ${data.user ? data.user.email : 'None'}`, 'success')
      }
    } catch (error) {
      addLog(`GetUser exception: ${error.message}`, 'error')
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Supabase Auth Debug</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <div className="space-y-2">
            <button
              onClick={testConnection}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Test Connection
            </button>
            
            <button
              onClick={testSignUp}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Test Sign Up
            </button>
            
            <button
              onClick={testSignIn}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
            >
              Test Sign In
            </button>
            
            <button
              onClick={testGetUser}
              className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700"
            >
              Test Get User
            </button>
            
            <button
              onClick={clearLogs}
              className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
            >
              Clear Logs
            </button>
          </div>
        </div>
        
        {/* Logs */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="bg-gray-100 p-4 rounded-lg h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Click a test button to start.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`mb-2 text-sm ${
                  log.type === 'error' ? 'text-red-600' :
                  log.type === 'success' ? 'text-green-600' :
                  'text-gray-700'
                }`}>
                  <span className="text-gray-400">[{log.timestamp}]</span> {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside text-yellow-700 space-y-1">
          <li>First, test the connection to make sure Supabase is reachable</li>
          <li>Try to sign up with your email (this might fail if user exists)</li>
          <li>Try to sign in with your credentials</li>
          <li>Check the logs for detailed error messages</li>
          <li>If sign up fails, create user manually in Supabase Dashboard</li>
        </ol>
      </div>
    </div>
  )
}