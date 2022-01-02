import "bootstrap/dist/css/bootstrap.css";
import buildClient from "../api/build-client";
import Header from "../components/header";

let AppComponent = ({ Component, pageProps }) => {
  //and all of those props are going to come in here and we pass all of those"pageProps" into the Component and also any other
  //props is for the "AppComponent" itself
  return (
    <div>
      {/* <Header currentUser={currentUser} />
      <Component {...pageProps} />; */}
      <Component {...pageProps} />
    </div>
  );
};

// AppComponent.getInitialProps = async (appContext) => {
// let axios = buildClient(appContext.ctx);
// let { data } = await axios.get("/api/users/currentuser");
// //we are going to call "getInitialProps" of the Child component and receive all the Props and then manually pass them into props
// let pageProps = {};
// if (appContext.Component.getInitialProps) {
//   pageProps = await appContext.Component.getInitialProps(appContext.ctx);
// }
// //now we need to share all of these data and pass them to the correct Component

// return {
//   pageProps, // this is going to showup up there in the props
//   ...data,
// };

// };

export default AppComponent;
