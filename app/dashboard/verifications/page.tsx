// "use client";

// import { Card, CardContent } from "../../components/ui/Card";
// import {
//   Users,
//   CheckCircle2,
//   XCircle,
//   Clock,
//   Search,
//   Phone,
//   Mail,
//   MapPin,
//   CreditCard,
//   UserCheck,
//   AlertCircle,
// } from "lucide-react";
// import { useEffect, useMemo, useState } from "react";
// import { useUser } from "../UserContext";
// import { createClient } from "../../lib/supabase/client";

// /* ---------------- Types ---------------- */

// type VerificationStatus = "pending" | "approved" | "rejected";

// type Member = {
//   id: number;
//   name: string;
//   father_name: string | null;
//   cnic: string;
//   number: string | null;
//   email: string | null;
//   address: string | null;
//   created_at: string;
//   verification_status: VerificationStatus;
// };

// type FilterType = "pending" | "approved" | "rejected" | "all";

// /* ---------------- Filter tabs ---------------- */

// const filters: {
//   key: FilterType;
//   label: string;
//   icon: React.ReactNode;
//   color: string;
// }[] = [
//   {
//     key: "pending",
//     label: "Pending",
//     icon: <Clock className="w-4 h-4" />,
//     color: "text-amber-700 bg-amber-50 border-amber-200",
//   },
//   {
//     key: "approved",
//     label: "Approved",
//     icon: <CheckCircle2 className="w-4 h-4" />,
//     color: "text-green-700 bg-green-50 border-green-200",
//   },
//   {
//     key: "rejected",
//     label: "Rejected",
//     icon: <XCircle className="w-4 h-4" />,
//     color: "text-red-700 bg-red-50 border-red-200",
//   },
//   {
//     key: "all",
//     label: "All",
//     icon: <Users className="w-4 h-4" />,
//     color: "text-gray-700 bg-gray-50 border-gray-200",
//   },
// ];

// /* ---------------- Page ---------------- */

// export default function VerificationPage() {
//   const user = useUser();
//   const supabase = useMemo(() => createClient(), []);

//   const [members, setMembers] = useState<Member[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState<FilterType>("pending");
//   const [search, setSearch] = useState("");
//   const [actionLoading, setActionLoading] = useState<string | null>(null);
//   const [counts, setCounts] = useState({
//     pending: 0,
//     approved: 0,
//     rejected: 0,
//     all: 0,
//   });

//   /* ---------- Fetch members ---------- */
//   const fetchMembers = async () => {
//     setLoading(true);
//     let query = supabase
//       .from("User")
//       .select(
//         "id, name, father_name, cnic, number, email, address, created_at, verification_status"
//       )
//       .eq("role", "member")
//       .order("created_at", { ascending: false });

//     if (filter !== "all") query = query.eq("verification_status", filter);

//     const { data, error } = await query;
//     if (error) {
//       console.error("Fetch members error:", error);
//       setMembers([]);
//     } else {
//       setMembers((data as Member[]) ?? []);
//     }
//     setLoading(false);
//   };

//   /* ---------- Fetch tab counts ---------- */
//   const fetchCounts = async () => {
//     const statuses: VerificationStatus[] = ["pending", "approved", "rejected"];
//     const results = await Promise.all(
//       statuses.map((s) =>
//         supabase
//           .from("User")
//           .select("id", { count: "exact", head: true })
//           .eq("role", "member")
//           .eq("verification_status", s)
//       )
//     );
//     const [pending, approved, rejected] = results.map((r) => r.count ?? 0);
//     setCounts({
//       pending,
//       approved,
//       rejected,
//       all: pending + approved + rejected,
//     });
//   };

//   useEffect(() => {
//     fetchCounts();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => {
//     fetchMembers();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filter]);

//   /* ---------- Update status ---------- */
//   const updateStatus = async (
//     member: Member,
//     newStatus: VerificationStatus
//   ) => {
//     setActionLoading(`${member.id}-${member.cnic}`);
//     const { error } = await supabase
//       .from("User")
//       .update({ verification_status: newStatus })
//       .eq("id", member.id)
//       .eq("cnic", member.cnic); // composite PK

