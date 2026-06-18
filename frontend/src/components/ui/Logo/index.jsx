import logo from "../../../assets/imagens/GIPAR-LOGO.png";

function paraCss(valor) {
  if (valor === undefined || valor === null) {
    return undefined;
  }

  return typeof valor === "number" ? `${valor}px` : valor;
}

export default function Logo({
  largura,
  altura = 96,
  tamanho,
  className = "",
  alt = "GIPAR",
}) {
  const style = {};

  if (tamanho !== undefined) {
    style.width = paraCss(tamanho);
    style.height = paraCss(tamanho);
  } else {
    if (largura !== undefined) {
      style.width = paraCss(largura);
    }

    if (altura !== undefined) {
      style.height = paraCss(altura);
    }

    if (largura !== undefined && altura === undefined) {
      style.height = "auto";
    }

    if (altura !== undefined && largura === undefined) {
      style.width = "auto";
    }
  }

  return (
    <img
      src={logo}
      alt={alt}
      style={style}
      className={`block object-contain max-w-full ${className}`.trim()}
    />
  );
}
