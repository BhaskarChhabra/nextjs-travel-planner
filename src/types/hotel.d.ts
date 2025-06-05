// export interface HotelType {
//   id: number;
//   name: string;
//   image: string;
//   price: number;
//   jobId: number;
//   location: number;
//   scrappedOn: string;
// }

// update HotelType.ts
export interface HotelType {
  id: number;
  name: string;
  image: string;
  price: number;
  jobId: number;
  location: string; // 👈 changed to string
  scrappedOn: string;
}

