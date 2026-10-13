import type { Metadata } from "next";
import OrderForm from "./order-form";

export const metadata: Metadata = {
  title: "Order food",
  description: "Choose your menu items and submit an order request to Strata Sa’o Bitsa.",
};

export default function OrderPage() {
  return <OrderForm />;
}
