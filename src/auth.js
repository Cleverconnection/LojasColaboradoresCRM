import { PublicClientApplication } from "@azure/msal-browser";

const redirectUri = `${window.location.origin}/LojasColaboradoresCRM/`;

export const msalConfig = {
  auth: {
    clientId: "2d7bcc44-8337-42ec-a3e2-6ba7c9bda91f",
    authority: "https://login.microsoftonline.com/common",
    redirectUri,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read", "Files.ReadWrite.All"],
};

const msalInstance = new PublicClientApplication(msalConfig);

export default msalInstance;
