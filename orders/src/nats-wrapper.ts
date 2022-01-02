import nats, { Stan } from "node-nats-streaming";

class NatsWrapper {
  private _client?: Stan; //we make it optional because we are not going to ask "Constructor" to create this for us and if we
  //leave it like that typescript is going to get mad so we make it optional

  get client() {
    if (!this._client) {
      throw new Error("Cannot access NATS client before connecting");
    }
    return this._client;
  }
  connect(clusterId: string, clientId: string, url: string): Promise<void> {
    this._client = nats.connect(clusterId, clientId, { url });
    //we do not  want to use "callback" we want to be able use the "async/await" syntax
    return new Promise((resolve, reject) => {
      this._client!.on("connect", () => {
        console.log("Connected to NATS");
        resolve();
      });

      this._client!.on("error", (err) => {
        //we also going to check the "error" case as well
        reject(err);
      });
    });
  }
}

export let natsWrapper = new NatsWrapper();
