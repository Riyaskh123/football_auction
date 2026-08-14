import { Link } from "react-router-dom"

const Header = () => {
    return (
        <header className="flex gap-4 items-center text-black rounded bg-floodlight/30 px-4 py-2">
            <Link to="/" className="bg-gold px-2 py-1 rounded cursor-pointer">Home</Link>
            <Link to="/register/team" className="bg-gold px-2 py-1 rounded cursor-pointer">Add Team</Link>
            <Link to="/admin/registrations" className="bg-gold px-2 py-1 rounded cursor-pointer">Player Review</Link>
            <Link to="/admin/team-registrations" className="bg-gold px-2 py-1 rounded cursor-pointer"> Team Review</Link>
        </header>
    )
}

export default Header