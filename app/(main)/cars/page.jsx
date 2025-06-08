import { getCarFilters } from "../../../actions/car-listing";
import { CarFilters } from "./_components/car-filter";
import CarListing from "./_components/car-listing";

export const metadata = {
  title: "Cars | Vehiql",
  description: "Browse and search for your dream car",
};

const CarsPage = async () => {
  const filteredData = await getCarFilters();
  return (
    <div className="mx-auto px-4 py-12 container">
      <h1 className="text-6xl mb-4 gradient-title">Browse Cars</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-80 flex-shrink-0">
          {/* FILTERS */}
          <CarFilters filters={filteredData.data} />
        </div>

        <div className="flex-1">
          {/* LISTING */}
          <CarListing />
        </div>
      </div>
    </div>
  );
};
export default CarsPage;
