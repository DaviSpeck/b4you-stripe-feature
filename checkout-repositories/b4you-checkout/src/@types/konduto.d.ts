window.konduto.getSessionId();

declare interface Window {
  Konduto: {
    getVisitorID(): string;
  };
}
