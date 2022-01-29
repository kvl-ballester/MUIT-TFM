import "./TabNavItem.scss"

export const TabNavItem = ({classActive, tab, setTabSelected}) => {
    return (
        <li className="nav-item">
            <a className={`nav-link  ${classActive}`} onClick={() => setTabSelected(tab)}>
                {tab}
            </a>
        </li>
    )
}
