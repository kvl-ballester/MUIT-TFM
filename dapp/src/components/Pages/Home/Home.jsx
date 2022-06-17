import { Button } from "../../WebElements/Button/Button";
import React from 'react';
import { } from "../../../";
import "./Home.scss"

export function Home({ currentAccount, setAccount }) {

  const handleEnableEthreum = async () => {
    if (currentAccount) return;
    let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0])

  }

  return (
    <main>
      <div className="home">
        <h1>Decentralized Exchange Application</h1>
        {!currentAccount &&
          <Button blue content={"Connect "} onClickButton={handleEnableEthreum} />
        }

        {currentAccount &&
          <div className="account-info">
            Account selected: {currentAccount}
          </div>
        }

        <div className="intructions">
          <h3 className="wrapper">
            In order to use the application you must:
            <ul>
              <li>Have installed <b>Metamask</b></li>
              <li>Switch to the <b>Rinkeby Test Network</b></li>
              <li>Lastly, connect account to the Blockchain</li>
            </ul>
          </h3>

          <div className="wrapper">
            <h2 className="title">Within this application you can:</h2>
            <div className="option">
              <h3>Create an <b>ERC-20 Token </b> and an <b>exchange pool</b></h3>
              <div className="image-container">
                <img src="https://i.imgur.com/oPnF3lp.gif" alt="create token steps" />
              </div>
            </div>

            <div className="option">
              <h3><b>Trade</b>  ERC-20 Tokens</h3>
              <div className="image-container">
                <img src="https://i.imgur.com/5K62cn9.gif" alt="trade token steps" />
              </div>
            </div>

            <div className="option">
              <h3><b>Add</b>  liquidity</h3>
              <div className="image-container">
                <img src="https://i.imgur.com/pcMseU1.gif" alt="add liquidity steps" />
              </div>
            </div>
          </div>

        </div>
      </div>


    </main>
  );
}