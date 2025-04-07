import Image from 'next/image';

export default function CustomersTable({
    customers,
}: {
    customers: {
        id: string;
        name: string;
        email: string;
        image_url: string;
        total_invoices: number;
        total_pending: string;
        total_paid: string;
    }[];
}) {
    return (
        <div className="mt-6 flow-root">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                    <table className="min-w-full text-gray-900">
                        <thead className="rounded-lg text-left text-sm font-normal">
                            <tr>
                                <th className="px-4 py-5">Name</th>
                                <th className="px-4 py-5">Email</th>
                                <th className="px-4 py-5 text-right">Total Invoices</th>
                                <th className="px-4 py-5 text-right">Total Pending</th>
                                <th className="px-4 py-5 text-right">Total Paid</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {customers.map((customer) => (
                                <tr
                                    key={customer.id}
                                    className="w-full border-b py-3 text-sm last-of-type:border-none"
                                >
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <Image
                                                src={customer.image_url}
                                                className="rounded-full"
                                                width={28}
                                                height={28}
                                                alt={`${customer.name}'s profile picture`}
                                            />
                                            <p>{customer.name}</p>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3">{customer.email}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right">
                                        {customer.total_invoices}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right">
                                        {customer.total_pending}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right">
                                        {customer.total_paid}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
