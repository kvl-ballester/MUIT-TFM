import React, {useState} from 'react'
import { Link, useLocation } from "react-router-dom";
import { AiOutlineHome } from "react-icons/ai";
import { RiExchangeFill } from "react-icons/ri";
import { BiCoin } from "react-icons/bi";
import "./Navbar.scss"

const rutas = [
    {path:'/', icon: <AiOutlineHome />, tab:'Home'},
    {path:'/exchange', icon: <RiExchangeFill />, tab:'Exchange'},
    {path:'/tokens', icon: <BiCoin/>, tab:'Tokens'},
]

export const Navbar = () => {
    const location = useLocation();
    const [tabSelected, setTabSelected] = useState(() => {
        return rutas.filter(obj => {
            return obj.path === location.pathname
        })[0].tab
    });

    
    return (
        <div className="navbar">
            <nav >
                <ul className="container">
                    {rutas.map((ruta, index) => {
                        return <Link key={index} className={`item ${tabSelected === ruta.tab ? 'selected' : ''}`} onClick={() => setTabSelected(ruta.tab)} to={ruta.path}> 
                        {ruta.icon}  {ruta.tab} 
                        </Link> 

                    })}
                </ul>
            </nav>
            <div className="credits">
                <div className="text">Powered by</div>
                <div className="logos">
                    <div className="etsit">
                        <a href="https://www.etsit.upm.es/" rel="noreferrer" target='_blank'>
                            <img src="https://www.etsit.upm.es/fileadmin/template/images/LOGO_ETSIT_WT.gif" alt='logo etsit' height={25}/>
                        </a>
                    </div>
                </div>
            </div>

        </div>
        
    )
}
