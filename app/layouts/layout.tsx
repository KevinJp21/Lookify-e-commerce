import { ReactNode } from "react";
import NavBar from "./navbar/NavBar";
import Footer from "./footer/Footer";
import './layout.css'
interface LayoutProps {
  children: ReactNode;
}
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <NavBar />
      <main className="ContainerMain">
        {children}
      </main>
      <Footer />
    </>

  );
}

export default Layout;