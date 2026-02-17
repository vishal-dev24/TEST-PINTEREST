import { useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import PageLoader from "../components/PageLoader";

const AppWrapper = ({ children }) => {
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const prevPath = useRef(location.pathname);

    useEffect(() => {
        const authRoutes = ["/login", "/register"];

        const isAuthToAuth =
            authRoutes.includes(prevPath.current) &&
            authRoutes.includes(location.pathname);

        if (!isAuthToAuth) {
            setLoading(true);

            const timer = setTimeout(() => {
                setLoading(false);
            }, 600);

            return () => clearTimeout(timer);
        }

        prevPath.current = location.pathname;
    }, [location]);

    useEffect(() => {
        prevPath.current = location.pathname;
    }, [location.pathname]);

    return (
        <>
            {loading && <PageLoader />}
            {children}
        </>
    );
};

export default AppWrapper;
