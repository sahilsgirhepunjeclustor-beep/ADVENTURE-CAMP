
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const transactions = [
  {
    name: "Aarav Mehta",
    tx: "TX-58213",
    paymentMethod: "Visa .. 4421",
    amount: "$1240",
    status: "Success",
  },
  {
    name: "Sara Lin",
    tx: "TX-58212",
    paymentMethod: "Apple Pay",
    amount: "$890",
    status: "Pending",
  },
  {
    name: "Diego Alvarez",
    tx: "TX-58211",
    paymentMethod: "Mastercard .. 9912",
    amount: "$2150",
    status: "Success",
  },
  {
    name: "Mei Chen",
    tx: "TX-58210",
    paymentMethod: "Visa .. 1180",
    amount: "$740",
    status: "Refunded",
  },
  {
    name: "Layla Hassan",
    tx: "TX-58209",
    paymentMethod: "Stripe Link",
    amount: "$980",
    status: "Failed",
  },
];

export function RecentTransactions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <p className="text-sm text-muted-foreground">
          Last 24 hours - $48,238 processed
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.tx}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/01.png" alt="Avatar" />
                  <AvatarFallback>
                    {transaction.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{transaction.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.tx} &middot; {transaction.paymentMethod}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{transaction.amount}</p>
                <Badge
                  className={`${
                    transaction.status === "Success"
                      ? "bg-green-100 text-green-800"
                      : transaction.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : transaction.status === "Refunded"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {transaction.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
