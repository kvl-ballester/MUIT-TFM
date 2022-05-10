import { Spin } from 'antd';
import "./spinner.scss"

export const Spinner = ({children}) => {

    return (
        <main>
            <div className="spinner-container">
                <Spin />
                <h2>{children}</h2>
            </div>
        </main>
        
    )
}