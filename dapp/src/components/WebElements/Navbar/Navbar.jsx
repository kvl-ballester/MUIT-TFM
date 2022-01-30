import React from 'react'
import { Link } from "react-router-dom";
import "./Navbar.scss"

export const Navbar = () => {
    return (
        <nav className="navbar">
            <ul className="container">
                <Link className="item"  to="/"> Home </Link> 
                <Link className="item"  to="/exchange">Exchange</Link>
                <Link className="item" to="/tokens">Tokens</Link>
            </ul>
        </nav>
    )
}
