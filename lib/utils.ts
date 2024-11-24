export function canBeSlugized(value: string): boolean {
  return value.includes(" (");
}

// Stolen from Rails source code https://apidock.com/rails/ActiveSupport/Inflector/parameterize
export function slugize(str: string) {
  const separator = "-";
  return transliterate(str.split(" (")[0])
    .toLowerCase()
    .replace(/[^a-z0-9\-_]+/gi, separator)
    .replace(
      new RegExp(`${separator}{2,}|^${separator}|${separator}$`, "g"),
      ""
    );
}

function transliterate(str: string) {
  // Basic transliteration map for common accented characters
  // prettier-ignore
  const map: Record<string, string> = {
      á: "a", à: "a", ã: "a", â: "a", ä: "a",
      é: "e", è: "e", ê: "e", ë: "e",
      í: "i", ì: "i", î: "i", ï: "i", 
      ó: "o", ò: "o", õ: "o", ô: "o", ö: "o",
      ú: "u", ù: "u", û: "u", ü: "u",
      ý: "y", ÿ: "y", ñ: "n", ç: "c",
    };
  return str.replace(/[^\u0000-\u007E]/g, (c) => map[c] || c);
}
