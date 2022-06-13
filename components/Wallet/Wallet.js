import React, { useCallback } from "react";
import Image from "next/image";
import { getImage, getName } from "../../utils/web3";
import { getAddChainParameters } from "../../chains";
import { useToaster } from "rsuite";
import NotificationUI from "../Notification";
import Router from "next/router";
import { useDrawerDispatch, closeDrawer, useDrawerState } from "../useDrawer";
import { WalletConnect } from "@web3-react/walletconnect";

export function Wallet({ connector, isActivating, isActive, error, chainId }) {
  return (
    <div className="flex rounded-lg p-[16px] border justify-between cursor-pointer hover:shadow-lg transition-all ease-in hover:bg-blue-50/30">
      <div className="flex gap-4">
        <Image
          src={getImage(connector)}
          width={24}
          height={24}
          alt={`${getName(connector)}-icon`}
        />
        <p className="font-bold">{getName(connector)}</p>
      </div>
      {error ? (
        // <p className="text-red-500 font-xs">{error.message}</p>
        <></>
      ) : isActivating ? (
        <p className="text-white text-blue-500 rounded-xl font-semibold">
          Connecting
        </p>
      ) : isActive && chainId === 4 ? (
        <p className="text-white text-blue-500 rounded-xl font-semibold">
          Disconnect
        </p>
      ) : (
        <></>
      )}
    </div>
  );
}

export function WalletContainer({
  connector,
  isActivating,
  isActive,
  error,
  setError,
  referrer,
  chainId,
}) {
  const { isDrawerOpen } = useDrawerState();
  const desiredChainId = 4;
  const toaster = useToaster();
  const drawerDispatch = useDrawerDispatch();
  async function referToPage() {
    try {
      if (isDrawerOpen) {
        closeDrawer(drawerDispatch);
      }
      Router.push(`${referrer}`);
    } catch (e) {
      console.log("Error when login: ", e);
    }
  }

  const onClick = useCallback(() => {
    setError(undefined);
    if (connector instanceof WalletConnect) {
      connector
        .activate(desiredChainId === -1 ? undefined : desiredChainId)
        .then(() => {
          setError(undefined);
          referToPage();
        })
        .catch((e) => {
          setError(e);
          const notificationKey = toaster.push(
            <NotificationUI message={e.message} type="error" />,
            {
              placement: "bottomEnd",
            }
          );
          setTimeout(() => toaster.remove(notificationKey), 2500);
        });
    } else {
      connector
        .activate(
          desiredChainId === -1
            ? undefined
            : getAddChainParameters(desiredChainId)
        )
        .then(() => {
          setError(undefined);
          referToPage();
        })
        .catch((e) => {
          setError(e);
          const notificationKey = toaster.push(
            <NotificationUI message={e.message} type="error" />,
            {
              placement: "bottomEnd",
            }
          );
          setTimeout(() => toaster.remove(notificationKey), 2500);
        });
    }
  }, [connector, desiredChainId, setError]);

  if (error) {
    return (
      <div onClick={onClick}>
        <Wallet
          connector={connector}
          isActivating={isActivating}
          isActive={isActive}
          error={error}
          chainId={chainId}
        />
      </div>
    );
  } else if (isActive && chainId === 4) {
    referToPage();
    return (
      <div
        onClick={() => {
          if (connector?.deactivate) {
            void connector.deactivate();
          } else {
            void connector.resetState();
          }
        }}
      >
        <Wallet
          connector={connector}
          isActivating={isActivating}
          isActive={isActive}
          error={error}
          chainId={chainId}
        />
      </div>
    );
  } else {
    return (
      <div
        onClick={
          isActivating
            ? undefined
            : () =>
                connector instanceof WalletConnect
                  ? connector
                      .activate(
                        desiredChainId === -1 ? undefined : desiredChainId
                      )
                      .then(() => {
                        setError(undefined);
                        referToPage();
                      })
                      .catch((e) => {
                        setError(e);
                        const notificationKey = toaster.push(
                          <NotificationUI message={e.message} type="error" />,
                          {
                            placement: "bottomEnd",
                          }
                        );
                        setTimeout(() => toaster.remove(notificationKey), 2500);
                      })
                  : connector
                      .activate(
                        desiredChainId === -1
                          ? undefined
                          : getAddChainParameters(desiredChainId)
                      )
                      .then(() => {
                        setError(undefined);
                        referToPage();
                      })
                      .catch((e) => {
                        setError(e);
                        const notificationKey = toaster.push(
                          <NotificationUI message={e.message} type="error" />,
                          {
                            placement: "bottomEnd",
                          }
                        );
                        setTimeout(() => toaster.remove(notificationKey), 2500);
                      })
        }
        disabled={isActivating}
      >
        <Wallet
          connector={connector}
          isActivating={isActivating}
          isActive={isActive}
          error={error}
          chainId={chainId}
        />
      </div>
    );
  }
}