//     if (error) {
//       alert("Failed to update: " + error.message);
//     } else {
//       // If we're viewing a filtered list and the item no longer matches, remove it.
//       if (filter !== "all" && newStatus !== filter) {
//         setMembers((prev) => prev.filter((m) => m.id !== member.id));
//       } else {
//         setMembers((prev) =>
//           prev.map((m) =>
//             m.id === member.id ? { ...m, verification_status: newStatus } : m
//           )
//         );
//       }
//       fetchCounts();
//     }
//     setActionLoading(null);
//   };

//   /* ---------- Admin guard ---------- */
//   if (user?.role !== "admin") {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
//         <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
//           <AlertCircle className="w-8 h-8 text-red-500" />
//         </div>
//         <h2 className="text-xl font-semibold text-gray-800">Access Denied</h2>
//         <p className="text-gray-500 mt-2 text-sm max-w-sm">
//           Only administrators can access the verification panel. Contact your
//           trust administrator if you believe this is a mistake.
//         </p>
//       </div>
//     );
//   }

//   /* ---------- Search filter ---------- */
//   const visibleMembers = members.filter((m) => {
//     if (!search.trim()) return true;
//     const q = search.toLowerCase();
//     return (
//       m.name.toLowerCase().includes(q) ||
//       m.cnic.includes(q) ||
//       (m.email ?? "").toLowerCase().includes(q) ||
//       (m.number ?? "").includes(q)
//     );
//   });

//   /* ---------- Status badge ---------- */
//   const badge = (status: VerificationStatus) => {
//     const map: Record<VerificationStatus, string> = {
//       pending: "bg-amber-50 text-amber-700 border-amber-200",
//       approved: "bg-green-50 text-green-700 border-green-200",
//       rejected: "bg-red-50 text-red-700 border-red-200",
//     };
//     const icon: Record<VerificationStatus, React.ReactNode> = {
//       pending: <Clock className="w-3.5 h-3.5" />,
//       approved: <CheckCircle2 className="w-3.5 h-3.5" />,
//       rejected: <XCircle className="w-3.5 h-3.5" />,
//     };
//     return (
//       <span
//         className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${map[status]}`}
//       >
//         {icon[status]}
//         {status.charAt(0).toUpperCase() + status.slice(1)}
//       </span>
//     );
//   };

//   /* ---------------- Render ---------------- */

//   return (
//     <div className="space-y-6">
//       {/* ---------- Header ---------- */}
//       <div className="bg-gradient-to-r from-[#2c6e49]/10 to-green-50/50 rounded-2xl p-6 border border-[#2c6e49]/10">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div>
//             <h2 className="text-2xl font-bold text-[#2c6e49] flex items-center gap-2">
//               <UserCheck className="w-7 h-7" />
//               Member Verification
//             </h2>
//             <p className="text-gray-600 mt-1">
//               Review new member registrations and approve or reject them.
//             </p>
//           </div>
//           <div className="relative w-full md:w-72">
//             <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
//             <input
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search by name, CNIC, email..."
//               className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-green-100 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#2c6e49]/30"
//             />
//           </div>
//         </div>
//       </div>

//       {/* ---------- Filter tabs ---------- */}
//       <div className="flex flex-wrap gap-2">
//         {filters.map((f) => {
//           const active = filter === f.key;
//           return (
//             <button
//               key={f.key}
//               onClick={() => setFilter(f.key)}
//               className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition ${
//                 active
//                   ? "bg-[#2c6e49] text-white border-[#2c6e49] shadow"
//                   : `${f.color} hover:opacity-90`
//               }`}
//             >
//               {f.icon}
//               {f.label}
//               <span
//                 className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
//                   active ? "bg-white/20 text-white" : "bg-white text-gray-600"
//                 }`}
//               >
//                 {counts[f.key]}
//               </span>
//             </button>
//           );
//         })}
//       </div>

