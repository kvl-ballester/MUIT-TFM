import { Button } from "../../WebElements/Button/Button";
import React from 'react';

import "./Home.scss"

export function Home({currentAccount, setAccount}) {

    const handleEnableEthreum = async () => {
      if (currentAccount) return;
      let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0])

    }

    return (
        <main>
          <h2>Welcome to the homepage!</h2>
          {!currentAccount && 
            <Button blue content={"Enable ethereum"} onClickButton={handleEnableEthreum}/>
          }
          
          {currentAccount &&
            <div className="account-info">
              Account selected: {currentAccount}
            </div>
          }

        </main>
    );
  }