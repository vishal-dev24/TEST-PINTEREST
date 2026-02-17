import React from "react";
import img from "../assets/pin.ico";

const PageLoader = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-[999]">
            <img
                src={img}
                alt="Loading"
                className="w-14 h-14 animate-pulse"
            />
        </div>
    );
};

export default PageLoader;
