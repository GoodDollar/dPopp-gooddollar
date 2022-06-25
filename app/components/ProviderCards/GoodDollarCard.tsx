// --- React Methods
import React, { useContext, useState, useEffect } from "react";

// --- Datadog
import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";

// --- Identity tools
import { fetchVerifiableCredential } from "@gitcoin/passport-identity/dist/commonjs/src/credentials";

// pull context
import { UserContext } from "../../context/userContext";

import { PROVIDER_ID } from "@gitcoin/passport-types";
import { ProviderSpec } from "../../config/providers";

// --- ethers utils for checksumming address
import { utils } from "ethers";

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

  useEffect(() => {
    if (!isLoading) {
      if (localStorage.getItem("gooddollarLogin")) {
        window.location.href = `http://localhost:3000${localStorage.getItem("gooddollarLogin")}`;
      }
    }
  }, [isLoading]);

  const gooddollarLinkDev = createLoginLink({
    redirectLink: "http://wallet.gooddollar.org/AppNavigation/LoginRedirect",
    v: "gitcoin-hackaton-test",
    web: "https://gooddollar.netlify.app",
    id: "0xDBF7272a7662f814a3Ab4cC901546161b8C86094",
    r: [],
    rdu: "http://localhost:3000/#/dashboard",
  });

  const handleFetchGoodCredential = async (data: any): Promise<void> => {
    try {
      if (data.error) return alert("Login request denied !");
      const parsed = (await parseLoginResponse(data)) as any;
      const checksum = address && utils.getAddress(address);

      // handle fetchVerifiableCredential
      setLoading(true);
      fetchVerifiableCredential(
        process.env.NEXT_PUBLIC_DPOPP_IAM_URL || "",
        {
          type: providerId,
          version: "0.0.0",
          address: checksum || "",
          proofs: {
            valid: parsed.isAddressWhitelisted.value,
            whitelistedAddress: parsed.walletAddrress.value, // note: not a typo
          },
        },
        signer as { signMessage: (message: string) => Promise<string> }
      )
        .then(async (verified: { credential: any }): Promise<void> => {
          await handleAddStamp({
            provider: providerId,
            credential: verified.credential,
          });
          // datadogLogs.logger.info("Successfully saved Stamp", { provider: "GoodDollar" });
          // localStorage.removeItem('gooddollarLogin');
          toast({
            duration: 5000,
            isClosable: true,
            render: (result: any) => <DoneToastContent providerId={providerId} result={result} />,
          });
        })
        .catch((e) => {
          // datadogLogs.logger.error("Verification Error", { error: e, provider: providerId });
          console.log("catch fetch error -->", { e });
          // localStorage.removeItem('gooddollarLogin')
          // TODO: handle error
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
      rdu="http://localhost:3000/#/dashboard"
    >
      Connect wallet
    </LoginButton>
  );

  return (
    <Card
      isLoading={isLoading}
      providerSpec={allProvidersState[providerId]!.providerSpec as ProviderSpec}
      issueCredentialWidget={issueCredentialWidget}
    />
  );
}
