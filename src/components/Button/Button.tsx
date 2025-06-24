'use client';
import React from 'react';
import { IonIcon } from '../IonIcon';
import styles from './Button.module.css';

interface BtnProps {
    text: string;
    onClickAction: (event: React.MouseEvent<HTMLButtonElement>) => void;
    iconSrc?: string;
    style?: React.CSSProperties;
    textStyle?: React.CSSProperties;
    iconStyle?: React.CSSProperties;
    disabled?: boolean;
}

export const Btn: React.FC<BtnProps> = ({
                                     text,
                                     onClickAction,
                                     iconSrc,
                                     style,
                                     textStyle,
                                     iconStyle,
                                     disabled = false,
                                 }) => {
    return (
        <button
            className={`${styles.btn} ${disabled ? styles.btn_disabled : ''}`}
            onClick={onClickAction}
            disabled={disabled}
            style={style}
        >
            <span className="btn_text" style={textStyle}>
            {text}
            </span>
            {iconSrc && (
                <IonIcon
                    src={iconSrc}
                    className={styles.btn_icon}
                    style={iconStyle}
                ></IonIcon>
            )}
        </button>
    );
};
