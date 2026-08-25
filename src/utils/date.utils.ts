export const generateMsTimeString = () => new Date().toLocaleTimeString(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  fractionalSecondDigits: 3,
  hour12: false
});