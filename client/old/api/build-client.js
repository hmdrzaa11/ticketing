import axios from "axios";

export default ({ req }) => {
  if (typeof window === "undefined") {
    //we are on the server
    //we create a bre configured axios
    return axios.create({
      baseURL:
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser",
      headers: req.headers,
    });
  } else {
    return axios.create({}); // we do not need anything here because browsers is going to take care that
  }
};