//       {/* ---------- Content ---------- */}
//       {loading ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//           {[1, 2, 3].map((i) => (
//             <Card key={i} className="border-0 shadow-sm animate-pulse">
//               <CardContent className="p-6 h-48 bg-gray-50 rounded-xl" />
//             </Card>
//           ))}
//         </div>
//       ) : visibleMembers.length === 0 ? (
//         <Card className="border-0 shadow-sm">
//           <CardContent className="p-12 text-center">
//             <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-4">
//               <CheckCircle2 className="w-8 h-8 text-[#2c6e49]" />
//             </div>
//             <h3 className="text-lg font-semibold text-gray-800">
//               No {filter === "all" ? "" : filter} members
//             </h3>
//             <p className="text-gray-500 mt-1 text-sm">
//               {search
//                 ? "Try a different search term."
//                 : "You're all caught up! Nothing to review here."}
//             </p>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//           {visibleMembers.map((member) => {
//             const busy = actionLoading === `${member.id}-${member.cnic}`;
//             return (
//               <Card
//                 key={`${member.id}-${member.cnic}`}
//                 className="border-0 shadow-sm hover:shadow-md transition-all duration-300"
//               >
//                 <CardContent className="p-6 flex flex-col h-full">
//                   {/* Header */}
//                   <div className="flex items-start justify-between mb-4">
//                     <div className="flex items-center gap-3">
//                       <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2c6e49] to-green-600 flex items-center justify-center text-white font-bold text-lg">
//                         {member.name.charAt(0).toUpperCase()}
//                       </div>
//                       <div>
//                         <h3 className="font-semibold text-gray-800 leading-tight">
//                           {member.name}
//                         </h3>
//                         <p className="text-xs text-gray-500">
//                           s/o {member.father_name || "—"}
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="mb-4">
//                     {badge(member.verification_status)}
//                   </div>

//                   {/* Info */}
//                   <div className="space-y-2.5 text-sm text-gray-700 flex-1">
//                     <InfoRow
//                       icon={<CreditCard className="w-4 h-4 text-[#2c6e49]" />}
//                       value={member.cnic}
//                     />
//                     <InfoRow
//                       icon={<Phone className="w-4 h-4 text-[#2c6e49]" />}
//                       value={member.number || "—"}
//                     />
//                     <InfoRow
//                       icon={<Mail className="w-4 h-4 text-[#2c6e49]" />}
//                       value={member.email || "—"}
//                     />
//                     <InfoRow
//                       icon={<MapPin className="w-4 h-4 text-[#2c6e49]" />}
//                       value={member.address || "—"}
//                     />
//                   </div>

//                   <p className="text-xs text-gray-400 mt-4">
//                     Applied {new Date(member.created_at).toLocaleDateString()}
//                   </p>

//                   {/* Actions */}
//                   <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
//                     {member.verification_status !== "approved" && (
//                       <button
//                         disabled={busy}
//                         onClick={() => updateStatus(member, "approved")}
//                         className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#2c6e49] hover:bg-[#245738] disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition"
//                       >
//                         <CheckCircle2 className="w-4 h-4" />
//                         Approve
//                       </button>
//                     )}
//                     {member.verification_status !== "rejected" && (
//                       <button
//                         disabled={busy}
//                         onClick={() => updateStatus(member, "rejected")}
//                         className="flex-1 inline-flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition"
//                       >
//                         <XCircle className="w-4 h-4" />
//                         Reject
//                       </button>
//                     )}
//                     {member.verification_status !== "pending" && (
//                       <button
//                         disabled={busy}
//                         onClick={() => updateStatus(member, "pending")}
//                         className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium p-2 rounded-lg transition"
//                         title="Move back to pending"
//                       >
//                         <Clock className="w-4 h-4" />
//                       </button>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

// /* ---------------- Helper ---------------- */

// function InfoRow({ icon, value }: { icon: React.ReactNode; value: string }) {
//   return (
//     <div className="flex items-start gap-2">
//       <span className="mt-0.5 shrink-0">{icon}</span>
//       <span className="text-gray-700 break-all">{value}</span>
//     </div>
//   );
// }
































































// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { Card, CardContent } from "../../components/ui/Card";
// import {
//   Users,
//   CheckCircle2,
//   XCircle,
//   Clock,
//   Search,
//   Phone,
//   Mail,
//   MapPin,
//   CreditCard,
//   UserCheck,
//   AlertCircle,
// } from "lucide-react";
// import { useUser } from "../UserContext";
// import { createClient } from "../../lib/supabase/client";

// /* ---------------- Types ---------------- */

// type VerificationStatus = "pending" | "verified" | "declined";
// type FilterType = "pending" | "verified" | "declined" | "all";

// type Member = {
//   id: number;
//   name: string;
//   father_name: string | null;
//   cnic: string;
//   number: string | null;
//   email: string | null;
//   address: string | null;
//   created_at: string;
//   verification_status: VerificationStatus;
// };

