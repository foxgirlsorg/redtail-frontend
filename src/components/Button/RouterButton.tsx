'use client';

import { useRouter } from 'next/navigation';
import { Btn } from './Button';
import React from "react";

interface rBtnProps {
  text: string;
  location: string;
  iconSrc?: string;
}

export const RouterButton = ({text, location, iconSrc}: rBtnProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(location);
  };

  return (
      <Btn onClickAction={handleClick} iconSrc={iconSrc} text={text} />
  );
}
