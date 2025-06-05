// "use client";
// import React, { useEffect, useState } from "react";
// import { apiClient } from "@/lib";
// import { USER_API_ROUTES, removeHtmlTags } from "@/utils";
// import {
//   FaCalendar,
//   FaCheck,
//   FaFacebook,
//   FaInstagram,
//   FaTwitter,
//   FaWhatsapp,
// } from "react-icons/fa";
// import { IoPerson, IoPricetag } from "react-icons/io5";

// import { Images } from "./components/images";
// import { Button, Input, Tab, Tabs } from "@heroui/react";
// import Image from "next/image";
// import { Iteniary } from "./components/Iteniary";
// import { useAppStore } from "@/store";
// import { useRouter } from "next/navigation";
// import { TripType } from "@/types/trip";

// export const TripClient = ({ tripId }: { tripId: string }) => {
//   const router = useRouter();
//   const { userInfo } = useAppStore();
//   const [tripData, setTripData] = useState<TripType | undefined>(undefined);
//   const [date, setDate] = useState(new Date());

//   useEffect(() => {
//     const getData = async () => {
//       try {
//         const data = await apiClient.get(
//           `${USER_API_ROUTES.TRIPDATA}?id=${tripId}`
//         );
//         setTripData(data.data);
//       } catch (err) {
//         console.log({ err });
//       }
//     };

//     getData();
//   }, [tripId]);

//   const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const newDate = event.target.value
//       ? new Date(event.target.value)
//       : new Date();
//     setDate(newDate);
//   };

//   const bookTrip = async () => {
//     const isoDate = date.toISOString();

//     const response = await apiClient.post(USER_API_ROUTES.CREATE_BOOKING, {
//       bookingId: tripData?.id,
//       bookingType: "trips",
//       userId: userInfo?.id,
//       taxes: 3300,
//       date: isoDate,
//     });
//     if (response.data.client_secret) {
//       router.push(`/checkout?client_secret=${response.data.client_secret}`);
//     }
//   };

//   return (
//     <div>
//       {/* JSX content here like images, booking button, etc. */}
//     </div>
//   );
// };
