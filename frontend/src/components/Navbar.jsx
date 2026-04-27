import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
      <Link to="/" className="text-xl font-semibold text-slate-900">
        Digital Asset Protection
      </Link>
      <Link
        to="/admin"
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Admin Login
      </Link>
    </nav>
  )
}
