import { useState, useEffect } from "react";
import { useNavigate, useParams } from "@remix-run/react";
import { useProductContext } from "~/hooks/ProductContext";
import LoadingSpinner from "~/components/loadingSpinner/loadingSpinner";
import ProductsHandle from "~/sections/productsHandle/ProductsHandle";
import { MetaFunction } from "@remix-run/react";
import { LinksFunction } from "@remix-run/node";
import { Product } from "~/api/GetAllProducts";

// Esta es la función `meta` por defecto si no se encuentra el producto
export const meta: MetaFunction = () => {
    const { products } = useProductContext();
    const { handle } = useParams();
    const product = products.find(product => product.handle === handle);
    return [
        { title: product ? `${product.title} | Olga Lucia Cortes` : "Olga Lucia Cortes | Productos" },
        { name: "description", content: `${product?.description}` },
        { name: "og:site_name", content: "Olga Lucia Cortes" },
        { name: "og:url", content: `https://olga-lucia-cortes.vercel.app/products/${product?.handle}` },
        { name: "og:title", content: `${product?.title}` },
        { name: "og:type", content: "product" },
        { name: "og:image", content: `${product?.images.edges[0].node.src}` },
        { name: "og:image:width", content: "1440" },
        { name: "og:image:height", content: "2160" },
        { name: "og:price:amount", content: `${product?.priceRange.minVariantPrice.amount}` },
        { name: "og:price:currency", content: `${product?.priceRange.minVariantPrice.currencyCode}` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${product?.title}` },
        { name: "twitter:description", content: `${product?.description}` }
    ];
};

export default function ProductDetail() {
    const { handle } = useParams();
    const { products } = useProductContext();
    const [loading, setLoading] = useState(true);
    const [productExists, setProductExists] = useState(true);

    const navigate = useNavigate();
    useEffect(() => {
        if (products.length > 0) {
            const product = products.find(product => product.handle === handle);
            if (!product) {
                setProductExists(false);
                navigate("/404"); // Redirigimos solo si el producto no existe
            }
            setLoading(false); // Terminamos de cargar una vez encontramos el producto
        }
    }, [products, handle, navigate]);

    if (loading) {
        return <LoadingSpinner isLoading={loading} />; // Indicamos que estamos esperando la carga de productos
    }

    if (!productExists) {
        return null;
    }

    const product = products.find(product => product.handle === handle);

    return (
        <ProductsHandle products={product as Product} />
    );
}