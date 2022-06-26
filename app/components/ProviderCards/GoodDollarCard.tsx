// --- React Methods
import React, { useContext, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// --- Datadog
import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";

// --- Identity tools
import { fetchVerifiableCredential } from "@gitcoin/passport-identity/dist/commonjs/src/credentials";

// pull context
import { UserContext } from "../../context/userContext";

import { PROVIDER_ID } from "@gitcoin/passport-types";

// --- import components
import { Card } from "../Card";
import { useToast } from "@chakra-ui/react";
import { DoneToastContent } from "../DoneToastContent";

// --- gooddollar client sdk
import { LoginButton, createLoginLink, parseLoginResponse } from "@gooddollar/goodlogin-sdk";

const providerId: PROVIDER_ID = "GoodDollar";

export default function GoodDollarCard(): JSX.Element {
  const { address, signer, handleAddStamp, allProvidersState } = useContext(UserContext);
  const [isLoading, setLoading] = useState(false);
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!isLoading) {
      if (localStorage.getItem("gooddollarLogin")) {
        window.location.href = `http://localhost:3000${localStorage.getItem("gooddollarLogin")}`;
      }
    }
  }, [isLoading]);

  //TODO: verify all these details
  const gooddollarLinkDev = createLoginLink({
    redirectLink: "https://wallet.gooddollar.org/AppNavigation/LoginRedirect",
    v: "gitcoin-hackaton-test",
    web: "https://passport.gitcoin.co",
    id: "0xDBF7272a7662f814a3Ab4cC901546161b8C86094",
    r: [],
    rdu: window.location.href,
  });

  const clearLogin = () => {
    const loginParam = searchParams.get("login");
    if (loginParam) {
      localStorage.removeItem("gooddollarLogin");
      searchParams.delete("login");
      setSearchParams(searchParams);
    }
  };

  const handleFetchGoodCredential = async (data: any): Promise<void> => {
    try {
      clearLogin();

      if (data.error) {
        toast({
          id: "gd-login-denied",
          duration: 2500,
          isClosable: true,
          status: "error",
          title: "Request to login was denied!",
        });
        return;
      }

      const parsed = await parseLoginResponse(data);
      //TODO: which address are we passing to credential?
      let credentialAddress = address || parsed.walletAddress.value;

      setLoading(true);
      fetchVerifiableCredential(
        process.env.NEXT_PUBLIC_DPOPP_IAM_URL || "",
        {
          type: providerId,
          version: "0.0.0",
          address: credentialAddress || "",
          proofs: {
            valid: parsed.isAddressWhitelisted.value,
            whitelistedAddress: parsed.walletAddrress.value, // note: not a typo
          },
        },
        signer as { signMessage: (message: string) => Promise<string> }
      )
        .then(async (verified): Promise<void> => {
          await handleAddStamp({
            provider: providerId,
            credential: verified.credential,
          });
          datadogLogs.logger.info("Successfully saved Stamp", { provider: "GoodDollar" });
          toast({
            duration: 5000,
            isClosable: true,
            render: (result: any) => <DoneToastContent providerId={providerId} result={result} />,
          });
        })
        .catch((e) => {
          datadogLogs.logger.error("Verification Error", { error: e, provider: providerId });
          clearLogin();
          toast({
            id: "gd-failed-verification",
            duration: 2500,
            isClosable: true,
            status: "error",
            title: "Your GoodDollar verification failed. Try again!",
          });
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (e) {
      console.log(e);
    }
  };

  const issueCredentialWidget = (
    <LoginButton
      data-testid="button-verify-gooddollar"
      className="verify-btn"
      onLoginCallback={handleFetchGoodCredential}
      gooddollarlink={gooddollarLinkDev}
      rdu={window.location.href}
    >
      Connect wallet
    </LoginButton>
  );

  return (
    <Card
      isLoading={isLoading}
      providerSpec={allProvidersState[providerId]!.providerSpec}
      verifiableCredential={allProvidersState[providerId]!.stamp?.credential}
      issueCredentialWidget={issueCredentialWidget}
    />
  );
}
