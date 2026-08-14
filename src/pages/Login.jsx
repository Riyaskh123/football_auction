import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)

    const handleLogin = () => {
        console.log(import.meta.env.VITE_ADMIN_USERNAME);
        console.log(import.meta.env.VITE_ADMIN_PASSWORD);
        
        if (username === import.meta.env.VITE_ADMIN_USERNAME && password === import.meta.env.VITE_ADMIN_PASSWORD) {
            localStorage.setItem('islogged', true)
            navigate('/dashboard')
        } else {
            setError('Invalid credentials')
        }
    }

    useEffect(() => {
        if (localStorage.getItem('islogged')) {
            navigate('/dashboard')
        }
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10">
            <form className="w-full max-w-md bg-pitch-950 border border-pitch-line p-8 rounded-2xl flex flex-col gap-6">
                <div>
                    <p className="tracking-[0.3em] text-gold text-sm mb-3 font-semibold">AUTHENTICATION</p>
                    <h1 className="font-display text-3xl tracking-wide">Login</h1>
                    <p className="text-floodlight/50 mt-2">
                        Enter your credentials to access the auction dashboard.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    {/* if error show error message */}
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-floodlight/60">Username</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl bg-pitch-900 border border-pitch-line focus:border-gold/60 outline-none"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-floodlight/60">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-xl bg-pitch-900 border border-pitch-line focus:border-gold/60 outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type='button'
                    onClick={handleLogin}
                    className="w-full px-4 py-3 rounded-xl bg-gold text-pitch-950 font-semibold hover:bg-gold-light transition-colors">
                    Login
                </button>
            </form>
        </div>
    )
}