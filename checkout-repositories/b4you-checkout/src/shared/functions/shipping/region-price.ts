import { iOffer } from "@/interfaces/offer";

type RegionType = {
  name: string;
  abbreviation: keyof Pick<iOffer, "shipping_by_region">["shipping_by_region"];
  ranges: number[][];
};

const regioes: RegionType[] = [
  {
    name: "Norte",
    abbreviation: "no",
    ranges: [
      [66000000, 68899999], // Pará
      [68900000, 68999999], // Amapá
      [69000000, 69299999], // Amazonas 1
      [69300000, 69399999], // Roraima
      [69400000, 69899999], // Amazonas 2
      [69900000, 69999999], // Acre
      [76800000, 76999999], // Rondônia
      [77000000, 77999999], // Tocantins
    ],
  },
  {
    name: "Nordeste",
    abbreviation: "ne",
    ranges: [
      [40000000, 48999999], // Bahia
      [49000000, 49999999], // Sergipe
      [50000000, 56999999], // Pernambuco
      [57000000, 57999999], // Alagoas
      [58000000, 58999999], // Paraíba
      [59000000, 59999999], // Rio Grande do Norte
      [60000000, 63999999], // Ceará
      [64000000, 64999999], // Piauí
      [65000000, 65999999], // Maranhão
    ],
  },
  {
    name: "Centro-Oeste",
    abbreviation: "co",
    ranges: [
      [70000000, 72799999], // Distrito Federal 1
      [72800000, 72999999], // Goiás 1
      [73000000, 73699999], // Distrito Federal 2
      [73700000, 76799999], // Goiás 2
      [78000000, 78899999], // Mato Grosso
      [79000000, 79999999], // Mato Grosso do Sul
    ],
  },
  {
    name: "Sudeste",
    abbreviation: "so",
    ranges: [
      [0, 19999999], // São Paulo
      [20000000, 28999999], // Rio de Janeiro
      [29000000, 29999999], // Espírito Santo
      [30000000, 39999999], // Minas Gerais
    ],
  },
  {
    name: "Sul",
    abbreviation: "su",
    ranges: [
      [80000000, 87999999], // Paraná
      [88000000, 89999999], // Santa Catarina
      [90000000, 99999999], // Rio Grande do Sul
    ],
  },
];

interface iParams {
  offerData: iOffer;
  zipcode: string;
}

type iResponse = number | null;

export function shippingPriceByRegion(params: iParams): iResponse {
  const { offerData, zipcode } = params;

  if (!Boolean(zipcode)) return null;

  const rawZipcode = zipcode.replace(/\D/g, "");

  if (rawZipcode.length !== 8) {
    return null;
  }

  let abbr:
    | keyof Pick<iOffer, "shipping_by_region">["shipping_by_region"]
    | null = null;

  for (const region of regioes) {
    for (const ranges of region.ranges) {
      if (Number(rawZipcode) >= ranges[0] && Number(rawZipcode) <= ranges[1]) {
        abbr = region.abbreviation;
        break;
      }
    }
  }

  return abbr ? offerData.shipping_by_region[abbr] ?? null : null;
}
