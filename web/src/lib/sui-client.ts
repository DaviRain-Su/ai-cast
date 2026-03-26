import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { NETWORK } from "./constants";

export const suiClient = new SuiJsonRpcClient({
  url: getJsonRpcFullnodeUrl(NETWORK),
  network: NETWORK,
});
