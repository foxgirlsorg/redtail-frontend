'use client';
import styles from "./GoBackBtn.module.css";
import {IonIcon} from "@/components/IonIcon";
import React from "react";
import {useRouter} from "next/navigation";

export const GoBackBtn = () => {
    const router = useRouter();

    const handleClick = () => {
        router.push("/");
    };
    return (
        <div className={styles.goBackBtn} onClick={handleClick}>
            <IonIcon src="/icons/arrow-back-outline.svg"></IonIcon>
        </div>
    )
}