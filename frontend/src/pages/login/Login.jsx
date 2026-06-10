
import logo from "../../assets/imagens/GIPAR-LOGO.jpg";

export default function Login() {
  return (
    <section className="h-screen w-full flex items-center justify-center">
        <div className=" w-1/3 h-2/4 bg-gray-200 rounded-lg shadow-lg flex flex-col items-center justify-around"> 
            <img src={logo} alt="Logo" />
            <form className="w-[200px] h-[150px] flex flex-col items-center justify-around gap-10">
                <input type="email" placeholder="Email" />
                <input type="password" placeholder="Password" />
                <button type="submit">Login</button>
            </form>
            <div>
                <a href="/register">Don't have an account? Register</a>
                <h2>exemplos de login:</h2>
                <p>Usuário: admin@example.com</p>
                <p>Senha: password</p>
            </div>
        </div>
      
    </section>
  );
}