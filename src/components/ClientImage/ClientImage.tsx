'use client';

import React from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
export const ClientImage = ({ src, preview }: { src: string; preview: string }) => (
    <PhotoProvider>
        <PhotoView src={src}>
            <img src={preview} alt="" />
        </PhotoView>
    </PhotoProvider>
);
