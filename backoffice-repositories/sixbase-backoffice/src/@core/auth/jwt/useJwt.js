// ** JWT Service Import
import JwtService from "./jwtService";

// ** Export Service as useJwt
export default function UseJwt(jwtOverrideConfig) {
  const jwt = new JwtService(jwtOverrideConfig);

  return {
    jwt,
  };
}
