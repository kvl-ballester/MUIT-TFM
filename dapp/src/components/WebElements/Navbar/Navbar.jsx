import React, {useState} from 'react'
import { Link, useLocation } from "react-router-dom";
import "./Navbar.scss"

const rutas = [
    {path:'/', tab:'Home'},
    {path:'/exchange', tab:'Exchange'},
    {path:'/tokens', tab:'Tokens'},
]

export const Navbar = () => {
    const location = useLocation();
    const [tabSelected, setTabSelected] = useState(() => {
        return rutas.filter(obj => {
            return obj.path === location.pathname
        })[0].tab
    });

    
    return (
        <nav className="navbar">
            <ul className="container">
                {rutas.map((ruta, index) => {
                    return <Link key={index} className={`item ${tabSelected === ruta.tab ? 'selected' : ''}`} onClick={() => setTabSelected(ruta.tab)} to={ruta.path}> {ruta.tab} </Link> 

                })}
            </ul>
        </nav>
    )
}
