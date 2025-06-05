'use client'
 
import { useRouter } from 'next/navigation'
// import { useRouter } from 'next/router';

import { useEffect } from "react";

const Admin = () => {
  const router = useRouter();
  useEffect(() => {
    router.push("/admin/dashboard");
  }, [router]);
  return null;
};

export default Admin;
