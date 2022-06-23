// --- React Methods
import React, { useContext, useState } from "react";

// --- Datadog
import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";

// --- Identity tools
import { fetchVerifiableCredential } from "@gitcoin/passport-identity/dist/commonjs/src/credentials";

// pull context
import { UserContext } from "../../context/userContext";

import { PROVIDER_ID, Stamp } from "@gitcoin/passport-types";
import { ProviderSpec } from "../../config/providers";

const iamUrl = process.env.NEXT_PUBLIC_DPOPP_IAM_URL || "";

// --- import components
import { Card } from "../Card";
import { VerifyModal } from "../VerifyModal";
import { useDisclosure, useToast } from "@chakra-ui/react";
import { DoneToastContent } from "../DoneToastContent";

// --- gooddollar client sdk
import { useLogin, LoginButton, createLoginLink, parseLoginResponse } from "client-sdk-gooddollar";

const providerId: PROVIDER_ID = "GoodDollar";

export default function GoodDollarCard(): JSX.Element {
  const { address, signer, handleAddStamp, allProvidersState } = useContext(UserContext);
  const [isLoading, setLoading] = useState(false);
  const [gooddollarData, setGooddollarData] = useState<any>({});

  const gooddollarLinkDev = createLoginLink({
    redirectLink: "http://wallet.gooddollar.org/AppNavigation/LoginRedirect",
    v: "gitcoin-hackaton-test",
    web: "https://gooddollar.netlify.app",
    id: "0xDBF7272a7662f814a3Ab4cC901546161b8C86094",
    r: ["email"],
    rdu: "http://localhost:3000/#/dashboard",
  });

  const handleFetchGoodCredential = async (data: any): Promise<void> => {
    try {
      if (data.error) return alert("Login request denied !");
      console.log("handleFetchGoodCrendential -- data -->", { data });

      // handle fetchVerifiableCredential
      // Handle add stamp

      // setGooddollarData(await parseLoginResponse(data));
      // console.log("cool stuff happening", parseLoginResponse(data));
    } catch (e) {
      console.log(e);
    }
  };

  // const issueCredentialWidget = (
  //   <button data-testid="button-verify-gooddollar" className="verify-btn" onClick={handleFetchGoodCredential}>
  //     Connect account
  //   </button>
  // );

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
