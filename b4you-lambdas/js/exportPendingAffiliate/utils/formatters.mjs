const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/**
 * @param {string} value Ex: (100.53)
 */
export const formatBRL = (value) =>
  formatter.format(value).replace(/^(\D+)/, "$1");

export const capitalizeName = (name) => {
  if (!name) return "";
  name = name
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (capitalize) => capitalize.toUpperCase());

  const PreposM = ["Da", "De", "Do", "Das", "Dos", "A", "E"];
  const prepos = ["da", "de", "do", "das", "dos", "a", "e"];

  for (let i = PreposM.length - 1; i >= 0; i -= 1) {
    name = name.replace(
      RegExp(
        `\\b${PreposM[i].replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`,
        "g"
      ),
      prepos[i]
    );
  }

  return name;
};

export const formatDocument = (document) => {
  if (!document) throw new Error("document null or undefined");
  const type = document.length === 11 ? "CPF" : "CNPJ";
  if (type === "CPF")
    return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  return document.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    "$1.$2.$3/$4-$5"
  );
};

export const DOCUMENT = /[+\d-.]{11,14}$/;