// const filters: {
//   key: FilterType;
//   label: string;
//   icon: React.ReactNode;
//   color: string;
// }[] = [
//   {
//     key: "pending",
//     label: "Pending",
//     icon: <Clock className="w-4 h-4" />,
//     color: "text-amber-700 bg-amber-50 border-amber-200",
//   },
//   {
//     key: "verified",
//     label: "Verified",
//     icon: <CheckCircle2 className="w-4 h-4" />,
//     color: "text-green-700 bg-green-50 border-green-200",
//   },
//   {
//     key: "declined",
//     label: "Declined",
//     icon: <XCircle className="w-4 h-4" />,
//     color: "text-red-700 bg-red-50 border-red-200",
//   },
//   {
//     key: "all",
//     label: "All",
//     icon: <Users className="w-4 h-4" />,
//     color: "text-gray-700 bg-gray-50 border-gray-200",
//   },
// ];

// /* ---------------- Page ---------------- */

// export default function VerificationPage() {
//   const user = useUser();
//   const supabase = useMemo(() => createClient(), []);

//   const [members, setMembers] = useState<Member[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState<FilterType>("pending");
//   const [search, setSearch] = useState("");
//   const [actionLoading, setActionLoading] = useState<string | null>(null);
//   const [counts, setCounts] = useState({
//     pending: 0,
//     verified: 0,
//     declined: 0,
//     all: 0,
//   });

//   /* ---------- Fetch members ---------- */
//   const fetchMembers = async () => {
//     setLoading(true);
//     let query = supabase
//       .from("User")
//       .select(
//         "id, name, father_name, cnic, number, email, address, created_at, verification_status"
//       )
//       .eq("role", "member")
//       .order("created_at", { ascending: false });

//     if (filter !== "all") query = query.eq("verification_status", filter);

//     const { data, error } = await query;
//     if (error) {
//       console.error("Fetch error:", error);
//       setMembers([]);
//     } else {
//       setMembers((data as Member[]) ?? []);
//     }
//     setLoading(false);
//   };

//   /* ---------- Counts ---------- */
//   const fetchCounts = async () => {
//     const statuses: VerificationStatus[] = ["pending", "verified", "declined"];
//     const results = await Promise.all(
//       statuses.map((s) =>
//         supabase
//           .from("User")
//           .select("id", { count: "exact", head: true })
//           .eq("role", "member")
//           .eq("verification_status", s)
//       )
//     );
//     const [pending, verified, declined] = results.map((r) => r.count ?? 0);
//     setCounts({
//       pending,
//       verified,
//       declined,
//       all: pending + verified + declined,
//     });
//   };

//   useEffect(() => {
//     fetchCounts();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => {
//     fetchMembers();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filter]);

//   /* ---------- Update status ---------- */
//   const updateStatus = async (
//     member: Member,
//     newStatus: VerificationStatus
//   ) => {
//     setActionLoading(`${member.id}-${member.cnic}`);
//     const { error } = await supabase
//       .from("User")
//       .update({ verification_status: newStatus })
//       .eq("id", member.id)
//       .eq("cnic", member.cnic);

//     if (error) {
//       alert("Update failed: " + error.message);
//     } else {
//       if (filter !== "all" && newStatus !== filter) {
//         setMembers((prev) => prev.filter((m) => m.id !== member.id));
//       } else {
//         setMembers((prev) =>
//           prev.map((m) =>
//             m.id === member.id ? { ...m, verification_status: newStatus } : m
//           )
//         );
//       }
//       fetchCounts();
//     }
//     setActionLoading(null);
//   };

//   /* ---------- Admin guard ---------- */
//   if (user?.role !== "admin") {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
//         <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
//         <h2 className="text-lg font-semibold text-gray-800">Access Denied</h2>
//         <p className="text-gray-500 text-sm mt-1">
//           Only administrators can access the verification panel.
//         </p>
//       </div>
//     );
//   }

//   /* ---------- Search ---------- */
//   const visibleMembers = members.filter((m) => {
//     if (!search.trim()) return true;
//     const q = search.toLowerCase();
//     return (
//       m.name.toLowerCase().includes(q) ||
//       m.cnic.includes(q) ||
//       (m.email ?? "").toLowerCase().includes(q) ||
//       (m.number ?? "").includes(q)
//     );
//   });

