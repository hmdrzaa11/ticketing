import axios from "axios";
import buildClient from "../api/build-client";

let LandingPage = ({ currentUser }) => {
  // return currentUser ? <h1>Signed in </h1> : <h1>Signed out</h1>;
  console.log(currentUser);
  return <h1>Landing Page</h1>;
};

LandingPage.getInitialProps = async (context) => {
  if (typeof window === "undefined") {
    try {
      let { data } = await axios.get(
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser",
        {
          headers: {
            Host: "localhost",
          },
        }
      );
      console.log("FROM SERVER : ", data);
      return data;
    } catch (error) {
      console.log(error);
      return {};
    }
  } else {
    let response = await axios.get("/api/users/currentuser");
    return response.data;
  }
};

export default LandingPage;
