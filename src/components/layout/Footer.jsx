function Footer() {

    console.log(import.meta.env.VITE_CORE_FRONT_BASE_URL);
    console.log(import.meta.env.VITE_CORE_API_BASE_URL);

    // fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/test`)
    // .then(res => res.json())
    // .then(data => console.log(data));

    return (
        <footer className="bg-gray-800 text-white w-full py-4">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <h2 className="text-2xl font-bold">Stock Note</h2>
                        </div>
                    </div>
                    <div className="flex space-x-6 text-sm">
                    
                        <div className="flex flex-col items-end">
                           이건학, 이미정, 한유림, 성수경, 백성현
                        </div>
                        <a href="https://github.com/BackEndSchoolPlus3th/StockNote" className="hover:underline">
                           [FE]Github
                        </a>
                        <a href="https://github.com/BackEndSchoolPlus3th/StockNote_BE" className="hover:underline">
                           [BE]Github
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer