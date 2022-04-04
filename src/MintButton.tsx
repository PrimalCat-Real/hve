import styled from 'styled-components';
import {useEffect, useState} from 'react';
import Button from '@material-ui/core/Button';
import {CircularProgress} from '@material-ui/core';
import {GatewayStatus, useGateway} from '@civic/solana-gateway-react';
import {CandyMachine} from './candy-machine';


export const CTAButton = styled(Button)`
    padding: 6px 0 !important;
    width: 440px !important;
    font-family: "JMH-Cthulhumbus-Arcade-UG !important";
    font-style: normal !important;
    font-weight: 400 !important;
    font-size: 32px !important;
    line-height: 60px !important;
    color: #ffe199 !important;
    text-shadow: 0px 2px 0px #b7a372, 0px 4px 0px #42403c !important;
    border: 3px #ffe199 solid !important;
    border-radius: 15px !important;
    text-align: center !important;
    background: #803934 !important;
    justify-content: center !important;
    min-height: 80px !important;
`;

export const MintButton = ({
                               onMint,
                               candyMachine,
                               isMinting,
                               isEnded,
                               isActive,
                               isSoldOut
                           }: {
    onMint: () => Promise<void>;
    candyMachine: CandyMachine | undefined;
    isMinting: boolean;
    isEnded: boolean;
    isActive: boolean;
    isSoldOut: boolean;
}) => {
    const {requestGatewayToken, gatewayStatus} = useGateway();
    const [clicked, setClicked] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        setIsVerifying(false);
        if (gatewayStatus === GatewayStatus.COLLECTING_USER_INFORMATION && clicked) {
            // when user approves wallet verification txn
            setIsVerifying(true);
        } else if (gatewayStatus === GatewayStatus.ACTIVE && clicked) {
            console.log('Verified human, now minting...');
            onMint();
            setClicked(false);
        }
    }, [gatewayStatus, clicked, setClicked, onMint]);

    return (
        <CTAButton
            disabled={
                clicked ||
                candyMachine?.state.isSoldOut ||
                isSoldOut ||
                isMinting ||
                isEnded ||
                !isActive ||
                isVerifying
            }
            onClick={async () => {
                if (isActive && candyMachine?.state.gatekeeper && gatewayStatus !== GatewayStatus.ACTIVE) {
                    console.log('Requesting gateway token');
                    setClicked(true);
                    await requestGatewayToken();
                } else {
                    console.log('Minting...');
                    await onMint();
                }
            }}
            variant="contained"
        >
            {!candyMachine ? (
                "CONNECTING..."
            ) : candyMachine?.state.isSoldOut || isSoldOut ? (
                'SOLD OUT'
            ) : isActive ? (
                isVerifying ? 'VERIFYING...' :
                    isMinting || clicked ? (
                        <CircularProgress/>
                    ) : (
                        "MINT"
                    )
            ) : isEnded ? "ENDED" : (candyMachine?.state.goLiveDate ? (
                "SOON"
            ) : (
                "UNAVAILABLE"
            ))}
        </CTAButton>
    );
};