//   /* ---------- Badge ---------- */
//   const badge = (s: VerificationStatus) => {
//     const map: Record<VerificationStatus, string> = {
//       pending: "bg-amber-50 text-amber-700 border-amber-200",
//       verified: "bg-green-50 text-green-700 border-green-200",
//       declined: "bg-red-50 text-red-700 border-red-200",
//     };
//     const icon: Record<VerificationStatus, React.ReactNode> = {
//       pending: <Clock className="w-3.5 h-3.5" />,
//       verified: <CheckCircle2 className="w-3.5 h-3.5" />,
//       declined: <XCircle className="w-3.5 h-3.5" />,
//     };
//     return (
//       <span
//         className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${map[s]}`}
//       >
//         {icon[s]}
//         {s.charAt(0).toUpperCase() + s.slice(1)}
//       </span>
//     );
//   };

//   /* ---------------- Render ---------------- */

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-[#2c6e49]/10 to-green-50/50 rounded-2xl p-6 border border-[#2c6e49]/10">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div>
//             <h2 className="text-2xl font-bold text-[#2c6e49] flex items-center gap-2">
//               <UserCheck className="w-7 h-7" />
//               Member Verification
//             </h2>
//             <p className="text-gray-600 mt-1">
//               Review new member registrations and verify or decline them.
//             </p>
//           </div>
//           <div className="relative w-full md:w-72">
//             <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
//             <input
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search by name, CNIC, email..."
//               className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-green-100 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#2c6e49]/30"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="flex flex-wrap gap-2">
//         {filters.map((f) => {
//           const active = filter === f.key;
//           return (
//             <button
//               key={f.key}
//               onClick={() => setFilter(f.key)}
//               className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition ${
//                 active
//                   ? "bg-[#2c6e49] text-white border-[#2c6e49] shadow"
//                   : `${f.color} hover:opacity-90`
//               }`}
//             >
//               {f.icon}
//               {f.label}
//               <span
//                 className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
//                   active ? "bg-white/20 text-white" : "bg-white text-gray-600"
//                 }`}
//               >
//                 {counts[f.key]}
//               </span>
//             </button>
//           );
//         })}
//       </div>

//       {/* Cards */}
//       {loading ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {[1, 2, 3].map((i) => (
//             <Card key={i} className="border-0 shadow-sm animate-pulse">
//               <CardContent className="p-6 h-48 bg-gray-50 rounded-xl" />
//             </Card>
//           ))}
//         </div>
//       ) : visibleMembers.length === 0 ? (
//         <Card className="border-0 shadow-sm">
//           <CardContent className="p-10 text-center">
//             <div className="w-14 h-14 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-3">
//               <CheckCircle2 className="w-7 h-7 text-[#2c6e49]" />
//             </div>
//             <h4 className="font-semibold text-gray-800">
//               No {filter === "all" ? "" : filter} members
//             </h4>
//             <p className="text-gray-500 text-sm mt-1">
//               {search ? "Try a different search term." : "You're all caught up!"}
//             </p>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {visibleMembers.map((m) => {
//             const busy = actionLoading === `${m.id}-${m.cnic}`;
//             return (
//               <Card
//                 key={`${m.id}-${m.cnic}`}
//                 className="border-0 shadow-sm hover:shadow-md transition-all duration-300"
//               >
//                 <CardContent className="p-5 flex flex-col h-full">
//                   <div className="flex items-start justify-between mb-3">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2c6e49] to-green-600 flex items-center justify-center text-white font-bold">
//                         {m.name.charAt(0).toUpperCase()}
//                       </div>
//                       <div>
//                         <h4 className="font-semibold text-gray-800 leading-tight">
//                           {m.name}
//                         </h4>
//                         <p className="text-xs text-gray-500">
//                           s/o {m.father_name || "—"}
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="mb-3">{badge(m.verification_status)}</div>

//                   <div className="space-y-2 text-sm text-gray-700 flex-1">
//                     <Row
//                       icon={<CreditCard className="w-4 h-4 text-[#2c6e49]" />}
//                       text={m.cnic}
//                     />
//                     <Row
//                       icon={<Phone className="w-4 h-4 text-[#2c6e49]" />}
//                       text={m.number || "—"}
//                     />
//                     <Row
//                       icon={<Mail className="w-4 h-4 text-[#2c6e49]" />}
//                       text={m.email || "—"}
//                     />
//                     <Row
//                       icon={<MapPin className="w-4 h-4 text-[#2c6e49]" />}
//                       text={m.address || "—"}
//                     />
//                   </div>

//                   <p className="text-xs text-gray-400 mt-3">
//                     Applied {new Date(m.created_at).toLocaleDateString()}
//                   </p>

//                   {/* Actions */}
//                   <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
//                     {m.verification_status !== "verified" && (
//                       <button
//                         disabled={busy}
//                         onClick={() => updateStatus(m, "verified")}
//                         className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#2c6e49] hover:bg-[#245738] disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition"
//                       >
//                         <CheckCircle2 className="w-4 h-4" />
//                         Verify
//                       </button>
//                     )}
//                     {m.verification_status !== "declined" && (
//                       <button
//                         disabled={busy}
//                         onClick={() => updateStatus(m, "declined")}
//                         className="flex-1 inline-flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition"
//                       >
//                         <XCircle className="w-4 h-4" />
//                         Decline
//                       </button>
//                     )}
//                     {m.verification_status !== "pending" && (
//                       <button
//                         disabled={busy}
//                         onClick={() => updateStatus(m, "pending")}
//                         className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium p-2 rounded-lg transition"
//                         title="Move back to pending"
//                       >
//                         <Clock className="w-4 h-4" />
//                       </button>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

// /* ---------------- Helper ---------------- */

// function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
//   return (
//     <div className="flex items-start gap-2">
//       <span className="mt-0.5 shrink-0">{icon}</span>
//       <span className="text-gray-700 break-all">{text}</span>
//     </div>
//   );
// }









































"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { useUser } from "../UserContext";
import { createClient } from "../../lib/supabase/client";

/* ---------------- Types ---------------- */

type VerificationStatus = "pending" | "verified" | "declined";
type FilterType = "pending" | "verified" | "declined" | "all";

type Member = {
  id: number;
  name: string;
  father_name: string | null;
  cnic: string;
  number: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
  verification_status: VerificationStatus;
};

const filters: {
  key: FilterType;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    key: "pending",
    label: "Pending",
    icon: <Clock className="w-4 h-4" />,
    color: "text-amber-700 bg-amber-50 border-amber-200",
  },
  {
    key: "verified",
    label: "Verified",
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: "text-green-700 bg-green-50 border-green-200",
  },
  {
    key: "declined",
    label: "Declined",
    icon: <XCircle className="w-4 h-4" />,
    color: "text-red-700 bg-red-50 border-red-200",
  },
  {
    key: "all",
    label: "All",
    icon: <Users className="w-4 h-4" />,
    color: "text-gray-700 bg-gray-50 border-gray-200",
  },
];

