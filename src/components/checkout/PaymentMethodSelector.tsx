import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Truck, Landmark, PhoneCall } from "lucide-react";

export type PaymentMethod = "card" | "cash" | "bank";

interface PaymentMethodSelectorProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
}

const BANK_DETAILS = {
  bank: "Zenith Bank",
  accountName: "Food Ordering App Ltd",
  accountNumber: "1234567890",
};

const USSD_DETAILS = {
  code: "*966*000*1234567890#",
  instructions: "Dial the code above on your mobile phone to pay via USSD."
};

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ paymentMethod, setPaymentMethod }) => (
  <Card className="bg-transparent border-0 p-0">
    <CardHeader className="pb-2 bg-transparent border-0">
      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
        Payment Method
      </CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <RadioGroup
        value={paymentMethod}
        onValueChange={setPaymentMethod}
        className="space-y-4"
      >
        <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 font-medium text-base transition-all duration-150">
          <RadioGroupItem value="card" />
          <CreditCard className="w-6 h-6 text-orange-500" />
          <span>Credit/Debit Card</span>
        </label>
        <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 font-medium text-base transition-all duration-150">
          <RadioGroupItem value="cash" />
          <Truck className="w-6 h-6 text-orange-500" />
          <span>Cash on Delivery</span>
        </label>
        <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 font-medium text-base transition-all duration-150">
          <RadioGroupItem value="bank" />
          <Landmark className="w-6 h-6 text-orange-500" />
          <span>Bank Transfer</span>
        </label>
      </RadioGroup>
      {paymentMethod === "bank" && (
        <div className="mt-4 p-4 rounded-xl bg-orange-50 dark:bg-gray-800 border border-orange-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
          <div className="font-semibold mb-1">Bank Transfer Details:</div>
          <div>Bank: <span className="font-bold">{BANK_DETAILS.bank}</span></div>
          <div>Account Name: <span className="font-bold">{BANK_DETAILS.accountName}</span></div>
          <div>Account Number: <span className="font-bold">{BANK_DETAILS.accountNumber}</span></div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">Please transfer the total amount and use your order ID as the payment reference.</div>
        </div>
      )}
    </CardContent>
  </Card>
);

export default PaymentMethodSelector; 