// --- React Methods
import React, { useContext, useState, useEffect } from "react";
import { debounce } from "ts-debounce";
import { BroadcastChannel } from "broadcast-channel";

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
import { useLogin, LoginButton, createLoginLink, parseLoginResponse } from "@gooddollar/goodlogin-sdk";

const providerId: PROVIDER_ID = "GoodDollar";

export default function GoodDollarCard(): JSX.Element {
  const { address, signer, handleAddStamp, allProvidersState } = useContext(UserContext);
  const [isLoading, setLoading] = useState(false);
  const [gooddollarData, setGooddollarData] = useState<any>({});

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

  // console.log('gooddollarLinkDev -->', {gooddollarLinkDev})

  // function listenForRedirect(e: { target: string; data: { code: string; state: string } }) {
  //   console.log('e listenforredirect gd -->', e);
  // }

  const mockData = {
    a: { value: "0x3B7275C428c9B46D2c244E066C0bbadB9B9a8B9f" },
    error: undefined,
  };

  const handleFetchGoodCredential = async (data: any): Promise<void> => {
    try {
      if (data.error) return alert("Login request denied !");
      // console.log("handleFetchGoodCrendential -- data -->", { data });
      const parsed = await parseLoginResponse(data);
      console.log("handleFetchGoodCrendential -- data -->", { data, parsed });

      // handle fetchVerifiableCredential
      // setLoading(true);
      // fetchVerifiableCredential(
      //   process.env.NEXT_PUBLIC_DPOPP_IAM_URL || "",
      //   {
      //     type: providerId,
      //     version: "0.0.0",
      //     address: mockData.a.value,
      //     proofs: {
      //       code: ''
      //     },
      //   },
      //   signer as { signMessage: (message: string) => Promise<string> }
      // ).then (async (verified: { credential: any}): Promise<void> => {
      //     await handleAddStamp({
      //       provider: providerId,
      //       credential: verified.credential,
      //     });
      //     // datadogLogs.logger.info("Successfully saved Stamp", { provider: "GoodDollar" });
      //   })
      //   .catch((e) => {
      //     // datadogLogs.logger.error("Verification Error", { error: e, provider: providerId });
      //     throw e;
      //   })
      //   .finally(() => {
      //     setLoading(false);
      //   });
      // Handle add stamp

      // setGooddollarData(await parseLoginResponse(data));
      // console.log("cool stuff happening", parseLoginResponse(data));
    } catch (e) {
      console.log(e);
    }
  };

  // when using cbu
  // useEffect(() => {
  //   const channel = new BroadcastChannel("gooddollar_verify_channel")

  //   console.log('channel gd -->', {channel})
  //   channel.onmessage = debounce(listenForRedirect, 300);

  //   return () => {
  //     channel.close();
  //   }
  // })

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
