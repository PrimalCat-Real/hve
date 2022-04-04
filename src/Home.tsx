import {useEffect, useState} from "react";
import styled from "styled-components";
import confetti from "canvas-confetti";
import * as anchor from "@project-serum/anchor";
import {LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";
import {useAnchorWallet} from "@solana/wallet-adapter-react";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import {GatewayProvider} from '@civic/solana-gateway-react';
import Countdown from "react-countdown";
import {Snackbar, Paper, LinearProgress, Chip, Typography} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import {toDate, AlertState, getAtaForMint} from './utils';
import {MintButton} from './MintButton';
import NftImage from '../src/img/HvnDragon_2.png';
import Twitter from '../src/img/twitter.png';
import Discord from '../src/img/discord.png';
// import {NftDragon} from '../src/img/HvnDragon_2.jpg';

import {
    CandyMachine,
    awaitTransactionSignatureConfirmation,
    getCandyMachineState,
    mintOneToken,
    CANDY_MACHINE_PROGRAM,
} from "./candy-machine";

const cluster = process.env.REACT_APP_SOLANA_NETWORK!.toString();
const decimals = process.env.REACT_APP_SPL_TOKEN_TO_MINT_DECIMALS ? +process.env.REACT_APP_SPL_TOKEN_TO_MINT_DECIMALS!.toString() : 9;
const splTokenName = process.env.REACT_APP_SPL_TOKEN_TO_MINT_NAME ? process.env.REACT_APP_SPL_TOKEN_TO_MINT_NAME.toString() : "TOKEN";
//right block
const WalletContainer = styled.div`
width: 650px;
`;
//dragon nft img block
const NftImageBlock = styled.div`
    width: 100%;
    text-align: center;
    padding-top: 40px;
    height: 560px;
    margin: 0 auto;
    box-sizing: border-box;
    background: #652c2b;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    padding-left: 105px;
    padding-right: 105px;
    overflow: hidden;
`;
//suda
const DragonInfo = styled.div`
max-width: 750px;
display: flex;
justify-content: flex-end;
flex-direction: column;
box-shadow:none;
min-height: 720px;
`;

const DragonInfoTitle = styled.h1`
  font-family: "JMH Cthulhumbus Arcade UG";
  font-style: normal;
  font-weight: 400;
  font-size: 48px;
  line-height: 43px;
  color: #ffe199;
  text-align: left;
  text-shadow: 0px 2px 0px #b7a372, 0px 4px 0px #42403c;
`;
const DragonInfoDesc = styled.p`
font-family: "Lo-Sumires";
font-style: normal;
font-weight: 500;
font-size: 32px;
line-height: 32px;
opacity: 0.9;
text-align: left;
color: rgba(255, 234, 185, 0.9);
padding-right: 20px;

`;
const DragonInfoSection = styled.section`
display: flex;
justify-content: flex-start;
width: 760px;
background: #803934;
backdrop-filter: blur(20px);
min-height: 160px
align-items: center
`;
const DragonInfoArtical = styled.article`
padding: 50px 30px;
height: 60px;
border-right: 3px solid rgba(255, 225, 153, 0.8);
display: flex;
flex-direction: column;
justify-content: center;
text-align: start;
`;
const InfoCount = styled.h3`
width: 180px;

  font-family: "Lo-Sumires";
  font-style: normal;
  font-weight: 500;
  font-size: 52px;
  line-height: 50px;
  text-align: start;
  color: #ffe199;
  margin: 0;
  
`;
const InfoCountSub = styled.p`
margin: 0;
font-family: "Lo-Sumires";
font-style: normal;
font-weight: 500;
font-size: 36px;
color: #E4C392;
`;
const WalletAmount = styled.div`

  width: auto;
  padding: 5px 5px 5px 16px;
  min-width: 48px;
  min-height: auto;
  border-radius: 22px;
  background-color: var(--main-text-color);
  box-shadow: 0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 6px 10px 0px rgb(0 0 0 / 14%), 0px 1px 18px 0px rgb(0 0 0 / 12%);
  box-sizing: border-box;
  transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  font-weight: 500;
  line-height: 1.75;
  text-transform: uppercase;
  border: 0;
  margin: 0;
  display: inline-flex;
  outline: 0;
  position: relative;
  align-items: center;
  user-select: none;
  vertical-align: middle;
  justify-content: flex-start;
  gap: 10px;

`;

const Wallet = styled.ul`
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px 0;
  background: #803934;
  min-height: 100px;
`;

const ConnectButton = styled(WalletMultiButton)`
    padding: 36px 0;
    width: 440px;
    font-family: "JMH-Cthulhumbu-Arcade-UG";
    font-style: normal;
    font-weight: 400;
    font-size: 42px;
    line-height: 60px;
    color: #ffe199;
    text-shadow: 0px 2px 0px #b7a372, 0px 4px 0px #42403c;
    border: 3px #ffe199 solid;
    border-radius: 15px;
    text-align: center;
    background: #803934;
    justify-content: center;
`;

const NFT = styled(Paper)`
  min-width: 500px;
  flex: 1 1 auto;
  background-color: var(--card-background-color) !important;
  box-shadow: none !important;
`;

const Des = styled(NFT)`
  text-align: left;
  padding-top: 0px;
`;


const Card = styled.div`
  display: flex;
  font-family: "Lo-Sumires";
  font-style: normal;
  font-weight: 500;
  font-size: 52px;
  line-height: 50px;
  text-align: start;
`;
//suda
const MintButtonContainer = styled.div`
  
  button.MuiButton-contained:not(.MuiButton-containedPrimary).Mui-disabled {
    color: #fff
  }

  button.MuiButton-contained:not(.MuiButton-containedPrimary):hover,
  button.MuiButton-contained:not(.MuiButton-containedPrimary):focus {
    -webkit-animation: pulse 1s;
    animation: pulse 1s;
    box-shadow: 0 0 0 2em rgba(255, 255, 255, 0);
  }

  @-webkit-keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 #ef8f6e;
    }
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 #ef8f6e;
    }
  }
`;

const Logo = styled.div`
  flex: 0 0 auto;

  img {
    height: 60px;
  }
`;
const Menu = styled.ul`
  list-style: none;
  display: inline-flex;
  flex: 1 0 auto;

  li {
    margin: 0 12px;

    a {
      color: var(--main-text-color);
      list-style-image: none;
      list-style-position: outside;
      list-style-type: none;
      outline: none;
      text-decoration: none;
      text-size-adjust: 100%;
      touch-action: manipulation;
      transition: color 0.3s;
      padding-bottom: 15px;

      img {
        max-height: 26px;
      }
    }

    a:hover, a:active {
      color: rgb(131, 146, 161);
      border-bottom: 4px solid var(--title-text-color);
    }

  }
`;

const SolExplorerLink = styled.a`
  color: var(--title-text-color);
  border-bottom: 1px solid var(--title-text-color);
  font-weight: bold;
  list-style-image: none;
  list-style-position: outside;
  list-style-type: none;
  outline: none;
  text-decoration: none;
  text-size-adjust: 100%;

  :hover {
    border-bottom: 2px solid var(--title-text-color);
  }
`;
//главный контейнер
const MainContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: row;
  margin-right: 4%;
  margin-left: 4%;
  text-align: center;
  justify-content: space-between;
`;
//suda
const MintContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1 1 auto;
  flex-wrap: wrap;
  gap: 20px;
  max-height: 800px;
`;

const SocialBlock = styled.section`
display: flex;
justify-content: flex-start;
align-items: center;
`;
const SocialIcon = styled.img`

padding-left: 10px;

`;
const SocialLink = styled.a`
display: flex;
justify-content: space-between;
align-items: center;
padding: 6px 16px;
background: rgba(196, 196, 196, 0.1);
box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
border-radius: 20px;
margin-right: 34px;
margin-bottom: 50px;
text-decoration: none;
&:hover{
    opacity: 0.8;
  }
`;

const SocialLinkName =  styled.p`
font-family: "Lo-Sumires";
  font-style: normal;
  font-weight: 500;
  font-size: 32px;
  line-height: 31px;
  margin: 0;
  
`;

const DesContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 20px;
`;

const Price = styled(Chip)`
  position: absolute;
  margin: 5px;
  font-weight: bold;
  font-size: 1.2em !important;
  font-family: 'Patrick Hand', cursive !important;
`;

const Image = styled.img`
  height: 440px;
  width: 440px;
`;

const BorderLinearProgress = styled(LinearProgress)`
  height: 25px !important;
  border-radius: 20px;
  border: 9px solid #6C3635;
  width: 100%;
  background-color:#3d28277a !important;
  
  > div.MuiLinearProgress-barColorPrimary{
    background-color:#3d28277a !important;
  }

  > div.MuiLinearProgress-bar1Determinate {
    border-radius: 10px !important;
    background-color:#3d28277a !important;
    background: linear-gradient(90deg, #5e8e56 4.17%, #7bdc6b 99.38%);
  }
`;

const ShimmerTitle = styled.h1`
  margin: 20px auto;
  text-transform: uppercase;
  animation: glow 2s ease-in-out infinite alternate;
  color: var(--main-text-color);
  @keyframes glow {
    from {
      text-shadow: 0 0 20px var(--main-text-color);
    }
    to {
      text-shadow: 0 0 30px var(--title-text-color), 0 0 10px var(--title-text-color);
    }
  }
`;

const GoldTitle = styled.h2`
  color: var(--title-text-color);
`;

const LogoAligner = styled.div`
  display: flex;
  align-items: center;

  img {
    max-height: 35px;
    margin-right: 10px;
  }
`;


export interface HomeProps {
    candyMachineId: anchor.web3.PublicKey;
    connection: anchor.web3.Connection;
    txTimeout: number;
    rpcHost: string;
}

const Home = (props: HomeProps) => {
    const [balance, setBalance] = useState<number>();
    const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT
    const [isActive, setIsActive] = useState(false); // true when countdown completes or whitelisted
    const [solanaExplorerLink, setSolanaExplorerLink] = useState<string>("");
    const [itemsAvailable, setItemsAvailable] = useState(0);
    const [itemsRedeemed, setItemsRedeemed] = useState(0);
    const [itemsRemaining, setItemsRemaining] = useState(0);
    const [isSoldOut, setIsSoldOut] = useState(false);
    const [payWithSplToken, setPayWithSplToken] = useState(false);
    const [price, setPrice] = useState(0);
    const [priceLabel, setPriceLabel] = useState<string>("SOL");
    const [whitelistPrice, setWhitelistPrice] = useState(0);
    const [whitelistEnabled, setWhitelistEnabled] = useState(false);
    const [isBurnToken, setIsBurnToken] = useState(false);
    const [whitelistTokenBalance, setWhitelistTokenBalance] = useState(0);
    const [isEnded, setIsEnded] = useState(false);
    const [endDate, setEndDate] = useState<Date>();
    const [isPresale, setIsPresale] = useState(false);
    const [isWLOnly, setIsWLOnly] = useState(false);

    const [alertState, setAlertState] = useState<AlertState>({
        open: false,
        message: "",
        severity: undefined,
    });

    const wallet = useAnchorWallet();
    const [candyMachine, setCandyMachine] = useState<CandyMachine>();

    const rpcUrl = props.rpcHost;

    const refreshCandyMachineState = () => {
        (async () => {
            if (!wallet) return;

            const cndy = await getCandyMachineState(
                wallet as anchor.Wallet,
                props.candyMachineId,
                props.connection
            );

            setCandyMachine(cndy);
            setItemsAvailable(cndy.state.itemsAvailable);
            setItemsRemaining(cndy.state.itemsRemaining);
            setItemsRedeemed(cndy.state.itemsRedeemed);

            var divider = 1;
            if (decimals) {
                divider = +('1' + new Array(decimals).join('0').slice() + '0');
            }

            // detect if using spl-token to mint
            if (cndy.state.tokenMint) {
                setPayWithSplToken(true);
                // Customize your SPL-TOKEN Label HERE
                // TODO: get spl-token metadata name
                setPriceLabel(splTokenName);
                setPrice(cndy.state.price.toNumber() / divider);
                setWhitelistPrice(cndy.state.price.toNumber() / divider);
            }else {
                setPrice(cndy.state.price.toNumber() / LAMPORTS_PER_SOL);
                setWhitelistPrice(cndy.state.price.toNumber() / LAMPORTS_PER_SOL);
            }


            // fetch whitelist token balance
            if (cndy.state.whitelistMintSettings) {
                setWhitelistEnabled(true);
                setIsBurnToken(cndy.state.whitelistMintSettings.mode.burnEveryTime);
                setIsPresale(cndy.state.whitelistMintSettings.presale);
                setIsWLOnly(!isPresale && cndy.state.whitelistMintSettings.discountPrice === null);

                if (cndy.state.whitelistMintSettings.discountPrice !== null && cndy.state.whitelistMintSettings.discountPrice !== cndy.state.price) {
                    if (cndy.state.tokenMint) {
                        setWhitelistPrice(cndy.state.whitelistMintSettings.discountPrice?.toNumber() / divider);
                    } else {
                        setWhitelistPrice(cndy.state.whitelistMintSettings.discountPrice?.toNumber() / LAMPORTS_PER_SOL);
                    }
                }

                let balance = 0;
                try {
                    const tokenBalance =
                        await props.connection.getTokenAccountBalance(
                            (
                                await getAtaForMint(
                                    cndy.state.whitelistMintSettings.mint,
                                    wallet.publicKey,
                                )
                            )[0],
                        );

                    balance = tokenBalance?.value?.uiAmount || 0;
                } catch (e) {
                    console.error(e);
                    balance = 0;
                }
                setWhitelistTokenBalance(balance);
                setIsActive(isPresale && !isEnded && balance > 0);
            } else {
                setWhitelistEnabled(false);
            }

            // end the mint when date is reached
            if (cndy?.state.endSettings?.endSettingType.date) {
                setEndDate(toDate(cndy.state.endSettings.number));
                if (
                    cndy.state.endSettings.number.toNumber() <
                    new Date().getTime() / 1000
                ) {
                    setIsEnded(true);
                    setIsActive(false);
                }
            }
            // end the mint when amount is reached
            if (cndy?.state.endSettings?.endSettingType.amount) {
                let limit = Math.min(
                    cndy.state.endSettings.number.toNumber(),
                    cndy.state.itemsAvailable,
                );
                setItemsAvailable(limit);
                if (cndy.state.itemsRedeemed < limit) {
                    setItemsRemaining(limit - cndy.state.itemsRedeemed);
                } else {
                    setItemsRemaining(0);
                    cndy.state.isSoldOut = true;
                    setIsEnded(true);
                }
            } else {
                setItemsRemaining(cndy.state.itemsRemaining);
            }

            if (cndy.state.isSoldOut) {
                setIsActive(false);
            }
        })();
    };

    const renderGoLiveDateCounter = ({days, hours, minutes, seconds}: any) => {
        return (
            <Card>{hours}:{minutes}:{seconds}</Card>
        );
    };
    const renderGoLiveDateCounter2 = ({days, hours, minutes, seconds}: any) => {
        return (
            <Card>{hours - 1}:{minutes}:{seconds}</Card>
        );
    };

    const renderEndDateCounter = ({days, hours, minutes}: any) => {
        let label = "";
        if (days > 0) {
            label += days + " days "
        }
        if (hours > 0) {
            label += hours + " hours "
        }
        label += (minutes+1) + " minutes left to MINT."
        return (
            <div><h3>{label}</h3></div>
        );
    };

    function displaySuccess(mintPublicKey: any): void {
        let remaining = itemsRemaining - 1;
        setItemsRemaining(remaining);
        setIsSoldOut(remaining === 0);
        if (isBurnToken && whitelistTokenBalance && whitelistTokenBalance > 0) {
            let balance = whitelistTokenBalance - 1;
            setWhitelistTokenBalance(balance);
            setIsActive(isPresale && !isEnded && balance > 0);
        }
        setItemsRedeemed(itemsRedeemed + 1);
        const solFeesEstimation = 0.012; // approx
        if (!payWithSplToken && balance && balance > 0) {
            setBalance(balance - (whitelistEnabled ? whitelistPrice : price) - solFeesEstimation);
        }
        setSolanaExplorerLink(cluster === "devnet" || cluster === "testnet"
            ? ("https://solscan.io/token/" + mintPublicKey + "?cluster=" + cluster)
            : ("https://solscan.io/token/" + mintPublicKey));
        throwConfetti();
    };

    function throwConfetti(): void {
        confetti({
            particleCount: 400,
            spread: 70,
            origin: {y: 0.6},
        });
    }

    const onMint = async () => {
        try {
            setIsMinting(true);
            if (wallet && candyMachine?.program && wallet.publicKey) {
                const mint = anchor.web3.Keypair.generate();
                const mintTxId = (
                    await mintOneToken(candyMachine, wallet.publicKey, mint)
                )[0];

                let status: any = {err: true};
                if (mintTxId) {
                    status = await awaitTransactionSignatureConfirmation(
                        mintTxId,
                        props.txTimeout,
                        props.connection,
                        'singleGossip',
                        true,
                    );
                }

                if (!status?.err) {
                    setAlertState({
                        open: true,
                        message: 'Congratulations! Mint succeeded!',
                        severity: 'success',
                    });

                    // update front-end amounts
                    displaySuccess(mint.publicKey);
                } else {
                    setAlertState({
                        open: true,
                        message: 'Mint failed! Please try again!',
                        severity: 'error',
                    });
                }
            }
        } catch (error: any) {
            // TODO: blech:
            let message = error.msg || 'Minting failed! Please try again!';
            if (!error.msg) {
                if (!error.message) {
                    message = 'Transaction Timeout! Please try again.';
                } else if (error.message.indexOf('0x138')) {
                } else if (error.message.indexOf('0x137')) {
                    message = `SOLD OUT!`;
                } else if (error.message.indexOf('0x135')) {
                    message = `Insufficient funds to mint. Please fund your wallet.`;
                }
            } else {
                if (error.code === 311) {
                    message = `SOLD OUT!`;
                } else if (error.code === 312) {
                    message = `Minting period hasn't started yet.`;
                }
            }

            setAlertState({
                open: true,
                message,
                severity: "error",
            });
        } finally {
            setIsMinting(false);
        }
    };


    useEffect(() => {
        (async () => {
            if (wallet) {
                const balance = await props.connection.getBalance(wallet.publicKey);
                setBalance(balance / LAMPORTS_PER_SOL);
            }
        })();
    }, [wallet, props.connection]);

    useEffect(refreshCandyMachineState, [
        wallet,
        props.candyMachineId,
        props.connection,
        isEnded,
        isPresale
    ]);
    console.log(isActive)
    return (
        <main>
            <MainContainer>
                
                {/* <ShimmerTitle>MINT IS LIVE !</ShimmerTitle> */}
                <br/>
                <MintContainer>
                    <DesContainer>
                    <NFT elevation={3}>
                        <DragonInfo>
                            
                            <DragonInfoTitle>Empire Dragons Adventure</DragonInfoTitle>
                            <DragonInfoDesc>Multiplayer support for up to four players! This is a "belt-scroll" x
                            "free exploration" action game. Make full use of each character's
                            individuality, solve the gimmicks hidden in the MAP, and defeat the
                            final boss "Ancient Dragon" in all 5 stages!</DragonInfoDesc>
                            <DragonInfoDesc>A world where monsters are rampant. The overwhelming numbers and power
                            of the monsters threaten the survival of the human race. Then, he
                            hears a rumor about dragons.</DragonInfoDesc>
                            <DragonInfoSection>
                            <DragonInfoArtical>
                            <InfoCount>{(wallet && !isActive && !isEnded && candyMachine?.state.goLiveDate && (!isWLOnly || whitelistTokenBalance > 0)) ? (<Countdown
                                        date={toDate(candyMachine?.state.goLiveDate)}
                                        onMount={({completed}) => completed && setIsActive(!isEnded)}
                                        onComplete={() => {
                                            setIsActive(!isEnded);
                                        }}
                                        renderer={renderGoLiveDateCounter2}
                                    />): "00:00:00"}</InfoCount>
                                <InfoCountSub>Whitelist</InfoCountSub>
                            </DragonInfoArtical>
                            <DragonInfoArtical>
                            <InfoCount>{(wallet && !isActive && !isEnded && candyMachine?.state.goLiveDate && (!isWLOnly || whitelistTokenBalance > 0)) ? (<Countdown
                                        date={toDate(candyMachine?.state.goLiveDate)}
                                        onMount={({completed}) => completed && setIsActive(!isEnded)}
                                        onComplete={() => {
                                            setIsActive(!isEnded);
                                        }}
                                        renderer={renderGoLiveDateCounter}
                                    />): "00:00:00"}</InfoCount>
                            <InfoCountSub>Public</InfoCountSub>
                            </DragonInfoArtical>
                            <DragonInfoArtical
                            style={{
                                border:"none",
                            }}
                            >
                            <InfoCount>{wallet ? (itemsRedeemed < 100? (1000 - (itemsRedeemed)): "Sold out"): 1000}</InfoCount>
                            <InfoCountSub>WL Remain</InfoCountSub>
                            </DragonInfoArtical>
                        </DragonInfoSection>
                        </DragonInfo>
                        
                            {/* <h2>My NFT</h2>
                            <br/>
                            <div><Price
                                label={isActive && whitelistEnabled && (whitelistTokenBalance > 0) ? (whitelistPrice + " " + priceLabel) : (price + " " + priceLabel)}/><Image
                                src="cool-cats.gif"
                                alt="NFT To Mint"/></div>
                            <br/> */}
                            {/* {wallet && isActive && <BorderLinearProgress variant="determinate"
                                                                         value={100 - (itemsRemaining * 100 / itemsAvailable)}/>} */}
                            {/* <ConnectButton/> */}
                            {/* <MintButtonContainer>
                            
                                {!isActive && !isEnded && candyMachine?.state.goLiveDate && (!isWLOnly || whitelistTokenBalance > 0) ? (
                                    <Countdown
                                        date={toDate(candyMachine?.state.goLiveDate)}
                                        onMount={({completed}) => completed && setIsActive(!isEnded)}
                                        onComplete={() => {
                                            setIsActive(!isEnded);
                                        }}
                                        renderer={renderGoLiveDateCounter}
                                    />) : (
                                    !wallet ? (
                                            <ConnectButton>Connect Wallet</ConnectButton>
                                        ) : (!isWLOnly || whitelistTokenBalance > 0) ?
                                        candyMachine?.state.gatekeeper &&
                                        wallet.publicKey &&
                                        wallet.signTransaction ? (
                                            <GatewayProvider
                                                wallet={{
                                                    publicKey:
                                                        wallet.publicKey ||
                                                        new PublicKey(CANDY_MACHINE_PROGRAM),
                                                    //@ts-ignore
                                                    signTransaction: wallet.signTransaction,
                                                }}
                                                // // Replace with following when added
                                                // gatekeeperNetwork={candyMachine.state.gatekeeper_network}
                                                gatekeeperNetwork={
                                                    candyMachine?.state?.gatekeeper?.gatekeeperNetwork
                                                } // This is the ignite (captcha) network
                                                /// Don't need this for mainnet
                                                clusterUrl={rpcUrl}
                                                options={{autoShowModal: false}}
                                            >
                                                <MintButton
                                                    candyMachine={candyMachine}
                                                    isMinting={isMinting}
                                                    isActive={isActive}
                                                    isEnded={isEnded}
                                                    isSoldOut={isSoldOut}
                                                    onMint={onMint}
                                                />
                                            </GatewayProvider>
                                        ) : (
                                            <MintButton
                                                candyMachine={candyMachine}
                                                isMinting={isMinting}
                                                isActive={isActive}
                                                isEnded={isEnded}
                                                isSoldOut={isSoldOut}
                                                onMint={onMint}
                                            />
                                        ) :
                                        <h1>Mint is private.</h1>
                                        )}
                            </MintButtonContainer> */}
                        </NFT>
                        <SocialBlock>
                            <SocialLink href="#" className="socials">
                                <SocialLinkName style={{
                                    color: "#1da1f2",
                                    textShadow: "0px 2px 0px #3f4549"
                                }}>Twitter</SocialLinkName>
                                <SocialIcon
                                style={{
                                    width:"28px",
                                    height:"25px",
                                }}  
                                src={Twitter}
                                ></SocialIcon>
                            </SocialLink>
                            <SocialLink href="#">
                                <SocialLinkName style={{color:" #5865F2",
                                    textShadow:"0px 2px 0px #484C77",}}>Discord</SocialLinkName>
                                    <SocialIcon 
                                    style={{
                                        width:"35px",
                                        height:"27px",
                                    }} 
                                    src={Discord}
                                    ></SocialIcon>
                            </SocialLink>
                        </SocialBlock>
                    </DesContainer>
                    {/* <DesContainer>
                        <Des elevation={2}>
                            <LogoAligner><img src="logo.png" alt=""></img><GoldTitle>TITLE 1</GoldTitle></LogoAligner>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                                incididunt.</p>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                                incididunt.</p>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                                incididunt.</p>
                        </Des>
                        <Des elevation={2}>
                            <LogoAligner><img src="logo.png" alt=""></img><GoldTitle>TITLE 2</GoldTitle></LogoAligner>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                                incididunt.</p>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                                incididunt.</p>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                                incididunt.</p>
                        </Des>
                        <Des elevation={2}>
                            <LogoAligner><img src="logo.png" alt=""></img><GoldTitle>TITLE 3</GoldTitle></LogoAligner>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                                incididunt.</p>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                                incididunt.</p>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                                incididunt.</p>
                        </Des>
                    </DesContainer> */}
                </MintContainer>
                <WalletContainer>
                    <NftImageBlock>
                        <Image src={NftImage}
                                // src="HvnDragon_2.jpg"
                                alt="NFT To Mint"/>
                         {/* количесво заминченых */}
                        <div style={{ 
                            position: "relative",
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                            <BorderLinearProgress
                            variant="determinate"
                            value={100 - (itemsRemaining * 100 / itemsAvailable)}
                            ></BorderLinearProgress>
                            <Typography
                                style={{
                                    position: "absolute",
                                    color: "white",
                                    zIndex: 2,
                                    fontFamily: "Press-Start-2P",
                                    fontSize: "13px",
                                    marginTop: "3px"
                                    
                                }}
                                >
                                {itemsAvailable - itemsRemaining}/{itemsAvailable}
                                </Typography>
                        </div> 
                         {/* <BorderLinearProgress variant="determinate"
                                                                         value={100 - (itemsRemaining * 100 / itemsAvailable)}/>
                         {wallet && isActive &&
                              <h3>TOTAL MINTED : {itemsRedeemed} / {itemsAvailable}</h3>} */}
                            {/* {wallet && isActive && } */}
                    </NftImageBlock>
                    <Wallet>
                        
                        {wallet ?
                                <MintButton
                                candyMachine={candyMachine}
                                isMinting={isMinting}
                                isActive={isActive}
                                isEnded={isEnded}
                                isSoldOut={isSoldOut}
                                onMint={onMint}
                            />:
                        
                            <ConnectButton>Connect Wallet</ConnectButton>
                        //         <MintButton
                        //     candyMachine={candyMachine}
                        //     isMinting={isMinting}
                        //     isActive={isActive}
                        //     isEnded={isEnded}
                        //     isSoldOut={isSoldOut}
                        //     onMint={onMint}
                        // /> :
                            }
                    </Wallet>
                </WalletContainer>
            </MainContainer>
            <Snackbar
                open={alertState.open}
                autoHideDuration={6000}
                onClose={() => setAlertState({...alertState, open: false})}
            >
                <Alert
                    onClose={() => setAlertState({...alertState, open: false})}
                    severity={alertState.severity}
                >
                    {alertState.message}
                </Alert>
            </Snackbar>
        </main>
    );
};

export default Home;
