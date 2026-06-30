import logoClaro from "../../../assets/imagens/LOGO-CLARO.png";

function paraCss(valor) {
  if (valor === undefined || valor === null) {
    return undefined;
  }

  return typeof valor === "number" ? `${valor}px` : valor;
}

export default function LogoClaro({
  largura,
  altura,
  tamanho,
  className = "",
  alt = "GIPAR",
}) {
  const style = {};

  if (tamanho !== undefined) {
    style.width = paraCss(tamanho);
    style.height = "auto";
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
      src={logoClaro}
      alt={alt}
      style={style}
      className={`block max-w-full object-contain ${className}`.trim()}
    />
  );
}
