// import Pagination from "@/app/ui/invoices/pagination";
// import Search from "@/app/ui/search";
// import CustomersTable from '@/app/ui/customers/table';
// import { lusitana } from "@/app/ui/fonts";
// import { CustomersTableSkeleton } from "@/app/ui/skeletons";
// import { Suspense } from "react";
// import { fetchCustomers } from "@/app/lib/data";

// export default async function Page() {
//   const customers = await fetchCustomers();

//   return (
//     <div className="w-full">
//       <div className="flex w-full items-center justify-between">
//         <h1 className={`${lusitana.className} text-2xl`}>Customers</h1>
//       </div>
//       <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
//         <Search placeholder="Search Customers..." />
//       </div>
//       <Suspense fallback={<CustomersTableSkeleton />}>
//         <CustomersTable customers={customers} />
//       </Suspense>
//     </div>
//   );
// }

export default async function Page(){
  return <div>Ini Halaman Page</div>
}
