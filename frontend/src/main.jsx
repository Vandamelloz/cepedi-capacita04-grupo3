import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import favicon from "./assets/imagens/GIPAR-LOGO.png"
import "./index.css"

const faviconLink = document.querySelector("link[rel='icon']") ?? document.createElement("link")
faviconLink.rel = "icon"
faviconLink.type = "image/png"
faviconLink.href = favicon
document.head.appendChild(faviconLink)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
