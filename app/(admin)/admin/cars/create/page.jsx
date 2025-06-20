import AddCarForm from "../_components/add-car-form";

export const metadata = {
  title: "Add New Car | Vehiql Admin",
  description: "Add a new car to your marketplace",
};
const AddCarPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Car</h1>
      <AddCarForm />
    </div>
  );
};
export default AddCarPage;
