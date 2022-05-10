export const WrongConfiguration = () => {
    return (
        <div className="no-account">
            <h2>It looks like you haven't selected: </h2>
            <ul>
                <li>The correct blockchain network</li>
                <li>An account to connect to the blockchain net yet</li>
            </ul>
            <h3>Please go to the homepage and read the instructions.</h3>
        </div>
    )
}