/* ---------------- Page ---------------- */

export default function VerificationPage() {
  const user = useUser();
  const supabase = useMemo(() => createClient(), []);

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("pending");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [counts, setCounts] = useState({
    pending: 0,
    verified: 0,
    declined: 0,
    all: 0,
  });

  /* ---------- Fetch members ---------- */
  const fetchMembers = async () => {
    setLoading(true);
    let query = supabase
      .from("User")
      .select(
        "id, name, father_name, cnic, number, email, address, created_at, verification_status"
      )
      .eq("role", "member")
      .order("created_at", { ascending: false });

    if (filter !== "all") query = query.eq("verification_status", filter);

    const { data, error } = await query;
    if (error) {
      console.error("Fetch error:", error);
      setMembers([]);
    } else {
      setMembers((data as Member[]) ?? []);
    }
    setLoading(false);
  };

  /* ---------- Counts ---------- */
  const fetchCounts = async () => {
    const statuses: VerificationStatus[] = ["pending", "verified", "declined"];
    const results = await Promise.all(
      statuses.map((s) =>
        supabase
          .from("User")
          .select("id", { count: "exact", head: true })
          .eq("role", "member")
          .eq("verification_status", s)
      )
    );
    const [pending, verified, declined] = results.map((r) => r.count ?? 0);
    setCounts({
      pending,
      verified,
      declined,
      all: pending + verified + declined,
    });
  };

  useEffect(() => {
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  /* ---------- Update status ---------- */
  const updateStatus = async (
    member: Member,
    newStatus: VerificationStatus
  ) => {
    setActionLoading(`${member.id}-${member.cnic}`);
    const { error } = await supabase
      .from("User")
      .update({ verification_status: newStatus })
      .eq("id", member.id)
      .eq("cnic", member.cnic);

    if (error) {
      alert("Update failed: " + error.message);
    } else {
      if (filter !== "all" && newStatus !== filter) {
        setMembers((prev) => prev.filter((m) => m.id !== member.id));
      } else {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === member.id ? { ...m, verification_status: newStatus } : m
          )
        );
      }
      fetchCounts();
    }
    setActionLoading(null);
  };

  /* ---------- Admin guard ---------- */
  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-lg font-semibold text-gray-800">Access Denied</h2>
        <p className="text-gray-500 text-sm mt-1">
          Only administrators can access the verification panel.
        </p>
      </div>
    );
  }

  /* ---------- Search ---------- */
  const visibleMembers = members.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.cnic.includes(q) ||
      (m.email ?? "").toLowerCase().includes(q) ||
      (m.number ?? "").includes(q)
    );
  });

  /* ---------- Badge ---------- */
  const badge = (s: VerificationStatus) => {
    const map: Record<VerificationStatus, string> = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      verified: "bg-green-50 text-green-700 border-green-200",
      declined: "bg-red-50 text-red-700 border-red-200",
    };
    const icon: Record<VerificationStatus, React.ReactNode> = {
      pending: <Clock className="w-3.5 h-3.5" />,
      verified: <CheckCircle2 className="w-3.5 h-3.5" />,
      declined: <XCircle className="w-3.5 h-3.5" />,
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${map[s]}`}
      >
        {icon[s]}
        {s.charAt(0).toUpperCase() + s.slice(1)}
      </span>
    );
  };

  /* ---------------- Render ---------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2c6e49]/10 to-green-50/50 rounded-2xl p-6 border border-[#2c6e49]/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#2c6e49] flex items-center gap-2">
              <UserCheck className="w-7 h-7" />
              Member Verification
            </h2>
            <p className="text-gray-600 mt-1">
              Review new member registrations and verify or decline them.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, CNIC, email..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-green-100 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#2c6e49]/30"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition ${
                active
                  ? "bg-[#2c6e49] text-white border-[#2c6e49] shadow"
                  : `${f.color} hover:opacity-90`
              }`}
            >
              {f.icon}
              {f.label}
              <span
                className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                  active ? "bg-white/20 text-white" : "bg-white text-gray-600"
                }`}
              >
                {counts[f.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-sm animate-pulse">
              <CardContent className="p-6 h-48 bg-gray-50 rounded-xl" />
            </Card>
          ))}
        </div>
      ) : visibleMembers.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-10 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7 text-[#2c6e49]" />
            </div>
            <h4 className="font-semibold text-gray-800">
              No {filter === "all" ? "" : filter} members
            </h4>
            <p className="text-gray-500 text-sm mt-1">
              {search
                ? "Try a different search term."
                : "You're all caught up!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleMembers.map((m) => {
            const busy = actionLoading === `${m.id}-${m.cnic}`;
            return (
              <Card
                key={`${m.id}-${m.cnic}`}
                className="border-0 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2c6e49] to-green-600 flex items-center justify-center text-white font-bold">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 leading-tight">
                          {m.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          s/o {m.father_name || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">{badge(m.verification_status)}</div>

                  <div className="space-y-2 text-sm text-gray-700 flex-1">
                    <Row
                      icon={<CreditCard className="w-4 h-4 text-[#2c6e49]" />}
                      text={m.cnic}
                    />
                    <Row
                      icon={<Phone className="w-4 h-4 text-[#2c6e49]" />}
                      text={m.number || "—"}
                    />
                    <Row
                      icon={<Mail className="w-4 h-4 text-[#2c6e49]" />}
                      text={m.email || "—"}
                    />
                    <Row
                      icon={<MapPin className="w-4 h-4 text-[#2c6e49]" />}
                      text={m.address || "—"}
                    />
                  </div>

                  <p className="text-xs text-gray-400 mt-3">
                    Applied {new Date(m.created_at).toLocaleDateString()}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    {m.verification_status !== "verified" && (
                      <button
                        disabled={busy}
                        onClick={() => updateStatus(m, "verified")}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#2c6e49] hover:bg-[#245738] disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Verify
                      </button>
                    )}
                    {m.verification_status !== "declined" && (
                      <button
                        disabled={busy}
                        onClick={() => updateStatus(m, "declined")}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition"
                      >
                        <XCircle className="w-4 h-4" />
                        Decline
                      </button>
                    )}
                    {m.verification_status !== "pending" && (
                      <button
                        disabled={busy}
                        onClick={() => updateStatus(m, "pending")}
                        className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium p-2 rounded-lg transition"
                        title="Move back to pending"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- Helper ---------------- */

function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="text-gray-700 break-all">{text}</span>
    </div>
  );
}